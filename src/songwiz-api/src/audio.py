import os
import librosa
import numpy as np
import pickle
import time

from multiprocessing import Pool, cpu_count, get_context

# Direktori untuk menyimpan cache fitur

CACHE_FILE_NAME = 'audio_features_cache.pkl'

def load_cache(cache_dir):
    """Load the cached features from a pickle file."""
    cache_dir = os.path.join(cache_dir,CACHE_FILE_NAME)
    if os.path.exists(cache_dir):
        with open(cache_dir, 'rb') as f:
            return pickle.load(f)
    return {}

def save_cache(cache,cache_dir):
    """Save the cache dictionary to a pickle file."""
    cache_dir = os.path.join(cache_dir,CACHE_FILE_NAME)
    with open(cache_dir, 'wb') as f:
        pickle.dump(cache, f)

def compute_audio_features(file_path, cache):
    """Compute Chroma CENS features for a given audio file, with caching."""
    if file_path in cache:
        return cache[file_path]
    else:   
        print("features not found in cache")

def process_file(file):
    """Process a single audio file to extract features."""
    print(f"[Worker PID {os.getpid()}] Processing file: {file}")    
    try:
        y, sr = librosa.load(file, sr=None)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=12)
        mfcc_mean = np.mean(mfcc, axis=1)
        return file, mfcc_mean
    except Exception as e:
        print(f"Error processing file: {file}, {e}")
        return file, None

def initializer():
        print(f"Worker PID {os.getpid()} initialized.")

def cache_audio_features(audio_dir, cache_dir):
    """Cache audio features for all files in the audio directory using multiprocessing."""
    print(f"Main PID: {os.getpid()} - Starting audio feature caching.")

    cache = load_cache(cache_dir)
    audio_files = [os.path.join(audio_dir, f) for f in os.listdir(audio_dir) if f.lower().endswith(('.wav', '.mp3')) and f not in cache]

    start_time = time.time()

    for file in audio_files:
        _,cache[file] = process_file(file)

    save_cache(cache, cache_dir)

    end_time = time.time()
    caching_time = end_time - start_time
    print(f"Caching complete. Time taken: {caching_time:.2f} seconds.")




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

    

def rank_audio_files_dtw(reference_file,cache_dir):
    """
    Mengurutkan file audio berdasarkan jarak DTW.
    """
    _, reference_features = process_file(reference_file)
    if reference_features is None:
        print("Gagal mengekstrak fitur dari file referensi.")
        return []
    
    dtw_distances = []
    cache = load_cache(cache_dir)
    for file, features in cache.items():
        print(f"Calculating DTW distance for {file}")
        if features is not None:
            distance = dtw_distance(reference_features, features)
            print(f"DTW distance for {file}: {distance}")
            dtw_distances.append((file, distance))
    ranked_files = dict(sorted(dtw_distances, key=lambda x: x[1],reverse=True))
    return ranked_files