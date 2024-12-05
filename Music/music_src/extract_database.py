import numpy as np
from mido import MidiFile
import os
import music
from multiprocessing import Pool, cpu_count

def process_midi_database(midi_database_dir, window_size=20, stride=4):
    """
    Process all MIDI files in the database using sliding window for feature extraction.
    """
    database_features = {}
    midi_files = [os.path.join(midi_database_dir, f) for f in os.listdir(midi_database_dir) if f.endswith(('.mid', '.midi'))]

    # Prepare arguments for multiprocessing
    args_list = [(file_path, window_size, stride) for file_path in midi_files]

    # Use multiprocessing Pool to process files in parallel
    with Pool(processes=cpu_count()) as pool:
        results = pool.map(music.process_single_midi, args_list)

    # Collect results
    for midi_file, features_list in results:
        if midi_file and features_list is not None:
            database_features[midi_file] = features_list

    return database_features

