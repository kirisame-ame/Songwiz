import os
import pickle
import music
from multiprocessing import Pool, cpu_count

# Direktori untuk menyimpan cache fitur
FEATURE_CACHE_DIR = "feature_cache"

# Pastikan folder cache tersedia
os.makedirs(FEATURE_CACHE_DIR, exist_ok=True)

def get_feature_cache_path(file_path):
    """
    Mendapatkan path file cache berdasarkan nama file MIDI.
    """
    file_name = os.path.basename(file_path)
    file_name_no_ext = os.path.splitext(file_name)[0]
    return os.path.join(FEATURE_CACHE_DIR, f"{file_name_no_ext}.pkl")

def load_features_from_cache(file_path):
    """
    Memuat fitur dari cache jika tersedia.
    """
    cache_path = get_feature_cache_path(file_path)
    if os.path.exists(cache_path):
        with open(cache_path, "rb") as f:
            return pickle.load(f)
    return None

def save_features_to_cache(file_path, features):
    """
    Menyimpan fitur ke file cache.
    """
    cache_path = get_feature_cache_path(file_path)
    with open(cache_path, "wb") as f:
        pickle.dump(features, f)

def extract_features_with_cache(file_path, window_size=20, stride=4):
    """
    Ekstraksi fitur dari file MIDI dengan caching.
    """
    # Cek apakah fitur sudah ada di cache
    cached_features = load_features_from_cache(file_path)
    if cached_features is not None:
        return cached_features

    # Jika belum dicache, proses MIDI untuk mengekstraksi fitur
    midi_file, features_list = music.process_single_midi((file_path, window_size, stride))
    if features_list is not None:
        save_features_to_cache(file_path, features_list)
    return features_list

def cache_single_file(file_path, window_size, stride):
    """
    Proses caching untuk satu file MIDI.
    """
    return music.process_single_midi((file_path, window_size, stride))

def cache_single_file(args):
    """
    Proses caching untuk satu file MIDI.
    Argumen berupa tuple (file_path, window_size, stride).
    """
    file_path, window_size, stride = args
    return music.process_single_midi((file_path, window_size, stride))

def cache_all_features(midi_database_dir, window_size=20, stride=4):
    """
    Cache semua fitur dari file MIDI di direktori.
    """
    midi_files = [
        os.path.join(midi_database_dir, f)
        for f in os.listdir(midi_database_dir)
        if f.endswith(('.mid', '.midi'))
    ]

    files_to_process = []

    # Periksa apakah cache sudah ada untuk setiap file
    cache_paths = {file_path: get_feature_cache_path(file_path) for file_path in midi_files}
    files_to_process = [
        file_path for file_path, cache_path in cache_paths.items()
        if not os.path.exists(cache_path)
    ]


    # Proses hanya file yang belum memiliki cache
    if files_to_process:
        with Pool(processes=cpu_count()) as pool:
            # Bungkus setiap file dengan argumen tambahan
            args_list = [(file, window_size, stride) for file in files_to_process]
            pool.map(cache_single_file, args_list)

