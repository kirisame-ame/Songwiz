import os
import librosa
import numpy as np
import pickle
from multiprocessing import Pool, cpu_count

def get_feature_cache_path(file_path,cache_dir):
    """Generate path file cache berdasarkan nama file audio tanpa hash."""
    file_name = os.path.basename(file_path)  # Ambil nama file tanpa path
    file_name_no_ext = os.path.splitext(file_name)[0]  # Hapus ekstensi
    return os.path.join(cache_dir, f"{file_name_no_ext}.pkl")

def load_features_from_cache(file_path,cache_dir):
    """Load fitur dari cache jika tersedia."""
    cache_path = get_feature_cache_path(file_path,cache_dir)
    if os.path.exists(cache_path):
        with open(cache_path, "rb") as f:
            return pickle.load(f)
    return None

def save_features_to_cache(file_path, features,cache_dir):
    """Simpan fitur ke file cache."""
    cache_path = get_feature_cache_path(file_path,cache_dir)
    with open(cache_path, "wb") as f:
        pickle.dump(features, f)

def extract_features(file_path,cache_dir):
    """
    Ekstraksi Chroma Features yang ditingkatkan dengan HPSS, menggunakan cache.
    """
    # Cek apakah fitur sudah ada di cache
    cached_features = load_features_from_cache(file_path,cache_dir)
    if cached_features is not None:
        return cached_features

    try:
        # Ekstrak fitur jika tidak ada di cache
        y, sr = librosa.load(file_path, sr=22050, mono=True)
        y_harmonic, y_percussive = librosa.effects.hpss(y)
        chroma_harmonic = librosa.feature.chroma_stft(y=y_harmonic, sr=sr)
        chroma_mean = np.mean(chroma_harmonic, axis=1)
        chroma_std = np.std(chroma_harmonic, axis=1)
        features = np.concatenate((chroma_mean, chroma_std))

        # Simpan fitur ke cache
        save_features_to_cache(file_path, features,cache_dir)
        return features
    except Exception as e:
        print(f"Error extracting features from {file_path}: {e}")
        return None

def cache_audio_features(audio_dir,cache_dir):
    """
    Proses caching fitur untuk semua file di direktori audio.
    """
    audio_files = [
        os.path.join(audio_dir, f)
        for f in os.listdir(audio_dir)
        if f.lower().endswith(('.wav', '.mp3'))
    ]

    print(f"Caching fitur untuk {len(audio_files)} file audio...")
    for file in audio_files:
        cache_path = get_feature_cache_path(file,cache_dir)
        if os.path.exists(cache_path):
            print(f"Cache sudah ada untuk {file}. Melewati...")
            continue
        extract_features(file,cache_dir)
    print("Proses caching selesai.")


def dtw_distance(reference_features, target_features):
    """
    Menghitung jarak DTW antara dua vektor fitur.
    """
    try:
        ref = reference_features.reshape(-1, 1)
        tgt = target_features.reshape(-1, 1)
        distance, _ = librosa.sequence.dtw(X=ref, Y=tgt, metric='euclidean')
        return distance[-1, -1]
    except Exception as e:
        print(f"Error calculating DTW distance: {e}")
        return float('inf')

def process_file(args):
    """
    Proses file tunggal menggunakan multiprocessing.
    """
    (reference_features, file_path), cache_dir = args
    target_features = extract_features(file_path,cache_dir)
    if target_features is not None:
        distance = dtw_distance(reference_features, target_features)
        return (os.path.basename(file_path), distance)
    return None

def rank_audio_files_dtw(reference_file, audio_dir,cache_dir):
    """
    Mengurutkan file audio berdasarkan jarak DTW.
    """
    reference_features = extract_features(reference_file,cache_dir)
    if reference_features is None:
        print("Gagal mengekstrak fitur dari file referensi.")
        return []

    audio_files = [
        os.path.join(audio_dir, f)
        for f in os.listdir(audio_dir)
        if f.lower().endswith(('.wav', '.mp3'))
    ]

    pool = Pool(cpu_count())
    results = pool.map(process_file, [((reference_features, file), cache_dir) for file in audio_files])
    pool.close()
    pool.join()

    results = [res for res in results if res is not None]
    ranked_files = sorted(results, key=lambda x: x[1])
    return ranked_files
