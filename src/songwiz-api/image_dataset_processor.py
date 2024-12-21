import os
import numpy as np
from PIL import Image
import json

def load_images_from_directory(image_database_dir, target_size=(64, 64)):
    """
    Load all images from a directory, resize them to a fixed size and convert them to grayscale.
    """
    images = []
    filenames = []
    for file in os.listdir(image_database_dir):
        if file.endswith(('.png', '.jpg', '.jpeg','.webp')):
            img_path = os.path.join(image_database_dir, file)
            img = Image.open(img_path).convert('L')  # Convert to grayscale
            img_resized = img.resize(target_size)   # Resize to target size
            images.append(np.array(img_resized).flatten())  # Flatten to 1D
            filenames.append(file)
    return np.array(images), filenames

def standardize_data(images):
    """
    Standardize image data by centering around the mean.
    """
    mean_image = np.mean(images, axis=0)
    return images - mean_image, mean_image

def calculate_pca(data, num_components):
    """
    Perform PCA using Singular Value Decomposition (SVD).
    """
    U, S, Vt = np.linalg.svd(data, full_matrices=False)
    principal_components = Vt[:num_components]
    return np.dot(data, principal_components.T), principal_components

def retrieve_similar_images(query_image, image_database_dir, num_pca_components=50, top_n=5, target_size=(64, 64), similarity_threshold=0):
    """
    Retrieve the most similar images to a query image based on PCA-reduced features,
    with an optional similarity threshold for filtering.
    """

    # Load precomputed data or compute it if necessary
        # Load and preprocess dataset images
    dataset_images, filenames = load_images_from_directory(image_database_dir, target_size)
    standardized_images, mean_image = standardize_data(dataset_images)

    # Perform PCA
    dataset_pca, principal_components = calculate_pca(standardized_images, num_pca_components)

    # Save precomputed data

    # Process query image
    query_image_obj = Image.open(query_image).convert('L')  # Convert to grayscale
    query_image_resized = query_image_obj.resize(target_size)  # Resize for consistency
    query_image_flat = np.array(query_image_resized).flatten()  # Flatten to 1D
    query_image_standardized = query_image_flat - mean_image  # Center the query image

    # Project query image onto PCA components
    query_image_pca = np.dot(query_image_standardized, principal_components.T)

    # Compute distances between query image and dataset images
    distances = np.linalg.norm(dataset_pca - query_image_pca, axis=1)
    max_distance = np.max(distances)

    # Convert distances to similarity rates
    similarity_rates = 1 - (distances / max_distance)

    # Filter out images that do not meet the similarity threshold
    filtered_results = [(filenames[i], similarity_rates[i]) for i in range(len(similarity_rates)) if similarity_rates[i] >= similarity_threshold]

    # Sort the filtered results by similarity and get top N
    top_indices = np.argsort([similarity for _, similarity in filtered_results])[-top_n:][::-1]
    result = {'similar_images':[{'filename':filtered_results[i][0], 'similarity':np.round(filtered_results[i][1],2)} for i in top_indices]}
    return json.dumps(result)

