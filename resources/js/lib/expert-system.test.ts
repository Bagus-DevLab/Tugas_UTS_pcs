import { describe, it, expect } from 'vitest';
import { diagnose, getTopDiagnosis, filterByThreshold, type DiseaseData, type SymptomData } from './expert-system';

// Helper to create test data
function createSymptom(id: number, code: string, name: string): SymptomData {
    return { id, code, name, description: null };
}

function createDisease(
    id: number,
    name: string,
    slug: string,
    symptoms: Array<SymptomData & { pivot: { weight: number } }> = [],
): DiseaseData {
    return {
        id,
        name,
        slug,
        latin_name: null,
        description: 'Test disease',
        cause: 'Test cause',
        symptoms,
        treatments: [],
    };
}

describe('diagnose', () => {
    const g01 = createSymptom(1, 'G01', 'Bercak belah ketupat');
    const g02 = createSymptom(2, 'G02', 'Abu-abu tengah coklat tepi');
    const g06 = createSymptom(3, 'G06', 'Bercak oval coklat');
    const g11 = createSymptom(4, 'G11', 'Daun menguning');

    const blast = createDisease(1, 'Blast', 'blast', [
        { ...g01, pivot: { weight: 0.95 } },
        { ...g02, pivot: { weight: 0.90 } },
    ]);

    const brownSpot = createDisease(2, 'Brown Spot', 'brown-spot', [
        { ...g06, pivot: { weight: 0.95 } },
    ]);

    const tungro = createDisease(3, 'Tungro', 'tungro', [
        { ...g11, pivot: { weight: 0.90 } },
    ]);

    const healthy = createDisease(4, 'Healthy', 'healthy', []);

    const diseases = [blast, brownSpot, tungro, healthy];

    it('returns empty results when no symptoms match', () => {
        const results = diagnose([999], diseases);
        expect(results).toHaveLength(0);
    });

    it('skips healthy disease in diagnosis', () => {
        const results = diagnose([1, 2, 3, 4], diseases);
        const slugs = results.map((r) => r.disease.slug);
        expect(slugs).not.toContain('healthy');
    });

    it('returns matching diseases sorted by certainty factor', () => {
        // Select symptoms for blast (G01, G02) and brown spot (G06)
        const results = diagnose([1, 2, 3], diseases);

        expect(results.length).toBeGreaterThanOrEqual(2);
        // Blast should be first (2 matching symptoms with high weights)
        expect(results[0].disease.slug).toBe('blast');
        expect(results[1].disease.slug).toBe('brown-spot');
    });

    it('calculates CF correctly for single symptom', () => {
        const results = diagnose([3], diseases); // G06 only → brown spot
        const brownSpotResult = results.find((r) => r.disease.slug === 'brown-spot');

        expect(brownSpotResult).toBeDefined();
        // Single symptom: CF = weight = 0.95 → 95%
        expect(brownSpotResult!.certaintyFactor).toBe(95);
    });

    it('calculates CF correctly for multiple symptoms using combination formula', () => {
        const results = diagnose([1, 2], diseases); // G01 + G02 → blast
        const blastResult = results.find((r) => r.disease.slug === 'blast');

        expect(blastResult).toBeDefined();
        // CF_combine(0.95, 0.90) = 0.95 + 0.90 * (1 - 0.95) = 0.95 + 0.045 = 0.995
        // As percentage: 99.50
        expect(blastResult!.certaintyFactor).toBe(99.5);
    });

    it('tracks matching symptom count', () => {
        const results = diagnose([1, 2], diseases);
        const blastResult = results.find((r) => r.disease.slug === 'blast');

        expect(blastResult!.matchingSymptoms).toBe(2);
        expect(blastResult!.totalSymptoms).toBe(2);
    });

    it('includes matched symptom details with weights', () => {
        const results = diagnose([1], diseases);
        const blastResult = results.find((r) => r.disease.slug === 'blast');

        expect(blastResult!.matchedSymptomDetails).toHaveLength(1);
        expect(blastResult!.matchedSymptomDetails[0].symptom.code).toBe('G01');
        expect(blastResult!.matchedSymptomDetails[0].weight).toBe(0.95);
    });

    it('handles empty symptom selection', () => {
        const results = diagnose([], diseases);
        expect(results).toHaveLength(0);
    });
});

describe('getTopDiagnosis', () => {
    it('returns null for empty results', () => {
        expect(getTopDiagnosis([])).toBeNull();
    });

    it('returns the first result (highest CF)', () => {
        const mockResults = [
            { disease: { name: 'Blast' }, certaintyFactor: 95 },
            { disease: { name: 'Brown Spot' }, certaintyFactor: 60 },
        ] as any;

        const top = getTopDiagnosis(mockResults);
        expect(top!.disease.name).toBe('Blast');
    });
});

describe('filterByThreshold', () => {
    const mockResults = [
        { certaintyFactor: 95 },
        { certaintyFactor: 50 },
        { certaintyFactor: 15 },
        { certaintyFactor: 5 },
    ] as any;

    it('filters results above default threshold (20%)', () => {
        const filtered = filterByThreshold(mockResults);
        expect(filtered).toHaveLength(2);
    });

    it('filters results above custom threshold', () => {
        const filtered = filterByThreshold(mockResults, 10);
        expect(filtered).toHaveLength(3);
    });

    it('returns empty for high threshold', () => {
        const filtered = filterByThreshold(mockResults, 100);
        expect(filtered).toHaveLength(0);
    });
});
