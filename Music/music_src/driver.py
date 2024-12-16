import time
import music
import cache
import numpy as np

# Path ke folder database
# Example Usage
# Path ke folder database
# Example Usage
if __name__ == "__main__":
    # Path to the MIDI database folder
    midi_database_dir = "../midi_database"
    cache_dir = "feature_cache"
    # Path to the humming MIDI File
    hummed_file = "../midi_testing/CanonD_basic_pitch.midi"

    window_size = 40
    stride = 8

    start_time = time.time()
    start_time_caching = time.time()
    # # Step 1: Cache semua file MIDI di database
    # print("=== Langkah 1: Caching Semua File MIDI ===")
    cache.cache_all_features(midi_database_dir, window_size, stride , cache_dir= cache_dir)
    end_time_caching = time.time()

    # # Step 2: Memuat fitur dari cache dan memproses database
    # print("\n=== Langkah 2: Memuat Fitur dari Cache ===")
    database_features = music.process_midi_database(midi_database_dir, window_size, stride, cache_dir= cache_dir)

    # # Step 3: Ranking berdasarkan humming file
    # print("\n=== Langkah 3: Ranking Berdasarkan Humming File ===")
    ranked_results = music.rank_best_match(hummed_file, database_features, window_size, stride, cache_dir= cache_dir)
    end_time = time.time()

    duration = end_time - start_time
    duration_caching = end_time_caching - start_time_caching
    # Step 4: Tampilkan hasil ranking
    print("\n=== Hasil Ranking ===")
    if ranked_results:
        for rank, (midi_file, score) in enumerate(ranked_results.items(), start=1):
            print(f"{rank}. {midi_file}: Similarity Score = {score:.4f}")
    else:
        print("Tidak ada hasil pencocokan.")
    print(f"Duration: {duration:.4f} seconds")
    print(f"Duration Caching: {duration_caching:.4f} seconds")

