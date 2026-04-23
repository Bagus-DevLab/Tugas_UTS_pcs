import { describe, it, expect } from 'vitest';
import { getTopPrediction, CLASS_LABELS  } from './ml-model';
import type {Prediction} from './ml-model';

describe('CLASS_LABELS', () => {
    it('has 5 classes', () => {
        expect(CLASS_LABELS).toHaveLength(5);
    });

    it('contains all expected disease classes', () => {
        expect(CLASS_LABELS).toContain('Bacterial Leaf Blight');
        expect(CLASS_LABELS).toContain('Blast');
        expect(CLASS_LABELS).toContain('Brown Spot');
        expect(CLASS_LABELS).toContain('Healthy');
        expect(CLASS_LABELS).toContain('Tungro');
    });

    it('is sorted alphabetically', () => {
        const sorted = [...CLASS_LABELS].sort();
        expect(CLASS_LABELS).toEqual(sorted);
    });
});

describe('getTopPrediction', () => {
    it('returns the prediction with highest confidence', () => {
        const predictions: Prediction[] = [
            { label: 'Blast', confidence: 85.5 },
            { label: 'Healthy', confidence: 10.2 },
            { label: 'Brown Spot', confidence: 3.1 },
            { label: 'Tungro', confidence: 0.8 },
            { label: 'Bacterial Leaf Blight', confidence: 0.4 },
        ];

        const top = getTopPrediction(predictions);
        expect(top.label).toBe('Blast');
        expect(top.confidence).toBe(85.5);
    });

    it('handles equal confidence values', () => {
        const predictions: Prediction[] = [
            { label: 'Blast', confidence: 50 },
            { label: 'Healthy', confidence: 50 },
        ];

        const top = getTopPrediction(predictions);
        // Should return one of them (first encountered with max)
        expect(top.confidence).toBe(50);
    });

    it('handles single prediction', () => {
        const predictions: Prediction[] = [
            { label: 'Healthy', confidence: 99.9 },
        ];

        const top = getTopPrediction(predictions);
        expect(top.label).toBe('Healthy');
    });

    it('handles very small confidence values', () => {
        const predictions: Prediction[] = [
            { label: 'Blast', confidence: 0.01 },
            { label: 'Healthy', confidence: 0.02 },
        ];

        const top = getTopPrediction(predictions);
        expect(top.label).toBe('Healthy');
        expect(top.confidence).toBe(0.02);
    });
});
