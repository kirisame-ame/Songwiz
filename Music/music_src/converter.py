import tensorflow as tf
import os
from basic_pitch.inference import predict_and_save,predict, Model
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
from librosa import load

def convert_wav_to_midi(input_audio_path, output_directory):
    """
    Mengonversi file WAV ke MIDI dan menyimpannya di direktori output yang ditentukan.
    
    Parameters:
    - input_audio_path (str): Path ke file audio WAV.
    - output_directory (str): Path ke direktori tempat file MIDI akan disimpan.
    
    Returns:
    - midi_file_path (str): Path ke file MIDI yang dihasilkan.
    """
    # Pastikan direktori output ada
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    
    # Menjalankan prediksi dan menyimpan hasil konversi MIDI
    predict_and_save(
        input_audio_paths=[input_audio_path],
        output_directory=output_directory,
        save_midi=True,
        sonify_midi=False,  # Jangan sonify ke wav, hanya simpan MIDI
        save_model_outputs=False,  # Opsional, hanya simpan MIDI
        save_notes=False  # Opsional, simpan notes dalam format CSV
    )
    
    # Path ke file MIDI yang dihasilkan (file akan diberi nama yang sama dengan file audio)
    file_name = os.path.basename(input_audio_path).replace(".wav", ".mid")
    midi_file_path = os.path.join(output_directory, file_name)
    
    return midi_file_path

def convert_mp3_to_midi(input_audio_path, output_directory1):

    
    print(f"Directory {output_directory1} created.")
    basic_pitch_model = Model(ICASSP_2022_MODEL_PATH)
    predict_and_save(
    audio_path_list = [input_audio_path],
    output_directory = output_directory1,
    save_midi=True,
    sonify_midi=False,
    save_model_outputs=False,
    save_notes=False,
    model_or_model_path =basic_pitch_model
    )

    
    # Generate the path to the saved MIDI file (same name as the input but with .mid)
    file_name = os.path.basename(input_audio_path).replace(".mp3", ".mid")
    midi_file_path = os.path.join(output_directory1, file_name)
    
    return midi_file_path

# Contoh penggunaan
input_audio_path = "C:/Users/Owen/OneDrive/Documents/Owen/Algeo/folder dev tubes 2/music_src/Cruel_angel.mp3"
output_directory = "C:/Users/Owen/OneDrive/Documents/Owen/Algeo/folder dev tubes 2/music_src"

midi_file = convert_mp3_to_midi(input_audio_path, output_directory)
print(f"File MIDI telah disimpan di: {midi_file}")
