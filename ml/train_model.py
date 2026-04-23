#!/usr/bin/env python3
"""
Training Script: Rice Leaf Disease Classification
Model: MobileNetV2 (Transfer Learning)
Dataset: Rice Leaf Diseases from Kaggle

Classes:
    0 - Bacterial Leaf Blight
    1 - Blast
    2 - Brown Spot
    3 - Healthy
    4 - Tungro

Usage:
    pip install -r requirements.txt
    python train_model.py

Output:
    - model/rice_disease_model.h5 (Keras model)
    - model/training_history.png (Training curves)
    - model/confusion_matrix.png (Confusion matrix)
"""

import os
import sys
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

# TensorFlow imports
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import (
    Dense,
    Dropout,
    GlobalAveragePooling2D,
)
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ReduceLROnPlateau,
    ModelCheckpoint,
)
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns

# ============================================================
# Configuration
# ============================================================

IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS_PHASE1 = 10  # Train head only
EPOCHS_PHASE2 = 20  # Fine-tune
LEARNING_RATE_PHASE1 = 1e-3
LEARNING_RATE_PHASE2 = 1e-5
VALIDATION_SPLIT = 0.2
RANDOM_SEED = 42

CLASS_NAMES = [
    'Bacterial Leaf Blight',
    'Blast',
    'Brown Spot',
    'Healthy',
    'Tungro',
]

NUM_CLASSES = len(CLASS_NAMES)

# Paths
SCRIPT_DIR = Path(__file__).parent
MODEL_DIR = SCRIPT_DIR / 'model'
OUTPUT_MODEL_PATH = MODEL_DIR / 'rice_disease_model.h5'

# ============================================================
# Dataset Download
# ============================================================

def download_dataset():
    """Download Rice Leaf Disease dataset from Kaggle using kagglehub."""
    try:
        import kagglehub
        print("Downloading dataset from Kaggle...")
        dataset_path = kagglehub.dataset_download("vbookshelf/rice-leaf-diseases")
        print(f"Dataset downloaded to: {dataset_path}")
        return dataset_path
    except ImportError:
        print("ERROR: kagglehub not installed. Install with: pip install kagglehub")
        print("\nAlternatively, download the dataset manually:")
        print("1. Go to: https://www.kaggle.com/datasets/vbookshelf/rice-leaf-diseases")
        print("2. Download and extract to: ml/dataset/")
        print("3. Ensure folder structure: ml/dataset/rice_leaf_diseases/")
        print("   with subfolders: Bacterial leaf blight, Blast, Brown spot, Healthy, Tungro")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR downloading dataset: {e}")
        print("\nPlease download manually from Kaggle and place in ml/dataset/")
        sys.exit(1)


def find_dataset_dir(base_path):
    """Find the actual image directory within the downloaded dataset."""
    base = Path(base_path)

    # Check common structures
    candidates = [
        base / 'rice_leaf_diseases',
        base / 'Rice Leaf Disease Images',
        base / 'rice_leaf_disease_images',
        base,
    ]

    for candidate in candidates:
        if candidate.is_dir():
            # Check if it has subdirectories with images
            subdirs = [d for d in candidate.iterdir() if d.is_dir()]
            if len(subdirs) >= 4:  # At least 4 disease classes
                print(f"Found dataset directory: {candidate}")
                print(f"Classes found: {[d.name for d in subdirs]}")
                return str(candidate)

    # Try one level deeper
    for item in base.iterdir():
        if item.is_dir():
            subdirs = [d for d in item.iterdir() if d.is_dir()]
            if len(subdirs) >= 4:
                print(f"Found dataset directory: {item}")
                print(f"Classes found: {[d.name for d in subdirs]}")
                return str(item)

    print(f"ERROR: Could not find dataset directory in {base_path}")
    print("Expected structure: <path>/<class_name>/image.jpg")
    sys.exit(1)


# ============================================================
# Data Preparation
# ============================================================

def create_data_generators(dataset_dir):
    """Create training and validation data generators with augmentation."""

    # Training data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 127.5,
        preprocessing_function=lambda x: x - 1,  # Normalize to [-1, 1]
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,
        zoom_range=0.2,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest',
        validation_split=VALIDATION_SPLIT,
    )

    # Validation data (no augmentation, only rescale)
    val_datagen = ImageDataGenerator(
        rescale=1.0 / 127.5,
        preprocessing_function=lambda x: x - 1,
        validation_split=VALIDATION_SPLIT,
    )

    print(f"\nLoading training data from: {dataset_dir}")

    train_generator = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        seed=RANDOM_SEED,
        shuffle=True,
    )

    val_generator = val_datagen.flow_from_directory(
        dataset_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        seed=RANDOM_SEED,
        shuffle=False,
    )

    print(f"\nClass indices: {train_generator.class_indices}")
    print(f"Training samples: {train_generator.samples}")
    print(f"Validation samples: {val_generator.samples}")

    return train_generator, val_generator


# ============================================================
# Model Building
# ============================================================

def build_model():
    """Build MobileNetV2 model with custom classification head."""

    # Load pre-trained MobileNetV2 (without top classification layer)
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
    )

    # Freeze base model layers
    base_model.trainable = False

    # Add custom classification head
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(NUM_CLASSES, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    print("\nModel Summary:")
    model.summary()

    return model, base_model


# ============================================================
# Training
# ============================================================

def train_model(model, base_model, train_gen, val_gen):
    """Train the model in two phases: head only, then fine-tune."""

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    callbacks = [
        EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1,
        ),
        ModelCheckpoint(
            str(OUTPUT_MODEL_PATH),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1,
        ),
    ]

    # ---- Phase 1: Train classification head only ----
    print("\n" + "=" * 60)
    print("Phase 1: Training classification head (base frozen)")
    print("=" * 60)

    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE_PHASE1),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )

    history1 = model.fit(
        train_gen,
        epochs=EPOCHS_PHASE1,
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1,
    )

    # ---- Phase 2: Fine-tune top layers ----
    print("\n" + "=" * 60)
    print("Phase 2: Fine-tuning top 30 layers of base model")
    print("=" * 60)

    # Unfreeze top 30 layers of base model
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    # Recompile with lower learning rate
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE_PHASE2),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )

    history2 = model.fit(
        train_gen,
        epochs=EPOCHS_PHASE2,
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1,
    )

    # Combine histories
    history = {}
    for key in history1.history:
        history[key] = history1.history[key] + history2.history[key]

    return history


# ============================================================
# Evaluation & Visualization
# ============================================================

def evaluate_model(model, val_gen):
    """Evaluate model and generate reports."""

    print("\n" + "=" * 60)
    print("Evaluating model...")
    print("=" * 60)

    # Evaluate
    loss, accuracy = model.evaluate(val_gen, verbose=1)
    print(f"\nValidation Loss: {loss:.4f}")
    print(f"Validation Accuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)")

    # Predictions
    val_gen.reset()
    predictions = model.predict(val_gen, verbose=1)
    predicted_classes = np.argmax(predictions, axis=1)
    true_classes = val_gen.classes

    # Classification report
    class_labels = list(val_gen.class_indices.keys())
    print("\nClassification Report:")
    print(classification_report(true_classes, predicted_classes, target_names=class_labels))

    return true_classes, predicted_classes, class_labels


def plot_training_history(history):
    """Plot training curves."""

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Accuracy
    ax1.plot(history['accuracy'], label='Training Accuracy')
    ax1.plot(history['val_accuracy'], label='Validation Accuracy')
    ax1.set_title('Model Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    ax1.grid(True)

    # Loss
    ax2.plot(history['loss'], label='Training Loss')
    ax2.plot(history['val_loss'], label='Validation Loss')
    ax2.set_title('Model Loss')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True)

    plt.tight_layout()
    plt.savefig(str(MODEL_DIR / 'training_history.png'), dpi=150)
    plt.close()
    print(f"Training history saved to: {MODEL_DIR / 'training_history.png'}")


def plot_confusion_matrix(true_classes, predicted_classes, class_labels):
    """Plot confusion matrix."""

    cm = confusion_matrix(true_classes, predicted_classes)

    plt.figure(figsize=(10, 8))
    sns.heatmap(
        cm,
        annot=True,
        fmt='d',
        cmap='Blues',
        xticklabels=class_labels,
        yticklabels=class_labels,
    )
    plt.title('Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.tight_layout()
    plt.savefig(str(MODEL_DIR / 'confusion_matrix.png'), dpi=150)
    plt.close()
    print(f"Confusion matrix saved to: {MODEL_DIR / 'confusion_matrix.png'}")


# ============================================================
# Main
# ============================================================

def main():
    print("=" * 60)
    print("Rice Leaf Disease Classification - Training Script")
    print("Model: MobileNetV2 (Transfer Learning)")
    print(f"Classes: {CLASS_NAMES}")
    print(f"Image Size: {IMG_SIZE}x{IMG_SIZE}")
    print("=" * 60)

    # Check for local dataset first
    local_dataset = SCRIPT_DIR / 'dataset'
    if local_dataset.exists():
        dataset_path = find_dataset_dir(str(local_dataset))
    else:
        # Download from Kaggle
        raw_path = download_dataset()
        dataset_path = find_dataset_dir(raw_path)

    # Create data generators
    train_gen, val_gen = create_data_generators(dataset_path)

    # Build model
    model, base_model = build_model()

    # Train
    history = train_model(model, base_model, train_gen, val_gen)

    # Evaluate
    true_classes, predicted_classes, class_labels = evaluate_model(model, val_gen)

    # Plot results
    plot_training_history(history)
    plot_confusion_matrix(true_classes, predicted_classes, class_labels)

    print(f"\nModel saved to: {OUTPUT_MODEL_PATH}")
    print("\nNext step: Convert to TensorFlow.js format:")
    print("  python convert_to_tfjs.py")


if __name__ == '__main__':
    main()
