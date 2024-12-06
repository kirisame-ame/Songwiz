import os
import librosa
import numpy as np

def extract_features(file_path):
    """
    Ekstraksi Chroma Features yang ditingkatkan dengan HPSS.
    """
    y, sr = librosa.load(file_path, sr=22050)
    y_harmonic, y_percussive = librosa.effects.hpss(y)
    
    chroma_harmonic = librosa.feature.chroma_stft(y=y_harmonic, sr=sr)
    chroma_percussive = librosa.feature.chroma_stft(y=y_percussive, sr=sr)
    
    chroma_mean = np.mean(chroma_harmonic, axis=1)
    chroma_std = np.std(chroma_harmonic, axis=1)
    
    return np.concatenate((chroma_mean, chroma_std))


def dtw_distance(reference_features, target_features):
    """
    Menghitung jarak DTW antara dua vektor fitur.
    """
    # Reshape untuk kompatibilitas DTW
    ref = reference_features.reshape(-1, 1)
    tgt = target_features.reshape(-1, 1)
    
    # Hitung DTW menggunakan Librosa
    distance, path = librosa.sequence.dtw(X=ref, Y=tgt, metric='euclidean')
    return distance[-1, -1]

def rank_audio_files_dtw(reference_file, audio_dir):
    """
    Mengurutkan semua file audio dalam direktori berdasarkan jarak DTW ke file referensi.
    """
    reference_features = extract_features(reference_file)
    audio_files = [f for f in os.listdir(audio_dir) if f.lower().endswith(('.wav', '.mp3'))]
    
    distances = []
    
    for file in audio_files:
        file_path = os.path.join(audio_dir, file)
        target_features = extract_features(file_path)
        distance = dtw_distance(reference_features, target_features)
        distances.append((file, distance))
    
    # Urutkan berdasarkan jarak DTW (semakin kecil semakin mirip)
    ranked_files = sorted(distances, key=lambda x: x[1])
    
    return ranked_files

# Contoh penggunaan:
if __name__ == "__main__":
    reference_file ="../wav_test/LilyTest.mp3"# Ganti dengan path yang benar
    audio_dir = "../wav_database"  # Ganti dengan path yang benar
    
    if not os.path.isfile(reference_file):
        print(f"File referensi tidak ditemukan: {reference_file}")
        exit(1)
    
    ranked_files = rank_audio_files_dtw(reference_file, audio_dir)
    
    print("Daftar Lagu yang Diranking berdasarkan DTW Distance:")
    for rank, (file, distance) in enumerate(ranked_files, start=1):
        print(f"{rank}. {file} - DTW Distance: {distance:.2f}")
