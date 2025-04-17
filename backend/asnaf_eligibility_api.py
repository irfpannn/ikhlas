from flask import Flask, request, jsonify
import pandas as pd
import os
import joblib
from family_assistance_model import predict_family_status
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/assess-eligibility', methods=['POST'])
def assess_eligibility():
    """
    API endpoint to assess if a potential asnaf qualifies for assistance
    using the trained machine learning model.
    
    Expected JSON input:
    {
        "monthly_income": 550,
        "family_members": 4,
        "has_stable_housing": 1,
        "access_to_clean_water": 0,
        "access_to_electricity": 0,
        "has_significant_health_issues": 0
    }
    """
    try:
        # Get data from request
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        # Validate required fields
        required_fields = [
            "monthly_income", 
            "family_members", 
            "has_stable_housing", 
            "access_to_clean_water", 
            "access_to_electricity", 
            "has_significant_health_issues"
        ]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Convert numeric fields to appropriate types
        for field in ["monthly_income", "family_members"]:
            data[field] = float(data[field])
        
        for field in ["has_stable_housing", "access_to_clean_water", "access_to_electricity", "has_significant_health_issues"]:
            data[field] = int(data[field])
        
        # Make prediction using the model from family_assistance_model.py
        prediction_results = predict_family_status(data)
        
        if not prediction_results:
            return jsonify({"error": "Error making prediction"}), 500
            
        # Return the prediction result
        return jsonify({
            "success": True,
            "result": prediction_results[0]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/batch-assess', methods=['POST'])
def batch_assess_eligibility():
    """
    API endpoint to assess multiple asnaf records at once.
    
    Expected JSON input:
    {
        "records": [
            {
                "monthly_income": 550,
                "family_members": 4,
                "has_stable_housing": 1,
                "access_to_clean_water": 0,
                "access_to_electricity": 0,
                "has_significant_health_issues": 0
            },
            {
                "monthly_income": 1200,
                "family_members": 2,
                "has_stable_housing": 1,
                "access_to_clean_water": 1,
                "access_to_electricity": 1,
                "has_significant_health_issues": 0
            }
        ]
    }
    """
    try:
        # Get data from request
        data = request.get_json()
        
        if not data or 'records' not in data or not isinstance(data['records'], list):
            return jsonify({"error": "Invalid data format. Expected 'records' array"}), 400
        
        # Validate and convert each record
        for record in data['records']:
            # Validate required fields
            required_fields = [
                "monthly_income", 
                "family_members", 
                "has_stable_housing", 
                "access_to_clean_water", 
                "access_to_electricity", 
                "has_significant_health_issues"
            ]
            
            for field in required_fields:
                if field not in record:
                    return jsonify({"error": f"Missing required field: {field} in one of the records"}), 400
            
            # Convert numeric fields to appropriate types
            for field in ["monthly_income", "family_members"]:
                record[field] = float(record[field])
            
            for field in ["has_stable_housing", "access_to_clean_water", "access_to_electricity", "has_significant_health_issues"]:
                record[field] = int(record[field])
            
        # Make predictions for all records
        prediction_results = predict_family_status(data['records'])
        
        if not prediction_results:
            return jsonify({"error": "Error making predictions"}), 500
            
        # Return the prediction results
        return jsonify({
            "success": True,
            "results": prediction_results
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/model-info', methods=['GET'])
def get_model_info():
    """
    API endpoint to get information about the current model.
    Returns metadata about the model, including accuracy, training date, and data sources.
    """
    try:
        # Check if model metadata file exists
        if not os.path.exists('model_metadata.json'):
            return jsonify({"error": "Model metadata not found"}), 404
            
        # Load model metadata
        import json
        with open('model_metadata.json', 'r') as f:
            model_metadata = json.load(f)
            
        # Return model information
        return jsonify({
            "success": True,
            "model_info": model_metadata
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/save-verified-data', methods=['POST'])
def save_verified_data_endpoint():
    """
    API endpoint to save verified family data to improve the model over time.
    
    Expected JSON input:
    {
        "family_data": {
            "monthly_income": 550,
            "family_members": 4,
            "has_stable_housing": 1,
            "access_to_clean_water": 0,
            "access_to_electricity": 0,
            "has_significant_health_issues": 0
        },
        "actual_eligibility": true
    }
    """
    try:
        # Get data from request
        data = request.get_json()
        
        if not data or 'family_data' not in data or 'actual_eligibility' not in data:
            return jsonify({"error": "Invalid data format. Expected 'family_data' and 'actual_eligibility'"}), 400
            
        # Import the save_verified_data function from family_assistance_model
        from family_assistance_model import save_verified_data
        
        # Save the verified data
        success = save_verified_data(
            family_data=data['family_data'],
            actual_eligibility=data['actual_eligibility']
        )
        
        if not success:
            return jsonify({"error": "Error saving verified data"}), 500
            
        # Return success response
        return jsonify({
            "success": True,
            "message": "Verified data saved successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/retrain-model', methods=['POST'])
def retrain_model_endpoint():
    """
    API endpoint to retrain the model with all available data.
    
    Expected JSON input:
    {
        "n_dummy_samples": 5000
    }
    """
    try:
        # Get data from request
        data = request.get_json() or {}
        
        # Get number of dummy samples to use (default to 5000)
        n_dummy_samples = data.get('n_dummy_samples', 5000)
        
        # Import the retrain_model_with_new_data function from family_assistance_model
        from family_assistance_model import retrain_model_with_new_data
        
        # Retrain the model
        success = retrain_model_with_new_data(n_dummy_samples=n_dummy_samples)
        
        if not success:
            return jsonify({"error": "Error retraining model"}), 500
            
        # Return success response
        return jsonify({
            "success": True,
            "message": "Model retrained successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) 