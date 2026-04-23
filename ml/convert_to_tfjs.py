#!/usr/bin/env python3
"""
Convert trained Keras model to TensorFlow.js format.

Usage:
    python convert_to_tfjs.py

Input:
    - model/rice_disease_model.h5

Output:
    - ../public/models/rice-disease/model.json
    - ../public/models/rice-disease/group1-shard*.bin
"""

import os
import sys
from pathlib import Path

try:
    import tensorflowjs as tfjs
    import tensorflow as tf
except ImportError:
    print("ERROR: Required packages not installed.")
    print("Install with: pip install tensorflow tensorflowjs")
    sys.exit(1)

# Paths
SCRIPT_DIR = Path(__file__).parent
MODEL_PATH = SCRIPT_DIR / 'model' / 'rice_disease_model.h5'
OUTPUT_DIR = SCRIPT_DIR.parent / 'public' / 'models' / 'rice-disease'


def main():
    print("=" * 60)
    print("Converting Keras model to TensorFlow.js format")
    print("=" * 60)

    # Check input model exists
    if not MODEL_PATH.exists():
        print(f"ERROR: Model not found at {MODEL_PATH}")
        print("Please run train_model.py first.")
        sys.exit(1)

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"\nInput model: {MODEL_PATH}")
    print(f"Output directory: {OUTPUT_DIR}")

    # Load model
    print("\nLoading Keras model...")
    model = tf.keras.models.load_model(str(MODEL_PATH))
    model.summary()

    # Convert to TensorFlow.js
    print("\nConverting to TensorFlow.js format...")
    tfjs.converters.save_keras_model(model, str(OUTPUT_DIR))

    # Verify output
    output_files = list(OUTPUT_DIR.iterdir())
    print(f"\nConversion complete! Output files:")
    for f in sorted(output_files):
        size_kb = f.stat().st_size / 1024
        print(f"  {f.name} ({size_kb:.1f} KB)")

    total_size = sum(f.stat().st_size for f in output_files) / (1024 * 1024)
    print(f"\nTotal model size: {total_size:.2f} MB")

    print(f"\nModel is ready for use in the browser!")
    print(f"Files are at: {OUTPUT_DIR}")
    print(f"\nThe model will be loaded from: /models/rice-disease/model.json")


if __name__ == '__main__':
    main()
