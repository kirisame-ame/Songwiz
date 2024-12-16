import midi_music as music
import midi_cache as cache
import numpy as np
import sys
import json

if __name__ == "__main__":
    midi_database_dir = sys.argv[1]
    cache_dir = sys.argv[2]
    # Path to the humming MIDI File
    hummed_file = sys.argv[3]

    window_size = 40
    stride = 8


    database_features = music.process_midi_database(midi_database_dir, window_size, stride, cache_dir)

    ranked_results = music.rank_best_match(hummed_file, database_features, window_size, stride, cache_dir= cache_dir)
    res = json.dumps(ranked_results)
    print(res)


