\
# filepath: c:\\Users\\User\\yolo\\family_assistance_model.py
import pandas as pd
import numpy as np
import random
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import os
import json
from datetime import datetime
import time

# 1 & 3: Define Features (Implicitly) and Generate Dummy Data with Ranges
def generate_family_data(n_samples=5000):
    """Generate dummy data for families with specified ranges."""
    np.random.seed(42)
    data = []
    
    # Define realistic ranges and distributions
    income_options = np.concatenate([
        np.random.normal(loc=500, scale=150, size=int(n_samples * 0.6)), # Lower income majority
        np.random.normal(loc=1200, scale=300, size=int(n_samples * 0.3)), # Middle income
        np.random.normal(loc=2500, scale=500, size=int(n_samples * 0.1))  # Higher income minority
    ])
    np.random.shuffle(income_options)
    
    for i in range(n_samples):
        # --- Feature Generation ---
        # Monthly Income (MYR)
        monthly_income = max(100, round(income_options[i])) # Ensure minimum income
        
        # Family Members
        family_members = np.random.randint(1, 9) # Range 1 to 8 members
        
        # Housing Stability (0: Unstable, 1: Stable)
        # More likely unstable if income is very low
        housing_prob = 0.2 + (monthly_income / 3000) * 0.7 
        has_stable_housing = 1 if random.random() < min(0.9, housing_prob) else 0
        
        # Access to Clean Water (0: No, 1: Yes)
        water_prob = 0.3 + (monthly_income / 2500) * 0.6
        access_to_clean_water = 1 if random.random() < min(0.95, water_prob) else 0
        
        # Access to Electricity (0: No, 1: Yes)
        electricity_prob = 0.4 + (monthly_income / 2000) * 0.55
        access_to_electricity = 1 if random.random() < min(0.98, electricity_prob) else 0
        
        # REMOVED: Children School Attendance Rate 

        # Health Issues (0: Few/None, 1: Significant)
        health_prob = 0.4 - (monthly_income / 5000) * 0.3 - access_to_clean_water * 0.1
        has_significant_health_issues = 1 if random.random() < max(0.05, health_prob) else 0

        record = {
            "monthly_income": monthly_income,
            "family_members": family_members,
            "has_stable_housing": has_stable_housing,
            "access_to_clean_water": access_to_clean_water,
            "access_to_electricity": access_to_electricity,
            "has_significant_health_issues": has_significant_health_issues,
            "family_id": f"FAM_{i:04d}"
        }
        data.append(record)
        
    return pd.DataFrame(data)

# 4. Create Condition for Donation/Help (Adjusted for Asnaf focus)
def define_assistance_need(df):
    """Define the target variable 'deserves_help' based on conditions potentially reflecting Asnaf criteria (Faqir/Miskin)."""
    conditions = [
        # Very low income AND lack of basic necessities (housing OR water OR electricity)
        (df['monthly_income'] < 500) & ((df['has_stable_housing'] == 0) | (df['access_to_clean_water'] == 0) | (df['access_to_electricity'] == 0)),
        # Low income AND multiple hardships (large family AND unstable housing)
        (df['monthly_income'] < 700) & (df['family_members'] > 5) & (df['has_stable_housing'] == 0),
        # Significant health issues impacting very low-income families
        (df['has_significant_health_issues'] == 1) & (df['monthly_income'] < 800),
        # Lack of BOTH essential utilities, regardless of income (severe deprivation)
        (df['access_to_clean_water'] == 0) & (df['access_to_electricity'] == 0),
        # Low income AND large family AND lack of clean water
        (df['monthly_income'] < 900) & (df['family_members'] > 4) & (df['access_to_clean_water'] == 0),
        # NEW: Moderately low income AND lack of electricity (added for realism)
        (df['monthly_income'] < 600) & (df['access_to_electricity'] == 0), 
    ]
    
    # Assign 1 if any condition is met, otherwise 0
    df['deserves_help'] = np.select(conditions, [1]*len(conditions), default=0)
    print(f"Asnaf-based 'deserves_help' distribution:\n{df['deserves_help'].value_counts(normalize=True)}") 
    return df

def load_asnaf_recipients_data(file_path='../client/src/data/asnafRecipients.json'):
    """Load and process asnaf recipients data from the JSON file."""
    try:
        # Check if the file exists
        if not os.path.exists(file_path):
            print(f"Warning: Asnaf recipients file not found at {file_path}")
            # Try alternative path
            alt_path = 'client/src/data/asnafRecipients.json'
            if os.path.exists(alt_path):
                file_path = alt_path
            else:
                print(f"Warning: Asnaf recipients file not found at alternative path {alt_path}")
                return pd.DataFrame()
        
        # Load the JSON data
        with open(file_path, 'r') as f:
            asnaf_data = json.load(f)
        
        # Convert to DataFrame
        df = pd.DataFrame(asnaf_data)
        
        # Check if the required columns exist
        required_columns = [
            "monthly_income", 
            "family_members", 
            "has_stable_housing", 
            "access_to_clean_water", 
            "access_to_electricity", 
            "has_significant_health_issues"
        ]
        
        # Filter out records missing required columns
        valid_records = []
        for record in asnaf_data:
            if all(col in record for col in required_columns):
                valid_records.append(record)
        
        if not valid_records:
            print("Warning: No valid records found in asnaf recipients data")
            return pd.DataFrame()
        
        # Create DataFrame with only valid records
        df = pd.DataFrame(valid_records)
        
        # Extract only the columns we need for the model
        feature_columns = required_columns.copy()
        
        # Check if we have mlEligibility data to use as target
        if 'mlEligibility' in df.columns:
            # Extract eligibility from mlEligibility field
            df['deserves_help'] = df['mlEligibility'].apply(
                lambda x: 1 if isinstance(x, dict) and x.get('eligible', False) else 0
            )
        else:
            # Infer eligibility based on category
            # Typically, Poor (Fakir) and Needy (Miskin) would be eligible
            df['deserves_help'] = df['category'].apply(
                lambda x: 1 if isinstance(x, str) and ('Poor' in x or 'Needy' in x) else 0
            )
        
        # Add family_id if not present
        if 'family_id' not in df.columns:
            df['family_id'] = [f"FAM_ASNAF_{i}" for i in range(len(df))]
        
        # Select only the columns we need
        feature_columns.append('deserves_help')
        feature_columns.append('family_id')
        
        # Filter columns and handle missing values
        df = df[feature_columns].fillna({
            'monthly_income': 0,
            'family_members': 1,
            'has_stable_housing': 1,
            'access_to_clean_water': 1,
            'access_to_electricity': 1,
            'has_significant_health_issues': 0,
            'deserves_help': 0
        })
        
        # Convert columns to appropriate types
        df['monthly_income'] = pd.to_numeric(df['monthly_income'], errors='coerce').fillna(0)
        df['family_members'] = pd.to_numeric(df['family_members'], errors='coerce').fillna(1).astype(int)
        df['has_stable_housing'] = pd.to_numeric(df['has_stable_housing'], errors='coerce').fillna(1).astype(int)
        df['access_to_clean_water'] = pd.to_numeric(df['access_to_clean_water'], errors='coerce').fillna(1).astype(int)
        df['access_to_electricity'] = pd.to_numeric(df['access_to_electricity'], errors='coerce').fillna(1).astype(int)
        df['has_significant_health_issues'] = pd.to_numeric(df['has_significant_health_issues'], errors='coerce').fillna(0).astype(int)
        df['deserves_help'] = pd.to_numeric(df['deserves_help'], errors='coerce').fillna(0).astype(int)
        
        print(f"Loaded {len(df)} valid records from asnaf recipients data")
        return df
    
    except Exception as e:
        print(f"Error loading asnaf recipients data: {str(e)}")
        return pd.DataFrame()

def prepare_family_data(n_dummy_samples=1000, load_saved_data=True, load_asnaf_data=True):
    """Generate, define need, and prepare data for modeling."""
    print(f"Generating {n_dummy_samples} dummy family records...")
    
    # Check if we already have saved data to determine how many new samples to generate
    saved_data_count = 0
    if load_saved_data:
        saved_data_path = 'saved_family_data.csv'
        if os.path.exists(saved_data_path):
            saved_df = pd.read_csv(saved_data_path)
            saved_data_count = len(saved_df)
            print(f"Found {saved_data_count} existing saved records")
    
    # Generate new dummy data with a different random seed based on current time
    # This ensures we get different dummy data each time
    current_seed = int(time.time()) % 10000
    np.random.seed(current_seed)
    print(f"Using random seed: {current_seed} for new dummy data generation")
    df = generate_family_data(n_dummy_samples)

    print("Defining assistance need based on Asnaf-focused conditions...")
    df = define_assistance_need(df)

    # --- Add clear dummy samples to help model generalize ---
    explicit_examples = pd.DataFrame([
        {
            # Dummy eligible (meets zakat/asnaf conditions)
            "monthly_income": 200,
            "family_members": 7,
            "has_stable_housing": 0,
            "access_to_clean_water": 0,
            "access_to_electricity": 0,
            "has_significant_health_issues": 1,
            "family_id": f"FAM_DUMMY_ELIGIBLE_{current_seed}",
            "deserves_help": 1
        },
        {
            # Dummy not eligible (good income and all facilities)
            "monthly_income": 3500,
            "family_members": 2,
            "has_stable_housing": 1,
            "access_to_clean_water": 1,
            "access_to_electricity": 1,
            "has_significant_health_issues": 0,
            "family_id": f"FAM_DUMMY_NOT_ELIGIBLE_{current_seed}",
            "deserves_help": 0
        }
    ])
    
    df = pd.concat([df, explicit_examples], ignore_index=True)
    
    # Load previously saved real data if available and requested
    if load_saved_data:
        saved_data_path = 'saved_family_data.csv'
        if os.path.exists(saved_data_path):
            print(f"Loading saved real data from {saved_data_path}")
            saved_df = pd.read_csv(saved_data_path)
            # Ensure the saved data has the same columns
            if set(df.columns).issubset(set(saved_df.columns)):
                # Keep only the columns that are in the current dataframe
                saved_df = saved_df[df.columns]
                df = pd.concat([df, saved_df], ignore_index=True)
                print(f"Added {len(saved_df)} real data samples to training data")
            else:
                print("Warning: Saved data has different columns, skipping")
    
    # Load asnaf recipients data if requested
    asnaf_count = 0
    if load_asnaf_data:
        asnaf_df = load_asnaf_recipients_data()
        if not asnaf_df.empty:
            # Ensure the asnaf data has the same columns
            required_columns = df.columns.tolist()
            if set(required_columns).issubset(set(asnaf_df.columns)):
                # Keep only the columns that are in the current dataframe
                asnaf_df = asnaf_df[required_columns]
                df = pd.concat([df, asnaf_df], ignore_index=True)
                asnaf_count = len(asnaf_df)
                print(f"Added {asnaf_count} asnaf recipient samples to training data")
            else:
                missing_cols = set(required_columns) - set(asnaf_df.columns)
                print(f"Warning: Asnaf data missing columns: {missing_cols}, skipping")

    # Define features (X) and target (y)
    feature_columns = [
        "monthly_income", 
        "family_members", 
        "has_stable_housing", 
        "access_to_clean_water", 
        "access_to_electricity", 
        "has_significant_health_issues"
    ]
    X = df[feature_columns]
    y = df['deserves_help']

    print(f"Data prepared. Feature columns: {feature_columns}")
    print(f"Total training samples: {len(df)}")
    print(f"Class distribution: {df['deserves_help'].value_counts(normalize=True)}")
    
    # Save data source information for tracking
    data_sources = {
        'synthetic_samples': n_dummy_samples,
        'saved_data_samples': saved_data_count,
        'asnaf_data_samples': asnaf_count,
        'generation_seed': current_seed,
        'generation_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    # Save this information to a tracking file
    try:
        with open('data_generation_history.json', 'r') as f:
            history = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        history = []
    
    history.append(data_sources)
    
    with open('data_generation_history.json', 'w') as f:
        json.dump(history, f, indent=4)
    
    return X, y, df, data_sources


# 5. Generate Random Forest Model (Classification)
def train_family_classifier(n_dummy_samples=5000, load_saved_data=True, load_asnaf_data=True):
    """Train a Random Forest Classifier model."""
    X, y, full_df, data_sources = prepare_family_data(
        n_dummy_samples=n_dummy_samples, 
        load_saved_data=load_saved_data,
        load_asnaf_data=load_asnaf_data
    )
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y) # Use stratify for classification
    
    print(f"Training data shape: {X_train.shape}")
    print(f"Testing data shape: {X_test.shape}")
    
    # Initialize and train the Random Forest Classifier
    # Adjust parameters as needed (e.g., class_weight for imbalanced data)
    model = RandomForestClassifier(
        n_estimators=150,       # Number of trees
        max_depth=12,           # Max depth of trees
        min_samples_split=10,   # Min samples to split a node
        min_samples_leaf=5,     # Min samples in a leaf node
        class_weight='balanced', # Adjusts weights inversely proportional to class frequencies
        random_state=42,
        n_jobs=-1               # Use all available CPU cores
    )
    
    print("\nTraining the RandomForestClassifier...")
    model.fit(X_train, y_train)
    print("Training complete.")
    
    # Evaluate the model
    print("\nEvaluating model performance...")
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    conf_matrix = confusion_matrix(y_test, y_pred)
    
    print(f"\nModel Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(report)
    print("\nConfusion Matrix:")
    print(conf_matrix)
    
    # Feature Importance
    try:
        feature_importance = dict(zip(X.columns, model.feature_importances_))
        print("\nTop Features Influencing Decision:")
        for feature, importance in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
            print(f"- {feature}: {importance:.4f}")
    except AttributeError:
        print("\nCould not retrieve feature importances.") # Should not happen with RF

    # Save the model
    model_filename = 'family_assistance_classifier.joblib'
    joblib.dump(model, model_filename)
    print(f"\nModel saved as '{model_filename}'")
    
    # Save feature columns for future reference
    feature_columns_filename = 'feature_columns.joblib'
    joblib.dump(X.columns, feature_columns_filename)
    print(f"Feature columns saved as '{feature_columns_filename}'")
    
    # Save model metadata
    model_metadata = {
        'training_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'accuracy': float(accuracy),
        'samples_count': len(full_df),
        'feature_importance': {k: float(v) for k, v in feature_importance.items()},
        'data_sources': data_sources
    }
    
    # Keep track of model history
    try:
        with open('model_history.json', 'r') as f:
            model_history = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        model_history = []
    
    model_history.append(model_metadata)
    
    with open('model_history.json', 'w') as f:
        json.dump(model_history, f, indent=4)
    
    # Save current model metadata
    with open('model_metadata.json', 'w') as f:
        json.dump(model_metadata, f, indent=4)
    print(f"Model metadata saved as 'model_metadata.json'")
    
    return model, X.columns

def predict_family_status(family_data, model_path='family_assistance_classifier.joblib', feature_columns=None):
    """Predict if a new family needs assistance using the trained model."""
    if not os.path.exists(model_path):
        print(f"Error: Model file not found at {model_path}")
        return None
        
    model = joblib.load(model_path)
    
    # Ensure input is a DataFrame and has the correct columns
    if isinstance(family_data, dict): # Handle single dictionary input
        family_df = pd.DataFrame([family_data])
    elif isinstance(family_data, list): # Handle list of dictionaries input
        family_df = pd.DataFrame(family_data)
    elif isinstance(family_data, pd.DataFrame): # Handle DataFrame input
        family_df = family_data
    else:
        print("Error: Invalid input type for family_data. Expected dict, list of dicts, or DataFrame.")
        return None

    if feature_columns is None:
        # Try to load feature columns from saved file
        feature_columns_path = 'feature_columns.joblib'
        if os.path.exists(feature_columns_path):
            feature_columns = joblib.load(feature_columns_path)
            print(f"Loaded feature columns from {feature_columns_path}")
        else:
            print("Warning: Feature columns not provided and not found in saved file.")
            # Default to expected columns
            feature_columns = [
                "monthly_income", "family_members", "has_stable_housing", 
                "access_to_clean_water", "access_to_electricity", 
                "has_significant_health_issues"
            ]
    
    # Ensure feature_columns is a list of strings
    if isinstance(feature_columns, pd.Index):
        feature_columns_list = feature_columns.tolist()
    else:
        feature_columns_list = list(feature_columns) # Ensure it's a list
    
    # Check if all required columns are present
    missing_columns = [col for col in feature_columns_list if col not in family_df.columns]
    if missing_columns:
        print(f"Error: Missing columns in input data: {missing_columns}")
        return None
    
    family_df = family_df[feature_columns_list] # Ensure correct order and columns

    # Handle potential missing values in new data
    family_df = family_df.fillna({
        'monthly_income': 0,
        'family_members': 1,
        'has_stable_housing': 0,
        'access_to_clean_water': 0,
        'access_to_electricity': 0,
        'has_significant_health_issues': 0
    })

    prediction = model.predict(family_df)
    prediction_proba = model.predict_proba(family_df) # Probability for each class [0, 1]
    
    results = []
    for i, pred in enumerate(prediction):
        status = "Deserves Help" if pred == 1 else "Does Not Currently Qualify"
        probability_help = prediction_proba[i][1] # Probability of class 1 (deserves help)
        results.append({
            "prediction": status,
            "probability_deserves_help": f"{probability_help:.2%}",
            "input_data": family_df.iloc[i].to_dict()
        })
        
    return results

def save_verified_data(family_data, actual_eligibility, save_path='saved_family_data.csv'):
    """
    Save verified family data to improve the model over time.
    
    Parameters:
    - family_data: Dict or DataFrame containing family features
    - actual_eligibility: Boolean or int (1/0) indicating if family actually deserves help
    - save_path: Path to save the data
    """
    # Convert to DataFrame if it's a dict
    if isinstance(family_data, dict):
        family_df = pd.DataFrame([family_data])
    elif isinstance(family_data, list):
        family_df = pd.DataFrame(family_data)
    elif isinstance(family_data, pd.DataFrame):
        family_df = family_data.copy()
    else:
        print("Error: Invalid input type for family_data")
        return False
    
    # Add the actual eligibility
    family_df['deserves_help'] = 1 if actual_eligibility else 0
    
    # Add timestamp for tracking
    family_df['verification_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Add a unique ID if not present
    if 'family_id' not in family_df.columns:
        family_df['family_id'] = f"FAM_REAL_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Check if file exists to append or create new
    if os.path.exists(save_path):
        # Load existing data
        existing_df = pd.read_csv(save_path)
        
        # Check for duplicates based on key features (to avoid adding the same example data multiple times)
        # We'll consider records with the same monthly_income, family_members, and housing status as duplicates
        is_duplicate = False
        for _, row in family_df.iterrows():
            duplicate_mask = (
                (existing_df['monthly_income'] == row['monthly_income']) & 
                (existing_df['family_members'] == row['family_members']) & 
                (existing_df['has_stable_housing'] == row['has_stable_housing']) &
                (existing_df['deserves_help'] == row['deserves_help'])
            )
            if duplicate_mask.any():
                print(f"Skipping duplicate record with monthly_income={row['monthly_income']}, family_members={row['family_members']}")
                is_duplicate = True
                break
        
        if is_duplicate:
            return False
        
        # Ensure columns match by adding missing columns with NaN values
        for col in existing_df.columns:
            if col not in family_df.columns:
                family_df[col] = np.nan
        
        for col in family_df.columns:
            if col not in existing_df.columns:
                existing_df[col] = np.nan
        
        # Combine and save
        combined_df = pd.concat([existing_df, family_df], ignore_index=True)
        combined_df.to_csv(save_path, index=False)
        print(f"Added new verified data to {save_path}")
    else:
        # Create new file
        family_df.to_csv(save_path, index=False)
        print(f"Created new verified data file at {save_path}")
    
    return True

def retrain_model_with_new_data(n_dummy_samples=5000):
    """
    Retrain the model incorporating all saved real data and asnaf recipients data.
    Returns True if retraining was successful.
    """
    try:
        print("Retraining model with all available data...")
        model, features = train_family_classifier(
            n_dummy_samples=n_dummy_samples, 
            load_saved_data=True,
            load_asnaf_data=True
        )
        print("Model successfully retrained with new data!")
        return True
    except Exception as e:
        print(f"Error retraining model: {str(e)}")
        return False


if __name__ == "__main__":
    print("--- Family Assistance ML Model ---")
    
    # Train the model using 5000 dummy samples and asnaf data
    trained_model, features = train_family_classifier(n_dummy_samples=5000, load_asnaf_data=True)
    
    # Example Prediction for a new family
    print("\n--- Example Prediction ---")
    new_family_1 = {
        "monthly_income": 450, 
        "family_members": 6, 
        "has_stable_housing": 0, 
        "access_to_clean_water": 0, 
        "access_to_electricity": 1, 
        "has_significant_health_issues": 0
    }
    
    new_family_2 = {
        "monthly_income": 1800, 
        "family_members": 3, 
        "has_stable_housing": 1, 
        "access_to_clean_water": 1, 
        "access_to_electricity": 1, 
        "has_significant_health_issues": 0
    }

    # Ensure the model file exists before predicting
    if trained_model and features is not None and os.path.exists('family_assistance_classifier.joblib'):
        # Use the saved feature columns for prediction
        predictions = predict_family_status([new_family_1, new_family_2], feature_columns=features)
        if predictions:
            for i, p in enumerate(predictions):
                print(f"\nFamily {i+1}:")
                print(f"  Prediction: {p['prediction']}")
                print(f"  Probability of Needing Help: {p['probability_deserves_help']}")
                # print(f"  Input Data: {p['input_data']}") # Uncomment to see full input
    else:
        print("\nSkipping prediction example as model training failed or model file not found.")
    
    # Example of saving verified data
    print("\n--- Example of Saving Verified Data ---")
    # Let's say we verified that family_1 actually deserves help
    save_verified_data(new_family_1, True)
    # And family_2 does not deserve help
    save_verified_data(new_family_2, False)
    
    # Example of retraining with new data
    print("\n--- Example of Retraining Model ---")
    print("Note: In a real application, you would retrain periodically, not after each verification")
    # Commented out to avoid actual retraining during example run
    # retrain_model_with_new_data(n_dummy_samples=5000)

    print("\n--- Script Finished ---")
