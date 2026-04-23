#!/usr/bin/env python3
"""
Convert Keras 3 model to TensorFlow.js layers-model format.

Comprehensive Keras 3 -> TF.js topology transformer.
Uses whitelist approach: only keeps fields TF.js understands.

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

# ============================================================
# TF.js compatible config fields per layer class (whitelist)
# ============================================================

# Fields that ALL layers can have
COMMON_FIELDS = {'name', 'trainable', 'dtype'}

# Per-class allowed config fields
LAYER_FIELDS = {
    'InputLayer': {'batch_input_shape', 'sparse', 'ragged'},
    'Conv2D': {
        'filters', 'kernel_size', 'strides', 'padding', 'data_format',
        'dilation_rate', 'groups', 'activation', 'use_bias',
        'kernel_initializer', 'bias_initializer',
        'kernel_regularizer', 'bias_regularizer',
        'activity_regularizer', 'kernel_constraint', 'bias_constraint',
    },
    'DepthwiseConv2D': {
        'kernel_size', 'strides', 'padding', 'data_format',
        'dilation_rate', 'depth_multiplier', 'activation', 'use_bias',
        'depthwise_initializer', 'bias_initializer',
        'depthwise_regularizer', 'bias_regularizer',
        'activity_regularizer', 'depthwise_constraint', 'bias_constraint',
    },
    'BatchNormalization': {
        'axis', 'momentum', 'epsilon', 'center', 'scale',
        'beta_initializer', 'gamma_initializer',
        'moving_mean_initializer', 'moving_variance_initializer',
        'beta_regularizer', 'gamma_regularizer',
        'beta_constraint', 'gamma_constraint',
    },
    'Dense': {
        'units', 'activation', 'use_bias',
        'kernel_initializer', 'bias_initializer',
        'kernel_regularizer', 'bias_regularizer',
        'activity_regularizer', 'kernel_constraint', 'bias_constraint',
    },
    'Dropout': {'rate'},
    'ReLU': {'max_value', 'negative_slope', 'threshold'},
    'Add': set(),
    'Multiply': set(),
    'Concatenate': {'axis'},
    'GlobalAveragePooling2D': {'data_format', 'keepdims'},
    'GlobalMaxPooling2D': {'data_format', 'keepdims'},
    'MaxPooling2D': {'pool_size', 'strides', 'padding', 'data_format'},
    'AveragePooling2D': {'pool_size', 'strides', 'padding', 'data_format'},
    'Flatten': {'data_format'},
    'Reshape': {'target_shape'},
    'ZeroPadding2D': {'padding', 'data_format'},
    'Activation': {'activation'},
    'Softmax': {'axis'},
}


def fix_initializer(val):
    """Ensure initializer is in TF.js format."""
    if val is None:
        return None
    if isinstance(val, str):
        return {'class_name': val, 'config': {}}
    if isinstance(val, dict) and 'class_name' in val:
        cfg = val.get('config', {})
        # Remove Keras 3 fields from initializer config
        cfg.pop('module', None)
        cfg.pop('registered_name', None)
        # seed=null is fine for TF.js
        return {'class_name': val['class_name'], 'config': cfg}
    return val


def fix_layer(layer: dict) -> dict:
    """Transform a single layer to TF.js compatible format."""
    cls = layer.get('class_name', '')
    old_config = layer.get('config', {})

    # Remove Keras 3 top-level fields
    layer.pop('module', None)
    layer.pop('registered_name', None)
    layer.pop('build_config', None)

    # Fix InputLayer: batch_shape -> batch_input_shape
    if cls == 'InputLayer':
        if 'batch_shape' in old_config:
            old_config['batch_input_shape'] = old_config.pop('batch_shape')
        old_config.pop('optional', None)

    # Build clean config: whitelist for known classes, keep all for unknown
    if cls not in LAYER_FIELDS:
        # Unknown layer class - keep all config but still fix dtype/initializers
        print(f"  WARNING: Unknown layer class '{cls}', keeping all config fields")
        new_config = dict(old_config)
    else:
        allowed = COMMON_FIELDS | LAYER_FIELDS[cls]
        new_config = {}
        for key in allowed:
            if key in old_config:
                new_config[key] = old_config[key]

    # Fix dtype if it's a DTypePolicy object
    if 'dtype' in new_config and isinstance(new_config['dtype'], dict):
        new_config['dtype'] = new_config['dtype'].get('config', {}).get('name', 'float32')

    # Fix initializer objects
    for key in list(new_config.keys()):
        if key.endswith('_initializer'):
            new_config[key] = fix_initializer(new_config[key])

    # Fix inbound_nodes
    inbound = layer.get('inbound_nodes', [])
    layer['inbound_nodes'] = fix_inbound_nodes(inbound)

    layer['config'] = new_config
    return layer


def fix_inbound_nodes(nodes: list) -> list:
    """Convert Keras 3 inbound_nodes to TF.js format.

    Keras 3: [{"args": [{"class_name": "__keras_tensor__", "config": {"keras_history": [...]}}], "kwargs": {}}]
    TF.js:   [[["layer_name", node_idx, tensor_idx, {}]]]
    """
    if not nodes:
        return []

    converted = []
    for node in nodes:
        if isinstance(node, dict) and 'args' in node:
            args = node.get('args', [])
            node_data = []

            for arg in args:
                if isinstance(arg, dict) and arg.get('class_name') == '__keras_tensor__':
                    h = arg['config'].get('keras_history', [])
                    if len(h) >= 3:
                        node_data.append([h[0], h[1], h[2], {}])
                elif isinstance(arg, list):
                    for sub in arg:
                        if isinstance(sub, dict) and sub.get('class_name') == '__keras_tensor__':
                            h = sub['config'].get('keras_history', [])
                            if len(h) >= 3:
                                node_data.append([h[0], h[1], h[2], {}])

            if node_data:
                converted.append(node_data)
        elif isinstance(node, list):
            converted.append(node)

    return converted


def fix_topology(topology: dict) -> dict:
    """Transform full model topology."""
    topology.pop('module', None)
    topology.pop('registered_name', None)

    if 'config' in topology:
        topology['config'].pop('build_config', None)

        # Fix layers
        if 'layers' in topology['config']:
            for i, layer in enumerate(topology['config']['layers']):
                topology['config']['layers'][i] = fix_layer(layer)

        # Fix input_layers / output_layers format
        # Keras 3: flat ["input_layer", 0, 0]
        # TF.js expects: nested [["input_layer", 0, 0]]
        for key in ('input_layers', 'output_layers'):
            val = topology['config'].get(key)
            if val and isinstance(val, list) and len(val) > 0:
                if isinstance(val[0], str):
                    # Flat array -> wrap in outer array
                    topology['config'][key] = [val]

    return topology


def main():
    print("=" * 60)
    print("  Keras 3 -> TensorFlow.js Converter v3.0")
    print("=" * 60)

    if not MODEL_PATH.exists():
        print(f"\nERROR: Model not found: {MODEL_PATH}")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for f in OUTPUT_DIR.iterdir():
        f.unlink()

    import numpy as np
    import tensorflow as tf

    print(f"\n  Loading {MODEL_PATH.name}...")
    model = tf.keras.models.load_model(str(MODEL_PATH))
    print(f"  {len(model.layers)} layers, {model.count_params()} params")

    # Fix topology
    print("  Transforming topology (Keras 3 -> TF.js)...")
    topo = json.loads(model.to_json())
    topo = fix_topology(topo)

    # Verify
    first = topo['config']['layers'][0]
    assert first['class_name'] == 'InputLayer'
    assert 'batch_input_shape' in first['config']
    print(f"  Input shape: {first['config']['batch_input_shape']}")

    # Extract weights
    print("  Extracting weights...")
    specs = []
    buf = bytearray()

    for layer in model.layers:
        for w in layer.weights:
            arr = w.numpy().astype(np.float32)
            buf.extend(arr.tobytes())
            name = w.name.removesuffix(':0')
            specs.append({'name': name, 'shape': list(arr.shape), 'dtype': 'float32'})

    # Write shards
    MAX = 4 * 1024 * 1024
    data = bytes(buf)
    n_shards = max(1, (len(data) + MAX - 1) // MAX)
    paths = []

    for i in range(n_shards):
        name = f'group1-shard{i+1}of{n_shards}.bin'
        with open(OUTPUT_DIR / name, 'wb') as f:
            f.write(data[i*MAX : (i+1)*MAX])
        paths.append(name)

    # Write model.json
    manifest = {
        'format': 'layers-model',
        'generatedBy': f'keras v{tf.keras.__version__}',
        'convertedBy': 'Mapan converter v3.0',
        'modelTopology': topo,
        'weightsManifest': [{'paths': paths, 'weights': specs}],
    }

    with open(OUTPUT_DIR / 'model.json', 'w') as f:
        json.dump(manifest, f)

    # Summary
    total = sum((OUTPUT_DIR / p).stat().st_size for p in paths)
    total += (OUTPUT_DIR / 'model.json').stat().st_size

    print(f"\n  Done! {len(specs)} weight tensors, {n_shards} shards")
    for f in sorted(OUTPUT_DIR.iterdir()):
        print(f"    {f.name} ({f.stat().st_size/1024:.1f} KB)")
    print(f"  Total: {total/1024/1024:.2f} MB")


if __name__ == '__main__':
    main()
