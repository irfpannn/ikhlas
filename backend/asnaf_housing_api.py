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
        image = Image.open(io.BytesIO(file.read()))
        # Resize to the input size expected by the model
        image = image.resize((224, 224))
        # Convert to array and normalize
        image_array = img_to_array(image)
        image_array = image_array / 255.0
        # Expand dimensions to match the model input shape
        image_array = np.expand_dims(image_array, axis=0)
        
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
        print(f"Error processing image: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
