import extract_database
import music

# Path ke folder database
# Example Usage
if __name__ == "__main__":
    # Path to the MIDI database folder
    midi_database_dir = "../midi_database"

    # Path to the humming MIDI file
    hummed_file = "../midi_testing/Dream_Police.1.mid"

    # Process the MIDI database with windowing
    features_dict = extract_database.process_midi_database(midi_database_dir)

    # Match the humming with the database
    results = music.rank_best_match(hummed_file, features_dict)

    # Print ranking results
    print("\nRanking Results:")
    for idx, (midi_file, score) in enumerate(results.items(), 1):
        print(f"{idx}. {midi_file} - Similarity Score: {score:.4f}")
