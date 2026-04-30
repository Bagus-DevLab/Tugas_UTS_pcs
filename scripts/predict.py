#!/usr/bin/env python3
import sys
import json
import numpy as np
from PIL import Image
import onnxruntime as ort

MODEL_PATH = "/home/bagus/tugas_uts_pcs/public/models/rice-disease/model.onnx"
LABELS = [
    "Blast", "Brown Spot", "Tungro", "Bacterial Leaf Blight", "Healthy",
    "Hispa", "Dead Heart", "Downy Mildew", "Bacterial Leaf Streak",
    "Bacterial Panicle Blight", "Leaf Smut"
]

def preprocess_image(image_path):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img, dtype=np.float32)
    img_array = (img_array - 1) / 127.5
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict(image_path):
    sess = ort.InferenceSession(MODEL_PATH)
    input_name = sess.get_inputs()[0].name
    output_name = sess.get_outputs()[0].name
    
    input_data = preprocess_image(image_path)
    result = sess.run([output_name], {input_name: input_data})[0]
    
    probabilities = result[0]
    top_indices = np.argsort(probabilities)[::-1][:5]
    
    predictions = []
    for idx in top_indices:
        predictions.append({
            "label": LABELS[idx],
            "confidence": float(round(probabilities[idx] * 100, 2))
        })
    
    return {
        "predictions": predictions,
        "top_prediction": predictions[0],
        "top_label": LABELS[np.argmax(probabilities)],
        "top_confidence": float(round(np.max(probabilities) * 100, 2))
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    try:
        result = predict(image_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)