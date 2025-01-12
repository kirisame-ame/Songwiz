import os
import pickle
import src.midi_music as music
from multiprocessing import Pool, cpu_count
import json
def get_feature_cache_path(file_path, cache_dir):
    """
    Mendapatkan path file cache berdasarkan nama file MIDI.
    """
    file_name = os.path.basename(file_path)
    file_name_no_ext = os.path.splitext(file_name)[0]
    return os.path.join(cache_dir, f"{file_name_no_ext}.pkl")

def load_features_from_cache(file_path, cache_dir):
    """
    Memuat fitur dari cache jika tersedia.
    """
    cache_path = get_feature_cache_path(file_path, cache_dir)
    if os.path.exists(cache_path):
        with open(cache_path, "rb") as f:
            return pickle.load(f)
    return None

def save_features_to_cache(file_path, features, cache_dir):
    """
    Menyimpan fitur ke file cache.
    """
    cache_path = get_feature_cache_path(file_path, cache_dir)
    print(cache_path)
    with open(cache_path, "wb") as f:
        pickle.dump(features, f)

def extract_features_with_cache(file_path, window_size=20, stride=4, cache_dir="feature_cache"):
    """
    Ekstraksi fitur dari file MIDI dengan caching.
    """
    # Cek apakah fitur sudah ada di cache
    cached_features = load_features_from_cache(file_path, cache_dir)
    if cached_features is not None:
        return cached_features

    # Jika belum dicache, proses MIDI untuk mengekstraksi fitur
    midi_file, features_list = music.process_single_midi((file_path, window_size, stride),cache_dir)
    if features_list is not None:
        save_features_to_cache(file_path, features_list, cache_dir)
    return features_list

def cache_single_file(args):
    """
    Proses caching untuk satu file MIDI.
    Argumen berupa tuple (file_path, window_size, stride, cache_dir).
    """
    file_path, window_size, stride, cache_dir = args
    return music.process_single_midi((file_path, window_size, stride),cache_dir)

def cache_all_features(midi_database_dir, window_size=20, stride=4, cache_dir="feature_cache"):
    """
    Cache semua fitur dari file MIDI di direktori.
    """
    print(cache_dir + "1 " + midi_database_dir)
    midi_files = [
        os.path.join(midi_database_dir, f)
        for f in os.listdir(midi_database_dir)
        if f.endswith(('.mid', '.midi'))
    ]

    files_to_process = []

    # Periksa apakah cache sudah ada untuk setiap file
    cache_paths = {file_path: get_feature_cache_path(file_path, cache_dir) for file_path in midi_files}
    files_to_process = [
        file_path for file_path, cache_path in cache_paths.items()
        if not os.path.exists(cache_path)
    ]

    # Proses hanya file yang belum memiliki cache
    if files_to_process:
        with Pool(processes=cpu_count()) as pool:
            # Bungkus setiap file dengan argumen tambahan
            args_list = [(file, window_size, stride, cache_dir) for file in files_to_process]
            pool.map(cache_single_file, args_list)
