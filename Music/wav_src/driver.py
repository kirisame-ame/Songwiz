import os
import musicWav
import sys
import time  
import musicWav
# Abaikan stderr
sys.stderr = open(os.devnull, 'w')

if __name__ == "__main__":
    # File referensi dan direktori audio
    reference_file = "../wav_test/IndoTest.mp3"
    audio_dir = "../wav_database"
    
    # Proses caching fitur
    musicWav.cache_audio_features(audio_dir)
    
    start_time = time.time()
    # Proses ranking
    ranked_files = musicWav.rank_audio_files_dtw(reference_file, audio_dir)
    # Hitung waktu selesai
    end_time = time.time()
    elapsed_time = end_time - start_time
    
    # Tampilkan hasil ranking
    print("Daftar file audio yang diurutkan berdasarkan jarak DTW:")
    for rank, (file, distance) in enumerate(ranked_files, start=1):
        print(f"{rank}. {file} - DTW Distance: {distance:.2f}")
    print(f"\nWaktu yang dibutuhkan untuk menghitung ranking: {elapsed_time:.2f} detik")