import * as ort from 'onnxruntime-web';

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

let session: ort.InferenceSession | null = null;
let isLoading = false;

/**
 * Load the ONNX model from public/models/rice-disease/
 */
export async function loadModel(): Promise<ort.InferenceSession> {
    if (session) {
return session;
}

    if (isLoading) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (session) {
                    clearInterval(interval);
                    resolve(session);
                }

                if (!isLoading && !session) {
                    clearInterval(interval);
                    reject(new Error('Model loading failed'));
                }
            }, 100);
        });
    }

    isLoading = true;

    try {
        console.log('[ML] Loading ONNX model...');

        // Check if model file exists
        const resp = await fetch('/models/rice-disease/model.onnx', { method: 'HEAD' });

        if (!resp.ok) {
            isLoading = false;

            throw new Error('Model ML belum tersedia. Silakan train model terlebih dahulu.');
        }

        // Configure ONNX Runtime Web - use CDN for WASM files
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/';
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.proxy = false;

        session = await ort.InferenceSession.create('/models/rice-disease/model.onnx', {
            executionProviders: ['wasm'],
            graphOptimizationLevel: 'all',
        });

        console.log('[ML] ONNX model loaded successfully.');
        console.log('[ML] Input:', session.inputNames, 'Output:', session.outputNames);
        isLoading = false;

        return session;
    } catch (error) {
        isLoading = false;
        const msg = error instanceof Error ? error.message : String(error);
        console.error('[ML] Model loading failed:', msg);

        if (msg.includes('404') || msg.includes('not found') || msg.includes('Failed to fetch') || msg.includes('belum tersedia')) {
            throw new Error('Model ML belum tersedia. Silakan train model terlebih dahulu.');
        }

        throw new Error(`Gagal memuat model ML: ${msg}`);
    }
}

/**
 * Check if the model is loaded
 */
export function isModelLoaded(): boolean {
    return session !== null;
}

/**
 * Preprocess image: resize to 224x224, normalize with training preprocessing
 * Training uses: preprocessing_function(x-1) then rescale(/127.5)
 * So final: (pixel - 1) / 127.5
 */
function preprocessImage(imageElement: HTMLImageElement | HTMLCanvasElement): Float32Array {
    // Draw image to canvas at 224x224
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imageElement, 0, 0, 224, 224);

    const imageData = ctx.getImageData(0, 0, 224, 224);
    const { data } = imageData; // RGBA uint8

    // Convert to float32 NCHW or NHWC depending on model
    // Our model expects NHWC: [1, 224, 224, 3]
    const float32Data = new Float32Array(1 * 224 * 224 * 3);

    for (let i = 0; i < 224 * 224; i++) {
        const r = data[i * 4] ?? 0;
        const g = data[i * 4 + 1] ?? 0;
        const b = data[i * 4 + 2] ?? 0;

        // Apply training preprocessing: (pixel - 1) / 127.5
        float32Data[i * 3] = (r - 1) / 127.5;
        float32Data[i * 3 + 1] = (g - 1) / 127.5;
        float32Data[i * 3 + 2] = (b - 1) / 127.5;
    }

    return float32Data;
}

/**
 * Run inference on an image and return predictions for all classes
 */
export async function predict(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<Prediction[]> {
    const loadedSession = await loadModel();

    const inputData = preprocessImage(imageElement);
    const inputTensor = new ort.Tensor('float32', inputData, [1, 224, 224, 3]);

    const inputName = loadedSession.inputNames[0];
    if (!inputName) {
        throw new Error('Model has no input names');
    }
    const feeds: Record<string, ort.Tensor> = { [inputName]: inputTensor };

    const results = await loadedSession.run(feeds);
    const outputName = loadedSession.outputNames[0];
    if (!outputName) {
        throw new Error('Model has no output names');
    }
    const probabilities = results[outputName]?.data as Float32Array;

    const predictions: Prediction[] = CLASS_LABELS.map((label, index) => ({
        label,
        confidence: Math.round((probabilities[index] ?? 0) * 10000) / 100,
    }));

    predictions.sort((a, b) => b.confidence - a.confidence);

    return predictions;
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
    if (session) {
        session.release();
        session = null;
    }
}
