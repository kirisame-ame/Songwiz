import numpy as np
from mido import MidiFile
import os
from multiprocessing import Pool, cpu_count

# 1. Function to read melody from MIDI file with onset times
def extract_melody_from_midi(file_path, channel=0):
    """
    Extract pitches and onset times from the main melody track in a MIDI file.
    """
    midi = MidiFile(file_path)
    melody = []
    onset_times = []
    time_accum = 0

    for track in midi.tracks:
        for msg in track:
            time_accum += msg.time
            if not msg.is_meta:
                if msg.type == 'note_on' and msg.velocity > 0:
                    note = msg.note
                    onset_time = time_accum
                    melody.append(note)
                    onset_times.append(onset_time)
    return melody, onset_times

# 2. Normalize Pitch (relative to the first note for transposition invariance)
def normalize_pitch(pitch_sequence):
    """
    Normalize pitches relative to the first note.
    """
    if not pitch_sequence:
        return pitch_sequence

    first_note = pitch_sequence[0]
    return [pitch - first_note for pitch in pitch_sequence]

# 3. Normalize Time Intervals to eliminate tempo differences
def normalize_time_intervals(onset_times):
    """
    Calculate time intervals between notes and normalize them.
    """
    if len(onset_times) < 2:
        return [1]

    # Calculate time intervals (IOI)
    time_intervals = [onset_times[i+1] - onset_times[i] for i in range(len(onset_times)-1)]

    # Normalize time intervals
    mean_time_interval = np.mean(time_intervals)
    if mean_time_interval == 0:
        normalized_time_intervals = time_intervals
    else:
        normalized_time_intervals = [ti / mean_time_interval for ti in time_intervals]

    return normalized_time_intervals

# 4. Feature Extraction (ATB, RTB, FTB, and rhythm features)
def extract_features(pitch_sequence, time_intervals):
    """
    Extract ATB, RTB, FTB features from the normalized pitch sequence and rhythm features.
    """
    if not pitch_sequence:  # Handle empty input
        return np.zeros(128 + 255 + 255 + 25)  # Include rhythm features

    # Convert sequences to NumPy arrays for vectorization
    pitch_sequence = np.array(pitch_sequence)
    time_intervals = np.array(time_intervals)

    # ATB (Absolute Tone Based)
    atb_histogram = np.zeros(128)
    indices = pitch_sequence + 64  # Shift pitch range to positive indices
    valid_indices = (indices >= 0) & (indices < 128)
    indices = indices[valid_indices].astype(int)
    np.add.at(atb_histogram, indices, 1)
    atb_total = atb_histogram.sum()
    atb_histogram_normalized = atb_histogram / atb_total if atb_total else atb_histogram

    # RTB (Relative Tone Based)
    rtb_histogram = np.zeros(255)
    diffs = np.diff(pitch_sequence) + 127  # Shift to positive indices
    valid_diffs = (diffs >= 0) & (diffs < 255)
    diffs = diffs[valid_diffs].astype(int)
    np.add.at(rtb_histogram, diffs, 1)
    rtb_total = rtb_histogram.sum()
    rtb_histogram_normalized = rtb_histogram / rtb_total if rtb_total else rtb_histogram

    # FTB (First Tone Based)
    ftb_histogram = np.zeros(255)
    diffs = pitch_sequence - pitch_sequence[0] + 127  # Shift to positive indices
    valid_diffs = (diffs >= 0) & (diffs < 255)
    diffs = diffs[valid_diffs].astype(int)
    np.add.at(ftb_histogram, diffs, 1)
    ftb_total = ftb_histogram.sum()
    ftb_histogram_normalized = ftb_histogram / ftb_total if ftb_total else ftb_histogram

    # Combine all features into a single NumPy array
    return np.concatenate([atb_histogram_normalized, rtb_histogram_normalized,ftb_histogram_normalized])

# 5. Cosine Similarity Calculation
def calculate_cosine_similarity(vector1, vector2):
    """
    Calculate cosine similarity between two vectors.
    """
    # Replace NaN and infinite values
    vector1 = np.nan_to_num(vector1)
    vector2 = np.nan_to_num(vector2)
    norm1 = np.linalg.norm(vector1)
    norm2 = np.linalg.norm(vector2)
    if norm1 == 0 or norm2 == 0:
        return 0
    dot_product = np.dot(vector1, vector2)
    return dot_product / (norm1 * norm2)


# 6. Sliding Window Based on Number of Notes
def sliding_window(sequence, time_intervals, window_size, stride):
    """
    Sliding window based on the number of notes.
    """
    windows = []
    for i in range(0, len(sequence) - window_size + 1, stride):
        window_sequence = sequence[i:i + window_size]
        window_time_intervals = time_intervals[i:i + window_size - 1]  # time_intervals is one less
        windows.append((window_sequence, window_time_intervals))
    return windows

# 7. Process a Single MIDI File (Helper for Parallel Processing)
def process_single_midi(args):
    """
    Process a single MIDI file and extract features.
    """
    file_path, window_size, stride = args
    midi_file = os.path.basename(file_path)
    try:
        pitches, onset_times = extract_melody_from_midi(file_path)

        if not pitches or not onset_times:
            print(f"Warning: No valid melody data in {midi_file}. Skipping file.")
            return None, None

        # Convert onset_times from ticks to beats
        midi = MidiFile(file_path)
        ticks_per_beat = midi.ticks_per_beat
        if ticks_per_beat <= 0:
            print(f"Invalid ticks_per_beat in {midi_file}. Skipping file.")
            return None, None

        onset_times_beats = [t / ticks_per_beat for t in onset_times]

        # Normalize pitch
        normalized_pitches = normalize_pitch(pitches)

        # Normalize time intervals
        normalized_time_intervals = normalize_time_intervals(onset_times_beats)

        if not normalized_time_intervals:
            print(f"Warning: Not enough data in {midi_file} for time interval computation. Skipping file.")
            return None, None

        # Create sliding windows
        windows = sliding_window(normalized_pitches, normalized_time_intervals, window_size, stride)
        if not windows:
            print(f"Warning: No valid windows generated for {midi_file}. Skipping file.")
            return None, None

        # Extract features from each window
        features_list = []
        for window_sequence, window_time_intervals in windows:
            features = extract_features(window_sequence, window_time_intervals)
            features_list.append(features)

        return midi_file, np.array(features_list)

    except Exception as e:
        print(f"Error processing {midi_file}: {e}")
        return None, None

# 9. Function for Melody Matching with Vectorized Similarity Calculation
def rank_best_match(hummed_file, features_dict, window_size=20, stride=4):
    """
    Match the humming file with the database using sliding window and cosine similarity.
    """
    try:
        pitches, onset_times = extract_melody_from_midi(hummed_file)
    except Exception as e:
        print(f"Error reading humming file: {e}")
        return {}

    if not pitches or not onset_times:
        print("Humming file contains no melody.")
        return {}

    # Convert onset_times from ticks to beats
    midi = MidiFile(hummed_file)
    ticks_per_beat = midi.ticks_per_beat
    if ticks_per_beat <= 0:
        print(f"Invalid ticks_per_beat in {hummed_file}.")
        return {}

    onset_times_beats = [t / ticks_per_beat for t in onset_times]

    # Normalize pitch
    normalized_pitches = normalize_pitch(pitches)

    # Normalize time intervals
    normalized_time_intervals = normalize_time_intervals(onset_times_beats)

    if not normalized_time_intervals:
        print("Humming file has insufficient data for time interval computation.")
        return {}

    # Create sliding windows
    hummed_windows = sliding_window(normalized_pitches, normalized_time_intervals, window_size, stride)
    if not hummed_windows:
        print("No valid windows generated for humming.")
        return {}

    # Extract features from humming windows
    hummed_features_list = []
    for window_sequence, window_time_intervals in hummed_windows:
        features = extract_features(window_sequence, window_time_intervals)
        hummed_features_list.append(features)
    hummed_features_array = np.array(hummed_features_list)

    similarity_scores = {}

    # Compare with features in the database using vectorized operations
    for midi_file, features_array in features_dict.items():
        if features_array.size == 0:
            similarity_scores[midi_file] = 0.0
            continue
        # Compute cosine similarities between all pairs of humming and database features
        dot_products = np.dot(hummed_features_array, features_array.T)
        norms_hummed = np.linalg.norm(hummed_features_array, axis=1)[:, np.newaxis]
        norms_database = np.linalg.norm(features_array, axis=1)
        norms_product = norms_hummed * norms_database
        # Avoid division by zero and handle NaNs
        with np.errstate(divide='ignore', invalid='ignore'):
            cosine_similarities = np.where(norms_product != 0, dot_products / norms_product, 0)
            cosine_similarities = np.nan_to_num(cosine_similarities)
        max_score = np.max(cosine_similarities)
        if np.isnan(max_score) or np.isinf(max_score):
            max_score = 0.0
        similarity_scores[midi_file] = max_score
        print(f"{midi_file}: Max Similarity Score = {max_score:.4f}")

    # Sort results based on similarity scores
    ranked_results = dict(sorted(similarity_scores.items(), key=lambda item: item[1], reverse=True))

    return ranked_results