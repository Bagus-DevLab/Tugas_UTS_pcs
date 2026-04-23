import * as tf from '@tensorflow/tfjs';

export const CLASS_LABELS = [
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
] as const;

export type ClassLabel = (typeof CLASS_LABELS)[number];

export interface Prediction {
    label: ClassLabel;
    confidence: number; // 0-100
}

let model: tf.LayersModel | null = null;
let isLoading = false;

/**
 * Load the TensorFlow.js model from public/models/rice-disease/
 */
export async function loadModel(): Promise<tf.LayersModel> {
    if (model) {
return model;
}

    if (isLoading) {
        // Wait for existing load to complete
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (model) {
                    clearInterval(interval);
                    resolve(model);
                }

                if (!isLoading && !model) {
                    clearInterval(interval);
                    reject(new Error('Model loading failed'));
                }
            }, 100);
        });
    }

    isLoading = true;

    try {
        model = await tf.loadLayersModel('/models/rice-disease/model.json', {
            strict: false,
        });
        isLoading = false;

        return model;
    } catch (error) {
        isLoading = false;

        const msg = error instanceof Error ? error.message : String(error);

        // Check if it's a 404 (model files not found)
        if (msg.includes('404') || msg.includes('not found') || msg.includes('Failed to fetch')) {
            throw new Error(
                'Model ML belum tersedia. Silakan train model terlebih dahulu.'
            );
        }

        throw new Error(`Gagal memuat model ML: ${msg}`);
    }
}

/**
 * Check if the model is loaded
 */
export function isModelLoaded(): boolean {
    return model !== null;
}

/**
 * Preprocess an image element for model input
 * Resize to 224x224, normalize to [-1, 1] (MobileNetV2 preprocessing)
 */
export function preprocessImage(imageElement: HTMLImageElement | HTMLCanvasElement): tf.Tensor4D {
    return tf.tidy(() => {
        // Convert image to tensor
        let tensor = tf.browser.fromPixels(imageElement);

        // Resize to 224x224
        tensor = tf.image.resizeBilinear(tensor as tf.Tensor3D, [224, 224]);

        // Normalize to [-1, 1] (MobileNetV2 preprocessing)
        const normalized = tensor.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1));

        // Add batch dimension
        return normalized.expandDims(0) as tf.Tensor4D;
    });
}

/**
 * Run inference on an image and return predictions for all classes
 */
export async function predict(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<Prediction[]> {
    const loadedModel = await loadModel();

    const inputTensor = preprocessImage(imageElement);

    try {
        const output = loadedModel.predict(inputTensor) as tf.Tensor;
        const probabilities = await output.data();

        output.dispose();

        const predictions: Prediction[] = CLASS_LABELS.map((label, index) => ({
            label,
            confidence: Math.round(probabilities[index] * 10000) / 100, // Convert to percentage with 2 decimals
        }));

        // Sort by confidence descending
        predictions.sort((a, b) => b.confidence - a.confidence);

        return predictions;
    } finally {
        inputTensor.dispose();
    }
}

/**
 * Get the top prediction from a list of predictions
 */
export function getTopPrediction(predictions: Prediction[]): Prediction {
    return predictions.reduce((top, current) =>
        current.confidence > top.confidence ? current : top
    );
}

/**
 * Dispose the loaded model to free memory
 */
export function disposeModel(): void {
    if (model) {
        model.dispose();
        model = null;
    }
}
