"""
Asnaf Living Condition API - House Image Analysis Endpoint

This script provides an API endpoint to analyze images of rural houses
using the pre-trained rural_classifier.h5 model.
"""

import os
import io
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import requests # Add requests library for fetching URL

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Load the pre-trained model
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rural_classifier.h5')
print(f"Loading model from: {MODEL_PATH}")

model = load_model(MODEL_PATH)
print("Model loaded successfully")

# Define class mapping - must match the original training classes
CLASS_NAMES = ['baik', 'dhoif', 'sederhana']  # Ensure this matches your model's classes

def preprocess_image(image_bytes):
    """Helper function to preprocess image bytes."""
    image = Image.open(io.BytesIO(image_bytes))
    image = image.resize((224, 224))
    image_array = img_to_array(image)
    image_array = image_array / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

@app.route('/analyze-house', methods=['POST'])
def analyze_house():
    """
    API endpoint to analyze a house image and classify its condition.
    
    Expects: multipart/form-data with an 'image' field
    Returns: JSON with classification result and probabilities
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
        
    # Get the file from the request
    file = request.files['image']
    
    try:
        # Read and preprocess the image
        image_bytes = file.read()
        image_array = preprocess_image(image_bytes)
        
        # Get prediction
        predictions = model.predict(image_array)
        
        # Get the class with highest probability
        predicted_class_index = np.argmax(predictions[0])
        predicted_class = CLASS_NAMES[predicted_class_index]
        
        # Create a dictionary of class probabilities
        probabilities = {class_name: float(predictions[0][i]) for i, class_name in enumerate(CLASS_NAMES)}
        
        # Return the result
        return jsonify({
            'classification': predicted_class,
            'probabilities': probabilities
        })
        
    except Exception as e:
        print(f"Error processing uploaded image: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-house-url', methods=['POST'])
def analyze_house_url():
    """
    API endpoint to analyze a house image from a URL.
    
    Expects: JSON payload with an 'image_url' field
    Returns: JSON with classification result and probabilities
    """
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
        
    data = request.get_json()
    image_url = data.get('image_url')
    
    if not image_url:
        return jsonify({'error': 'No image_url provided'}), 400
        
    try:
        # Fetch the image from the URL
        print(f"Fetching image from URL: {image_url}")
        response = requests.get(image_url, stream=True)
        response.raise_for_status() # Raise an exception for bad status codes
        
        # Read image bytes
        image_bytes = response.content
        print(f"Image fetched successfully, size: {len(image_bytes)} bytes")

        # Preprocess the image using the helper function
        image_array = preprocess_image(image_bytes)
        print("Image preprocessed successfully")
        
        # Get prediction
        predictions = model.predict(image_array)
        print(f"Prediction raw output: {predictions}")
        
        # Get the class with highest probability
        predicted_class_index = np.argmax(predictions[0])
        predicted_class = CLASS_NAMES[predicted_class_index]
        print(f"Predicted class: {predicted_class} (Index: {predicted_class_index})")
        
        # Create a dictionary of class probabilities
        probabilities = {class_name: float(predictions[0][i]) for i, class_name in enumerate(CLASS_NAMES)}
        print(f"Probabilities: {probabilities}")
        
        # Return the result
        return jsonify({
            'classification': predicted_class,
            'probabilities': probabilities
        })
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching image from URL {image_url}: {str(e)}")
        return jsonify({'error': f'Failed to fetch image from URL: {str(e)}'}), 500
    except Exception as e:
        print(f"Error processing image from URL: {str(e)}")
        # Add more detailed logging for unexpected errors
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'An internal error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
