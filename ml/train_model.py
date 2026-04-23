#!/usr/bin/env python3
"""
Training Script: Rice Disease Classification
Model: MobileNetV2 (Transfer Learning)
Dataset: Custom labeled dataset (11 classes)

Classes (alphabetical order - must match frontend CLASS_LABELS):
    0  - Bacterial Leaf Blight
    1  - Bacterial Leaf Streak
    2  - Bacterial Panicle Blight
    3  - Blast
    4  - Brown Spot
    5  - Dead Heart
    6  - Downy Mildew
    7  - Healthy
    8  - Hispa
    9  - Leaf Smut
    10 - Tungro

Usage:
    cd ml
    source venv/bin/activate
    python split_dataset.py      # Split dataset first
    python train_model.py        # Train model
    python convert_to_tfjs.py    # Convert to TF.js

Output:
    - model/rice_disease_model.h5 (Keras model)
    - model/training_history.png (Training curves)
    - model/confusion_matrix.png (Confusion matrix)
"""

import sys
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

from PIL import ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True  # Tolerate slightly truncated images

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns

# ============================================================
# Configuration
# ============================================================

IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS_PHASE1 = 10
EPOCHS_PHASE2 = 20
LEARNING_RATE_PHASE1 = 1e-3
LEARNING_RATE_PHASE2 = 1e-5
RANDOM_SEED = 42

CLASS_NAMES = [
    'Bacterial Leaf Blight',
    'Bacterial Leaf Streak',
    'Bacterial Panicle Blight',
    'Blast',
    'Brown Spot',
    'Dead Heart',
    'Downy Mildew',
    'Healthy',
    'Hispa',
    'Leaf Smut',
    'Tungro',
]

NUM_CLASSES = len(CLASS_NAMES)

SCRIPT_DIR = Path(__file__).parent
MODEL_DIR = SCRIPT_DIR / 'model'
OUTPUT_MODEL_PATH = MODEL_DIR / 'rice_disease_model.h5'
DATASET_DIR = SCRIPT_DIR / 'dataset_split'

# ============================================================
# Data Preparation
# ============================================================

def create_data_generators():
    """Create train/val/test generators from pre-split dataset."""

    train_dir = DATASET_DIR / 'train'
    val_dir = DATASET_DIR / 'val'
    test_dir = DATASET_DIR / 'test'

    for d in [train_dir, val_dir, test_dir]:
        if not d.exists():
            print(f"ERROR: Directory not found: {d}")
            print("Run split_dataset.py first.")
            sys.exit(1)

    train_datagen = ImageDataGenerator(
        rescale=1.0 / 127.5,
        preprocessing_function=lambda x: x - 1,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,
        zoom_range=0.2,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest',
    )

    val_datagen = ImageDataGenerator(
        rescale=1.0 / 127.5,
        preprocessing_function=lambda x: x - 1,
    )

    print(f"\nLoading data from: {DATASET_DIR}")

    train_gen = train_datagen.flow_from_directory(
        str(train_dir),
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        seed=RANDOM_SEED,
        shuffle=True,
    )

    val_gen = val_datagen.flow_from_directory(
        str(val_dir),
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        seed=RANDOM_SEED,
        shuffle=False,
    )

    test_gen = val_datagen.flow_from_directory(
        str(test_dir),
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        seed=RANDOM_SEED,
        shuffle=False,
    )

    print(f"\nClass indices: {train_gen.class_indices}")
    print(f"Training samples: {train_gen.samples}")
    print(f"Validation samples: {val_gen.samples}")
    print(f"Test samples: {test_gen.samples}")

    return train_gen, val_gen, test_gen


# ============================================================
# Model Building
# ============================================================

def build_model():
    """Build MobileNetV2 with custom classification head."""

    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
    )

    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.4)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(NUM_CLASSES, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    print(f"\nModel Summary (output classes: {NUM_CLASSES}):")
    model.summary()

    return model, base_model


# ============================================================
# Training
# ============================================================

def train_model(model, base_model, train_gen, val_gen):
    """Train in two phases: head only, then fine-tune."""

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    callbacks = [
        EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-7, verbose=1),
        ModelCheckpoint(str(OUTPUT_MODEL_PATH), monitor='val_accuracy', save_best_only=True, verbose=1),
    ]

    # Phase 1
    print("\n" + "=" * 60)
    print(f"Phase 1: Training classification head ({NUM_CLASSES} classes)")
    print("=" * 60)

    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE_PHASE1),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )

    history1 = model.fit(train_gen, epochs=EPOCHS_PHASE1, validation_data=val_gen, callbacks=callbacks, verbose=1)

    # Phase 2
    print("\n" + "=" * 60)
    print("Phase 2: Fine-tuning top 30 layers")
    print("=" * 60)

    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE_PHASE2),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )

    history2 = model.fit(train_gen, epochs=EPOCHS_PHASE2, validation_data=val_gen, callbacks=callbacks, verbose=1)

    history = {}
    for key in history1.history:
        history[key] = history1.history[key] + history2.history[key]

    return history


# ============================================================
# Evaluation
# ============================================================

def evaluate_model(model, test_gen):
    """Evaluate on test set."""

    print("\n" + "=" * 60)
    print("Evaluating on TEST set...")
    print("=" * 60)

    loss, accuracy = model.evaluate(test_gen, verbose=1)
    print(f"\nTest Loss: {loss:.4f}")
    print(f"Test Accuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)")

    test_gen.reset()
    predictions = model.predict(test_gen, verbose=1)
    predicted_classes = np.argmax(predictions, axis=1)
    true_classes = test_gen.classes

    class_labels = list(test_gen.class_indices.keys())
    print("\nClassification Report:")
    print(classification_report(true_classes, predicted_classes, target_names=class_labels))

    return true_classes, predicted_classes, class_labels


def plot_training_history(history):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    ax1.plot(history['accuracy'], label='Training')
    ax1.plot(history['val_accuracy'], label='Validation')
    ax1.set_title('Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.legend()
    ax1.grid(True)

    ax2.plot(history['loss'], label='Training')
    ax2.plot(history['val_loss'], label='Validation')
    ax2.set_title('Loss')
    ax2.set_xlabel('Epoch')
    ax2.legend()
    ax2.grid(True)

    plt.tight_layout()
    plt.savefig(str(MODEL_DIR / 'training_history.png'), dpi=150)
    plt.close()
    print(f"Training history saved: {MODEL_DIR / 'training_history.png'}")


def plot_confusion_matrix(true_classes, predicted_classes, class_labels):
    cm = confusion_matrix(true_classes, predicted_classes)

    plt.figure(figsize=(14, 12))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_labels, yticklabels=class_labels)
    plt.title('Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig(str(MODEL_DIR / 'confusion_matrix.png'), dpi=150)
    plt.close()
    print(f"Confusion matrix saved: {MODEL_DIR / 'confusion_matrix.png'}")


# ============================================================
# Main
# ============================================================

def main():
    print("=" * 60)
    print("Rice Disease Classification - Training Script")
    print(f"Model: MobileNetV2 | Classes: {NUM_CLASSES}")
    print(f"Classes: {CLASS_NAMES}")
    print("=" * 60)

    train_gen, val_gen, test_gen = create_data_generators()
    model, base_model = build_model()
    history = train_model(model, base_model, train_gen, val_gen)
    true_classes, predicted_classes, class_labels = evaluate_model(model, test_gen)
    plot_training_history(history)
    plot_confusion_matrix(true_classes, predicted_classes, class_labels)

    print(f"\nModel saved: {OUTPUT_MODEL_PATH}")
    print("Next: python convert_to_tfjs.py")


if __name__ == '__main__':
    main()
