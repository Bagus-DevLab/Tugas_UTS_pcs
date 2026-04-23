#!/usr/bin/env python3
"""
Convert trained Keras model to TensorFlow.js layers-model format.

Usage:
    python convert_to_tfjs.py
"""

import json
import os
import sys
from pathlib import Path

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

SCRIPT_DIR = Path(__file__).parent
MODEL_PATH = SCRIPT_DIR / 'model' / 'rice_disease_model.h5'
OUTPUT_DIR = SCRIPT_DIR.parent / 'public' / 'models' / 'rice-disease'


def main():
    print("=" * 60)
    print("  Converting Keras model to TensorFlow.js format")
    print("=" * 60)

    if not MODEL_PATH.exists():
        print(f"\nERROR: Model not found at {MODEL_PATH}")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Clean old files
    for f in OUTPUT_DIR.iterdir():
        f.unlink()

    print(f"\n  Input : {MODEL_PATH}")
    print(f"  Output: {OUTPUT_DIR}")

    import numpy as np
    import tensorflow as tf

    print("\n  Loading model...")
    model = tf.keras.models.load_model(str(MODEL_PATH))
    print(f"  Model loaded: {len(model.layers)} layers, {model.count_params()} params")

    # Extract model topology
    model_config = json.loads(model.to_json())

    # Extract weights with full names
    weight_specs = []
    weight_data = bytearray()

    for layer in model.layers:
        for w in layer.weights:
            w_np = w.numpy().astype(np.float32)
            w_bytes = w_np.tobytes()
            weight_data.extend(w_bytes)

            # Full name: e.g. "mobilenetv2_1.00_224/Conv1/kernel:0" -> strip ":0"
            name = w.name
            if name.endswith(':0'):
                name = name[:-2]

            weight_specs.append({
                'name': name,
                'shape': list(w_np.shape),
                'dtype': 'float32',
            })

    # Split into shards (max 4MB per shard for browser caching)
    MAX_SHARD_SIZE = 4 * 1024 * 1024
    shard_paths = []
    shard_idx = 0
    offset = 0
    data_bytes = bytes(weight_data)

    while offset < len(data_bytes):
        shard_idx += 1
        end = min(offset + MAX_SHARD_SIZE, len(data_bytes))
        shard_name = f"group1-shard{shard_idx}of{max(1, (len(data_bytes) + MAX_SHARD_SIZE - 1) // MAX_SHARD_SIZE)}.bin"
        shard_path = OUTPUT_DIR / shard_name
        with open(shard_path, 'wb') as f:
            f.write(data_bytes[offset:end])
        shard_paths.append(shard_name)
        offset = end

    # Build model.json
    manifest = {
        'format': 'layers-model',
        'generatedBy': f'keras v{tf.keras.__version__}',
        'convertedBy': 'Mapan custom converter v1.0',
        'modelTopology': model_config,
        'weightsManifest': [{
            'paths': shard_paths,
            'weights': weight_specs,
        }],
    }

    model_json_path = OUTPUT_DIR / 'model.json'
    with open(model_json_path, 'w') as f:
        json.dump(manifest, f)

    # Print summary
    print(f"\n  Conversion complete!")
    print(f"  Weights: {len(weight_specs)} tensors")
    print(f"  Shards: {len(shard_paths)}")

    total_size = 0
    for f in sorted(OUTPUT_DIR.iterdir()):
        size_kb = f.stat().st_size / 1024
        total_size += f.stat().st_size
        print(f"    {f.name} ({size_kb:.1f} KB)")

    print(f"\n  Total: {total_size / 1024 / 1024:.2f} MB")
    print(f"  Model ready at: /models/rice-disease/model.json")


if __name__ == '__main__':
    main()
