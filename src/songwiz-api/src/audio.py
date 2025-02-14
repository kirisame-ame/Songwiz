import os
import librosa
import numpy as np
from scipy.spatial.distance import euclidean
import pickle
import time

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

def process_file(file):
    """Process a single audio file to extract features."""
    print(f"[Worker PID {os.getpid()}] Processing file: {file}") 
    try:
        y, sr = librosa.load(file)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=12)
        mfcc_bin = np.array_split(mfcc,20,axis=1)
        return file, mfcc_bin
    except Exception as e:
        print(f"Error processing file: {file}, {e}")
        return file, None

def initializer():
        print(f"Worker PID {os.getpid()} initialized.")

def cache_audio_features(audio_dir, cache_dir):
    """Cache audio features for all files in the audio directory using multiprocessing."""
    print(f"Main PID: {os.getpid()} - Starting audio feature caching.")

    cache = load_cache(cache_dir)
    audio_files = [f for f in os.listdir(audio_dir) if f.lower().endswith(('.wav', '.mp3')) and f not in cache]

    start_time = time.time()

    for file in audio_files:
        filepath = os.path.join(audio_dir, file)
        _,cache[file] = process_file(filepath)

    save_cache(cache, cache_dir)

    end_time = time.time()
    caching_time = end_time - start_time
    print(f"Caching complete. Time taken: {caching_time:.2f} seconds.")

def rank_audio_files(reference_file,cache_dir):
    start_time = time.time()
    y1, sr1 = librosa.load(reference_file,duration=10)
    reference_features = librosa.feature.mfcc(y=y1, sr=sr1, n_mfcc=12)
    if reference_features is None:
        print("Gagal mengekstrak fitur dari file referensi.")
        return []
    distances = []
    cache = load_cache(cache_dir)
    max_distance = 0
    for file, features in cache.items():
        min_distance = float('inf')
        print(f"Calculating distance for {file}")
        local_distance = []
        if features is not None:
            for i in features:
            dis,_ = librosa.sequence.dtw(feat, i)
            local_distance.append(dis[-1,-1])
        min = np.min(local_distance)
        distances.append((file,min))
        if min > max_distance:
            max_distance = min
    distances = [(file, 1-distance/max_distance) for file, distance in distances]
    ranked_files = sorted(distances, key=lambda x: x[1],reverse=True)
    end_time = time.time()
    print(f"ranking complete. Time taken: {end_time - start_time:.2f} seconds.")
    return dict(ranked_files[:5])