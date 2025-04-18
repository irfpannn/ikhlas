"""
Rural House Image Classification Model

This script trains a deep learning model to classify rural houses into three categories:
Baik, Sederhana, and Dhaif using TensorFlow/Keras with transfer learning.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import time
from datetime import datetime
from sklearn.metrics import confusion_matrix, classification_report, ConfusionMatrixDisplay

# Display TensorFlow version for reference
print(f"TensorFlow version: {tf.__version__}")

# Define constants
IMG_SIZE = 224  # MobileNetV2 input size
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 0.001
DATASET_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Rural House Dataset')
MODEL_SAVE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rural_classifier.h5')

def create_data_generators():
    """Create data generators for training, validation, and testing."""
    print("Creating data generators...")
    
    # Data augmentation for training set
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    # Only rescaling for validation and test sets
    test_val_datagen = ImageDataGenerator(rescale=1./255)
    
    # Load images from directories
    train_generator = train_datagen.flow_from_directory(
        os.path.join(DATASET_PATH, 'train'),
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True
    )
    
    validation_generator = test_val_datagen.flow_from_directory(
        os.path.join(DATASET_PATH, 'valid'),
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    # Get class mapping from train set
    class_indices = train_generator.class_indices
    class_names = list(class_indices.keys())
    print(f"Classes found: {class_names}")
    print(f"Class mapping: {class_indices}")
    
    # Define a list of acceptable class names for the test set
    # Ensures we only use the same classes as in the training set
    classes = class_names.copy()
    
    # Load test images but ensure we only use valid classes
    test_generator = test_val_datagen.flow_from_directory(
        os.path.join(DATASET_PATH, 'test'),
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        classes=classes,  # Only use the same classes as in training
        shuffle=False
    )
    
    return train_generator, validation_generator, test_generator, class_names

def create_model(num_classes):
    """Create and compile the model architecture."""
    print("Creating model...")
    
    # Load MobileNetV2 with pre-trained weights, without the top classification layer
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )
    
    # Freeze the base model layers
    for layer in base_model.layers:
        layer.trainable = False
    
    # Add custom classification layers
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.2)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    # Create the final model
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Compile the model
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Print model summary
    model.summary()
    
    return model, base_model

def plot_confusion_matrix(y_true, y_pred, class_names):
    """Generate and save confusion matrix visualization."""
    # Compute confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    
    # Create a figure for the confusion matrix
    plt.figure(figsize=(10, 8))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=class_names)
    disp.plot(cmap=plt.cm.Blues, values_format='d')
    plt.title('Confusion Matrix')
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    # Save the confusion matrix
    plt.savefig(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'confusion_matrix.png'))
    print("Confusion matrix saved to 'confusion_matrix.png'")
    plt.close()
    
    # Print classification report
    report = classification_report(y_true, y_pred, target_names=class_names)
    print("\nClassification Report:")
    print(report)

def fine_tune_model(model, base_model, train_generator, validation_generator):
    """Fine-tune the model by unfreezing some layers of the base model."""
    print("Fine-tuning the model...")
    
    # Unfreeze the top layers of the base model
    for layer in base_model.layers[-30:]:
        layer.trainable = True
    
    # Recompile the model with a lower learning rate
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE/10),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Fine-tune the model
    fine_tune_history = model.fit(
        train_generator,
        epochs=10,
        validation_data=validation_generator,
        verbose=1
    )
    
    return fine_tune_history

def main():
    """Main function to train and evaluate the model."""
    start_time = time.time()
    
    # Create data generators
    train_generator, validation_generator, test_generator, class_names = create_data_generators()
    
    # Create and compile the model
    model, base_model = create_model(len(class_names))
    
    # Train the model
    print("Training the model...")
    history = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=validation_generator,
        verbose=1
    )
    
    # Plot training history
    plot_training_history(history)
    
    # Evaluate the model on validation data
    print("Evaluating on validation data...")
    val_loss, val_accuracy = model.evaluate(validation_generator)
    print(f"Validation accuracy: {val_accuracy:.4f}")
    print(f"Validation loss: {val_loss:.4f}")
    
    # Fine-tune the model
    fine_tune_history = fine_tune_model(model, base_model, train_generator, validation_generator)
    
    # Evaluate the fine-tuned model on validation data
    print("Evaluating fine-tuned model on validation data...")
    val_loss, val_accuracy = model.evaluate(validation_generator)
    print(f"Fine-tuned validation accuracy: {val_accuracy:.4f}")
    print(f"Fine-tuned validation loss: {val_loss:.4f}")
    
    # Evaluate on test data
    print("Evaluating on test data...")
    test_loss, test_accuracy = model.evaluate(test_generator)
    print(f"Test accuracy: {test_accuracy:.4f}")
    print(f"Test loss: {test_loss:.4f}")
    
    # Save the model
    model.save(MODEL_SAVE_PATH)
    print(f"Model saved to {MODEL_SAVE_PATH}")
    
    # Print total training time
    total_time = time.time() - start_time
    print(f"Total training time: {total_time/60:.2f} minutes")
    
    # Save model metadata
    model_metadata = {
        "model_name": "Rural House Classifier",
        "framework": f"TensorFlow {tf.__version__}",
        "base_model": "MobileNetV2",
        "input_shape": [IMG_SIZE, IMG_SIZE, 3],
        "classes": class_names,
        "training_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "performance": {
            "validation_accuracy": float(val_accuracy),
            "test_accuracy": float(test_accuracy)
        }
    }
    
    import json
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rural_house_model_metadata.json'), 'w') as f:
        json.dump(model_metadata, f, indent=4)
    print("Model metadata saved to 'rural_house_model_metadata.json'")

if __name__ == "__main__":
    main()
