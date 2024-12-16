import pygame

def play_midi_file(file_path):
    # Initialize the mixer for playing MIDI
    pygame.init()
    pygame.mixer.init()
    
    # Load and play the MIDI file
    try:
        pygame.mixer.music.load(file_path)
        pygame.mixer.music.play()
        print(f"Playing: {file_path}")
        
        # Wait until the music stops
        while pygame.mixer.music.get_busy():
            continue
    except pygame.error as e:
        print(f"Failed to play {file_path}: {e}")
    finally:
        pygame.mixer.quit()
        pygame.quit()

# Example usage
play_midi_file("../midi_testing/Its_Too_Late.2.mid")
