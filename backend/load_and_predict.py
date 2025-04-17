import joblib
import pandas as pd
import os

# Define the path to the saved model
MODEL_FILENAME = 'family_assistance_classifier.joblib'

# Define the expected feature columns (must match the training data)
FEATURE_COLUMNS = [
    "monthly_income", 
    "family_members", 
    "has_stable_housing", 
    "access_to_clean_water", 
    "access_to_electricity", 
    "has_significant_health_issues"
]

def load_model_and_predict(new_family_data):
    """Loads the saved model and predicts assistance need for new data."""
    
    if not os.path.exists(MODEL_FILENAME):
        print(f"Error: Model file not found at {MODEL_FILENAME}")
        return None

    print(f"Loading model from {MODEL_FILENAME}...")
    try:
        model = joblib.load(MODEL_FILENAME)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

    # Ensure input data is a DataFrame
    if isinstance(new_family_data, dict):
        family_df = pd.DataFrame([new_family_data])
    elif isinstance(new_family_data, list):
         family_df = pd.DataFrame(new_family_data)
    elif isinstance(new_family_data, pd.DataFrame):
        family_df = new_family_data
    else:
        print("Error: Input data must be a dictionary, list of dictionaries, or pandas DataFrame.")
        return None

    # Ensure the DataFrame has the correct columns in the correct order
    try:
        family_df = family_df[FEATURE_COLUMNS]
    except KeyError as e:
        print(f"Error: Input data missing required columns: {e}")
        return None
    except Exception as e:
         print(f"Error preparing input data: {e}")
         return None

    # --- Preprocessing (Example: Handle potential missing values if needed) ---
    # Apply the same preprocessing as done during training if necessary
    # For example, handling the school_attendance_rate placeholder:

    # --- Make Predictions ---
    print("Making predictions...")
    try:
        predictions = model.predict(family_df)
        probabilities = model.predict_proba(family_df) # Get probabilities [prob_class_0, prob_class_1]
    except Exception as e:
        print(f"Error during prediction: {e}")
        return None

    results = []
    for i, pred in enumerate(predictions):
        status = "Deserves Help" if pred == 1 else "Does Not Currently Qualify"
        probability_help = probabilities[i][1] # Probability of class 1
        results.append({
            "prediction": status,
            "probability_deserves_help": f"{probability_help:.2%}",
            "input_data": family_df.iloc[i].to_dict() 
        })
        
    return results

if __name__ == "__main__":
    # Example: Predict for a new family
    example_family = {
        "monthly_income": 550, 
        "family_members": 4, 
        "has_stable_housing": 1, 
        "access_to_clean_water": 0, # No clean water
        "access_to_electricity": 0, 
        "has_significant_health_issues": 0
    }

    prediction_results = load_model_and_predict(example_family)

    if prediction_results:
        for result in prediction_results:
            print("\n--- Prediction Result ---")
            print(f"  Prediction: {result['prediction']}")
            print(f"  Probability of Needing Help: {result['probability_deserves_help']}")
            # print(f"  Input Data: {result['input_data']}") # Uncomment to see details