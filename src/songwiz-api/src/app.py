from flask import Flask, send_from_directory, request, jsonify, render_template
from flask_cors import CORS
import os
import zipfile
import src.image_dataset_processor as img_processor

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
AUDIO_FOLDER = 'uploads/audio'
MID_FOLDER = 'uploads/midi'
IMG_FOLDER = 'uploads/img'
OTHER_FOLDER = 'uploads/other'
TEMP_FOLDER = 'uploads/temp'

# Ensure all directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)
os.makedirs(MID_FOLDER, exist_ok=True)
os.makedirs(IMG_FOLDER, exist_ok=True)
os.makedirs(OTHER_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

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

@app.route("/upload")
def upload():
    return render_template("upl.html")
# Upload a .zip file and extract its contents
@app.route('/upload', methods=['POST'])
def upload_file():
    # Extract chunk metadata
    chunk_index = request.form.get('chunk', type=int)
    total_chunks = request.form.get('totalChunks', type=int)
    file_name = request.form.get('name')

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    uploaded_file = request.files['file']

    # Ensure file name and chunk index are valid
    if not file_name or chunk_index is None or total_chunks is None:
        return jsonify({'error': 'Missing chunk metadata'}), 400

    # Save the chunk to a temporary folder
    chunk_file_path = os.path.join(TEMP_FOLDER, f"{file_name}.part{chunk_index}")
    uploaded_file.save(chunk_file_path)

    # If it's the last chunk, assemble all chunks
    if chunk_index == total_chunks - 1:
        assembled_file_path = os.path.join(TEMP_FOLDER, file_name)
        with open(assembled_file_path, 'wb') as assembled_file:
            for i in range(total_chunks):
                part_path = os.path.join(TEMP_FOLDER, f"{file_name}.part{i}")
                with open(part_path, 'rb') as part_file:
                    assembled_file.write(part_file.read())
                os.remove(part_path)  # Clean up the chunk file

        # Check if it's a .zip file
        if not file_name.lower().endswith('.zip'):
            os.remove(assembled_file_path)
            return jsonify({'error': 'Uploaded file is not a .zip archive'}), 400

        try:
            # Extract .zip files to designated folders
            extracted_files = extract_zip_by_type(assembled_file_path)
            os.remove(assembled_file_path)  # Clean up the uploaded file
            return jsonify({'success': 'Files uploaded', 'details': extracted_files}), 200
        except zipfile.BadZipFile:
            os.remove(assembled_file_path)
            return jsonify({'error': 'Invalid zip file'}), 400

    return jsonify({'success': f'Chunk {chunk_index + 1} uploaded successfully'}), 200

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


@app.route("/")
def hello_world():
   return "<p>This is the songwiz-api</p>"


@app.route("/check")
def check():
   return app.root_path

if __name__ == '__main__':
   app.run(host='localhost', port=5000)