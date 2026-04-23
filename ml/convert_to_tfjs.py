#!/usr/bin/env python3
"""
Convert trained Keras 3 model to TensorFlow.js layers-model format.

Handles Keras 3 topology format differences:
- batch_shape -> batch_input_shape
- module field removal
- Config key normalization for TF.js compatibility

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


def fix_inbound_nodes(nodes: list) -> list:
    """Convert Keras 3 inbound_nodes format to Keras 2 / TF.js format.

    Keras 3: [{"args": [{"class_name": "__keras_tensor__", "config": {"keras_history": ["layer", 0, 0]}}], "kwargs": {}}]
    TF.js:   [[["layer", 0, 0, {}]]]
    """
    if not nodes:
        return nodes

    converted = []
    for node in nodes:
        if isinstance(node, dict) and 'args' in node:
            # Keras 3 format
            args = node.get('args', [])
            kwargs = node.get('kwargs', {})
            # Remove non-serializable kwargs
            clean_kwargs = {k: v for k, v in kwargs.items() if v is not None}

            node_data = []
            for arg in args:
                if isinstance(arg, dict) and arg.get('class_name') == '__keras_tensor__':
                    history = arg['config'].get('keras_history', [])
                    if len(history) >= 3:
                        node_data.append([history[0], history[1], history[2], clean_kwargs])
                elif isinstance(arg, list):
                    # Multiple inputs (e.g., Add layer)
                    for sub_arg in arg:
                        if isinstance(sub_arg, dict) and sub_arg.get('class_name') == '__keras_tensor__':
                            history = sub_arg['config'].get('keras_history', [])
                            if len(history) >= 3:
                                node_data.append([history[0], history[1], history[2], {}])

            if node_data:
                converted.append(node_data)
        elif isinstance(node, list):
            # Already in Keras 2 format
            converted.append(node)

    return converted


def fix_layer_config(layer: dict) -> dict:
    """Fix a single layer config for TF.js compatibility."""
    # Remove Keras 3 specific fields
    layer.pop('module', None)
    layer.pop('registered_name', None)

    config = layer.get('config', {})

    # InputLayer: batch_shape -> batch_input_shape
    if layer.get('class_name') == 'InputLayer':
        if 'batch_shape' in config and 'batch_input_shape' not in config:
            config['batch_input_shape'] = config.pop('batch_shape')
        config.pop('optional', None)

    # Fix dtype: DTypePolicy object -> simple string
    if 'dtype' in config and isinstance(config['dtype'], dict):
        policy = config['dtype']
        config['dtype'] = policy.get('config', {}).get('name', 'float32')

    # Fix kernel_initializer, bias_initializer etc. that may have 'module' field
    for key in list(config.keys()):
        val = config[key]
        if isinstance(val, dict):
            val.pop('module', None)
            val.pop('registered_name', None)
            # Recursively fix nested config dicts
            if 'config' in val and isinstance(val['config'], dict):
                for subkey in list(val['config'].keys()):
                    subval = val['config'][subkey]
                    if isinstance(subval, dict):
                        subval.pop('module', None)
                        subval.pop('registered_name', None)

    # Fix inbound_nodes from Keras 3 to Keras 2 format
    if 'inbound_nodes' in layer:
        layer['inbound_nodes'] = fix_inbound_nodes(layer['inbound_nodes'])

    # Fix nested layer configs
    if 'layer' in config and isinstance(config['layer'], dict):
        config['layer'] = fix_layer_config(config['layer'])

    # Remove Keras 3 build_config
    config.pop('build_config', None)

    layer['config'] = config
    return layer


def fix_topology(topology: dict) -> dict:
    """Transform Keras 3 model topology to TF.js compatible format."""
    # Fix all layers
    if 'config' in topology and 'layers' in topology['config']:
        for i, layer in enumerate(topology['config']['layers']):
            topology['config']['layers'][i] = fix_layer_config(layer)

    # Remove top-level Keras 3 fields
    topology.pop('module', None)
    topology.pop('registered_name', None)

    # Fix build_config at model level
    if 'config' in topology:
        topology['config'].pop('build_config', None)

    return topology


def main():
    print("=" * 60)
    print("  Converting Keras 3 model to TensorFlow.js format")
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
    print(f"  Loaded: {len(model.layers)} layers, {model.count_params()} params")

    # Get and fix topology
    print("  Fixing topology for TF.js compatibility...")
    model_config = json.loads(model.to_json())
    model_config = fix_topology(model_config)

    # Verify InputLayer fix
    first_layer = model_config['config']['layers'][0]
    assert 'batch_input_shape' in first_layer['config'], "InputLayer fix failed!"
    print(f"  InputLayer batch_input_shape: {first_layer['config']['batch_input_shape']}")

    # Extract weights
    print("  Extracting weights...")
    weight_specs = []
    weight_data = bytearray()

    for layer in model.layers:
        for w in layer.weights:
            w_np = w.numpy().astype(np.float32)
            weight_data.extend(w_np.tobytes())

            name = w.name
            if name.endswith(':0'):
                name = name[:-2]

            weight_specs.append({
                'name': name,
                'shape': list(w_np.shape),
                'dtype': 'float32',
            })

    # Write shards (max 4MB each)
    MAX_SHARD = 4 * 1024 * 1024
    data_bytes = bytes(weight_data)
    num_shards = max(1, (len(data_bytes) + MAX_SHARD - 1) // MAX_SHARD)
    shard_paths = []

    for i in range(num_shards):
        start = i * MAX_SHARD
        end = min(start + MAX_SHARD, len(data_bytes))
        shard_name = f"group1-shard{i + 1}of{num_shards}.bin"
        with open(OUTPUT_DIR / shard_name, 'wb') as f:
            f.write(data_bytes[start:end])
        shard_paths.append(shard_name)

    # Write model.json
    manifest = {
        'format': 'layers-model',
        'generatedBy': f'keras v{tf.keras.__version__}',
        'convertedBy': 'Mapan TF.js converter v2.0 (Keras 3 compat)',
        'modelTopology': model_config,
        'weightsManifest': [{
            'paths': shard_paths,
            'weights': weight_specs,
        }],
    }

    with open(OUTPUT_DIR / 'model.json', 'w') as f:
        json.dump(manifest, f)

    # Summary
    total_size = sum((OUTPUT_DIR / p).stat().st_size for p in shard_paths)
    total_size += (OUTPUT_DIR / 'model.json').stat().st_size

    print(f"\n  Conversion complete!")
    print(f"  Weights: {len(weight_specs)} tensors, {num_shards} shards")
    for f in sorted(OUTPUT_DIR.iterdir()):
        print(f"    {f.name} ({f.stat().st_size / 1024:.1f} KB)")
    print(f"  Total: {total_size / 1024 / 1024:.2f} MB")
    print(f"\n  Model ready at: /models/rice-disease/model.json")


if __name__ == '__main__':
    main()
