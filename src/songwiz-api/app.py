from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import os
import zipfile
import image_dataset_processor as img_processor

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
   
# Upload a .zip file and extract its contents
@app.route('/upload', methods=['POST'])
def upload_file():
   if 'file' not in request.files:
      return jsonify({'error': 'No file part'}), 400

   uploaded_file = request.files['file']

   if uploaded_file.filename == '':
      return jsonify({'error': 'No selected file'}), 400

   # Save the uploaded file
   file_path = os.path.join(TEMP_FOLDER, uploaded_file.filename)
   uploaded_file.save(file_path)

   # Check if it's a .zip file
   if not uploaded_file.filename.lower().endswith('.zip'):
      return jsonify({'error': 'Uploaded file is not a .zip archive'}), 400

   try:
      # Extract .zip files to designated folders
      extracted_files = extract_zip_by_type(file_path)
      return jsonify({'success': 'Files uploads', 'details': extracted_files}), 200
   except zipfile.BadZipFile:
      return jsonify({'error': 'Invalid zip file'}), 400
   finally:
      # Clean up the uploaded file
      if os.path.exists(file_path):
         os.remove(file_path)

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