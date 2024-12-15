import time
from image import retrieve_similar_images

# Example Usage
if __name__ == "__main__":
    # Path to the image database directory
    image_database_dir = "../image_database"

    # Path to the query image
    query_image = "../image_testing/taylorswift.jpg"
    
    start_time = time.time()

    # Retrieve similar images
    similar_images = retrieve_similar_images(query_image, image_database_dir, num_pca_components=50, top_n=5)

    end_time = time.time()
    execution_time_ms = (end_time - start_time) * 1000

    # Display results
    print("Top Similar Images (with Similarity Rates):")
    for name, similarity in similar_images:
        print(f"{name}: {similarity:.2%}")

    print(f"Execution Time: {execution_time_ms:.2f} ms")
