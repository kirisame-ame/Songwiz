from flask import Flask, send_from_directory, request, jsonify, render_template,make_response
from flask_cors import CORS
import os
import uuid
import zipfile
import logging as log
import src.image_dataset_processor as img_processor
import src.midi_cache as midi_cache
import src.midi_music as midi_music
import src.audio as audio

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
AUDIO_FOLDER = 'uploads/audio'
MID_FOLDER = 'uploads/midi'
IMG_FOLDER = 'uploads/img'
OTHER_FOLDER = 'uploads/other'
TEMP_FOLDER = 'uploads/temp'
FINAL_FOLDER = 'uploads/final'
CACHE_FOLDER = 'uploads/cache'
MIDI_CACHE_FOLDER = 'uploads/cache/midi'
AUDIO_CACHE_FOLDER = 'uploads/cache/audio'

# Ensure all directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)
os.makedirs(MID_FOLDER, exist_ok=True)
os.makedirs(IMG_FOLDER, exist_ok=True)
os.makedirs(OTHER_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)
os.makedirs(CACHE_FOLDER, exist_ok=True)
os.makedirs(MIDI_CACHE_FOLDER, exist_ok=True)
os.makedirs(AUDIO_CACHE_FOLDER, exist_ok=True)


# Serve the files from the upload folder
@app.route("/fetch/<folder>/<file>")
def fetch(folder, file):
   folder_path = None

   if folder == "audio":
      folder_path = os.path.abspath(AUDIO_FOLDER)
   elif folder == "midi":
      folder_path = os.path.abspath(MID_FOLDER)
   elif folder == "img":
      folder_path = os.path.abspath(IMG_FOLDER)
   if folder_path:
        file_path = os.path.join(folder_path, file)
        if os.path.exists(file_path):
            return send_from_directory(folder_path, file)
        else:
            return {"error": "File not found"}, 404
   else:
      return {"error": "Invalid folder"}, 400

# Upload a .zip file and extract its contents
@app.route('/upload', methods=['POST'])
def initiate_upload():
   """
   Handles the initial POST request to generate a unique transfer ID.
   """
   file = request.files['file']

   save_path = os.path.join(TEMP_FOLDER, file.filename)
   current_chunk = int(request.form['dzchunkindex'])

   # If the file already exists it's ok if we are appending to it,
   # but not if it's new file that would overwrite the existing one
   if os.path.exists(save_path) and current_chunk == 0:
      # 400 and 500s will tell dropzone that an error occurred and show an error
      return make_response(('File already exists', 400))

   try:
      with open(save_path, 'ab') as f:
         f.seek(int(request.form['dzchunkbyteoffset']))
         f.write(file.stream.read())
   except OSError:
      # log.exception will include the traceback so we can see what's wrong 
      log.exception('Could not write to file')
      return make_response(("Not sure why,"
                           " but we couldn't write the file to disk", 500))

   total_chunks = int(request.form['dztotalchunkcount'])

   if current_chunk + 1 == total_chunks:
      # This was the last chunk, the file should be complete and the size we expect
      if os.path.getsize(save_path) != int(request.form['dztotalfilesize']):
         log.error(f"File {file.filename} was completed, "
                     f"but has a size mismatch."
                     f"Was {os.path.getsize(save_path)} but we"
                     f" expected {request.form['dztotalfilesize']} ")
         return make_response(('Size mismatch', 500))
      else:
         try:
            extract_zip_by_type(save_path)
         finally:
            os.remove(save_path)
            log.info(f'File {file.filename} has been uploaded successfully')
   else:
      log.debug(f'Chunk {current_chunk + 1} of {total_chunks} '
               f'for file {file.filename} complete')
   return make_response(("Chunk upload successful", 200))

@app.route('/process', methods=['POST'])
def process_upload():
   # Process the uploaded files   
   try:
      # Process the uploaded files
      # midi caching
      midi_cache.cache_all_features(MID_FOLDER, MIDI_CACHE_FOLDER)
      # audio caching
      audio.cache_audio_features(AUDIO_FOLDER,AUDIO_CACHE_FOLDER)
      return jsonify({'success': 'Files processed successfully'}), 200
   except Exception as e:
      return jsonify({'error': str(e)}), 400
       
def extract_zip_by_type(zip_path):
   """Extract files from a .zip archive into separate folders based on file types."""
   extracted_files = {'audio': [], 'midi': [], 'img': [], 'other': []}

   with zipfile.ZipFile(zip_path, 'r') as zip_ref:
      for file_name in zip_ref.namelist():
         # Skip directories
         if file_name.endswith('/'):
               continue

         # Determine the file type and extract to the appropriate folder
         file_extension = os.path.splitext(file_name)[1].lower()
         file_base_name = os.path.basename(file_name)
         if file_extension == '.mp3' or file_extension == '.wav' or file_extension == '.m4a':
               target_folder = AUDIO_FOLDER
               extracted_files['audio'].append(file_base_name)
         elif file_extension == '.mid' or file_extension == '.midi':
               target_folder = MID_FOLDER
               extracted_files['midi'].append(file_base_name)
         elif file_extension == '.jpg' or file_extension == '.jpeg' or file_extension == '.png' or file_extension == '.webp':
               target_folder = IMG_FOLDER
               extracted_files['img'].append(file_base_name)
         else:
               target_folder = OTHER_FOLDER
               extracted_files['other'].append(file_base_name)

         # Extract the file
         target_path = os.path.join(target_folder, file_base_name)
         with zip_ref.open(file_name) as source, open(target_path, 'wb') as target:
            target.write(source.read())

   return extracted_files

@app.route("/image-query", methods=['POST'])
def image_query():
   if 'file' not in request.files:
      return jsonify({'error': 'No file part'}), 400

   uploaded_file = request.files['file']
   print(request.files)
   print(uploaded_file)

   if uploaded_file.filename == '':
      return jsonify({'error': 'No selected file'}), 400

   original_filename = uploaded_file.filename
   # Save the uploaded file
   file_path = os.path.join(TEMP_FOLDER, original_filename)
   uploaded_file.save(file_path)
   print(original_filename)
   # Check if it's an image file
   if not original_filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
      if os.path.exists(file_path):
         os.remove(file_path)
      return jsonify({'error': 'Uploaded file is not an image'}), 400

   try:
      # Retrieve similar images
      similar_images = img_processor.retrieve_similar_images(file_path, IMG_FOLDER)
      return jsonify({'success': 'Image processed', 'similar_images': similar_images}), 200
   except Exception as e:
      return jsonify({'error': str(e)}), 400
   finally:
      # Clean up the uploaded file
      if os.path.exists(file_path):
         os.remove(file_path)

@app.route("/midi-query", methods=['POST'])
def midi_query():
   if 'file' not in request.files:
      return jsonify({'error': 'No file part'}), 400

   uploaded_file = request.files['file']
   print(request.files)
   print(uploaded_file)

   if uploaded_file.filename == '':
      return jsonify({'error': 'No selected file'}), 400

   original_filename = uploaded_file.filename
   # Save the uploaded file
   file_path = os.path.join(TEMP_FOLDER, original_filename)
   uploaded_file.save(file_path)
   print(original_filename)
   # Check if it's an image file
   if not original_filename.lower().endswith(('.mid', '.midi')):
      if os.path.exists(file_path):
         os.remove(file_path)
      return jsonify({'error': 'Uploaded file is not a midi file'}), 400

   try:
      window_size = 40
      stride = 8      
      database_features = midi_music.process_midi_database(MID_FOLDER, window_size,stride,MIDI_CACHE_FOLDER)
      ranked_results = midi_music.rank_best_match(file_path, database_features, window_size, stride, cache_dir=MIDI_CACHE_FOLDER)
      return jsonify(ranked_results), 200
   except Exception as e:
      return jsonify({'error': str(e)}), 400
   finally:
      # Clean up the uploaded file
      if os.path.exists(file_path):
         os.remove(file_path)

@app.route("/audio-query", methods=['POST'])
def audio_query():
   if 'file' not in request.files:
      return jsonify({'error': 'No file part'}), 400

   uploaded_file = request.files['file']
   print(request.files)
   print(uploaded_file)

   if uploaded_file.filename == '':
      return jsonify({'error': 'No selected file'}), 400

   original_filename = uploaded_file.filename
   # Save the uploaded file
   file_path = os.path.join(TEMP_FOLDER, original_filename)
   uploaded_file.save(file_path)
   print(original_filename)
   # Check if it's an image file
   if not original_filename.lower().endswith(('.mp3', '.wav', '.m4a')):
      if os.path.exists(file_path):
         os.remove(file_path)
      return jsonify({'error': 'Uploaded file is not an audio file'}), 400

   try:  
      ranked_results = audio.rank_audio_files_dtw(file_path, AUDIO_FOLDER,AUDIO_CACHE_FOLDER)
      return jsonify(ranked_results), 200
   except Exception as e:
      return jsonify({'error': str(e)}), 400
   finally:
      # Clean up the uploaded file
      if os.path.exists(file_path):
         os.remove(file_path)

@app.route("/")
def hello_world():
   return "<p>This is the songwiz-api</p>"


@app.route("/check")
def check():
   return app.root_path

if __name__ == '__main__':
   app.run(host='localhost', port=5000)