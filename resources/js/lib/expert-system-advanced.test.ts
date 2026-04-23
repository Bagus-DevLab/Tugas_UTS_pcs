import { describe, it, expect } from 'vitest';
import { diagnose, filterByThreshold   } from './expert-system';
import type {DiseaseData, SymptomData} from './expert-system';

function sym(id: number, code: string): SymptomData {
    return { id, code, name: `Symptom ${code}`, description: null };
}

function dis(
    id: number,
    name: string,
    slug: string,
    symptoms: Array<SymptomData & { pivot: { weight: number } }> = [],
): DiseaseData {
    return { id, name, slug, latin_name: null, description: '', cause: '', symptoms, treatments: [] };
}

describe('diagnose - advanced scenarios', () => {
    it('handles shared symptoms between diseases correctly', () => {
        // G03 is shared between Blast (weight 0.70) and BLB (weight 0.60)
        const g01 = sym(1, 'G01');
        const g03 = sym(3, 'G03');
        const g16 = sym(16, 'G16');

        const blast = dis(1, 'Blast', 'blast', [
            { ...g01, pivot: { weight: 0.95 } },
            { ...g03, pivot: { weight: 0.70 } },
        ]);
        const blb = dis(2, 'BLB', 'blb', [
            { ...g03, pivot: { weight: 0.60 } },
            { ...g16, pivot: { weight: 0.90 } },
        ]);

        // Select only G03 (shared symptom)
        const results = diagnose([3], [blast, blb]);

        expect(results).toHaveLength(2);
        // Blast should have higher CF because G03 has higher weight for Blast
        const blastResult = results.find((r) => r.disease.slug === 'blast');
        const blbResult = results.find((r) => r.disease.slug === 'blb');
        expect(blastResult!.certaintyFactor).toBeGreaterThan(blbResult!.certaintyFactor);
    });

    it('CF combination is commutative (order does not matter)', () => {
        const g01 = sym(1, 'G01');
        const g02 = sym(2, 'G02');

        const disease = dis(1, 'Test', 'test', [
            { ...g01, pivot: { weight: 0.80 } },
            { ...g02, pivot: { weight: 0.60 } },
        ]);

        // Select [1, 2] and [2, 1] should give same result
        const result1 = diagnose([1, 2], [disease]);
        const result2 = diagnose([2, 1], [disease]);

        // CF_combine(0.80, 0.60) = 0.80 + 0.60 * (1 - 0.80) = 0.80 + 0.12 = 0.92
        expect(result1[0].certaintyFactor).toBe(92);
        expect(result2[0].certaintyFactor).toBe(92);
    });

    it('single symptom with weight 1.0 gives 100% CF', () => {
        const g01 = sym(1, 'G01');
        const disease = dis(1, 'Test', 'test', [
            { ...g01, pivot: { weight: 1.00 } },
        ]);

        const results = diagnose([1], [disease]);
        expect(results[0].certaintyFactor).toBe(100);
    });

    it('single symptom with weight 0.0 gives 0% CF', () => {
        const g01 = sym(1, 'G01');
        const disease = dis(1, 'Test', 'test', [
            { ...g01, pivot: { weight: 0.00 } },
        ]);

        const results = diagnose([1], [disease]);
        // Symptom matches but CF = 0
        expect(results).toHaveLength(1);
        expect(results[0].certaintyFactor).toBe(0);
    });

    it('three symptoms combine correctly', () => {
        const g01 = sym(1, 'G01');
        const g02 = sym(2, 'G02');
        const g03 = sym(3, 'G03');

        const disease = dis(1, 'Test', 'test', [
            { ...g01, pivot: { weight: 0.90 } },
            { ...g02, pivot: { weight: 0.80 } },
            { ...g03, pivot: { weight: 0.70 } },
        ]);

        const results = diagnose([1, 2, 3], [disease]);

        // CF_combine(0.90, 0.80) = 0.90 + 0.80 * 0.10 = 0.98
        // CF_combine(0.98, 0.70) = 0.98 + 0.70 * 0.02 = 0.994
        expect(results[0].certaintyFactor).toBe(99.4);
    });

    it('selecting unrelated symptoms does not affect other diseases', () => {
        const g01 = sym(1, 'G01');
        const g06 = sym(6, 'G06');
        // G99 is not linked to any disease (only referenced by ID 99 below)

        const blast = dis(1, 'Blast', 'blast', [{ ...g01, pivot: { weight: 0.95 } }]);
        const brownSpot = dis(2, 'Brown Spot', 'brown-spot', [{ ...g06, pivot: { weight: 0.95 } }]);

        // Select G01 + G99 (G99 is unrelated)
        const results = diagnose([1, 99], [blast, brownSpot]);

        expect(results).toHaveLength(1);
        expect(results[0].disease.slug).toBe('blast');
        expect(results[0].certaintyFactor).toBe(95);
    });
});

describe('filterByThreshold - edge cases', () => {
    it('returns all results when threshold is 0', () => {
        const results = [
            { certaintyFactor: 0.1 },
            { certaintyFactor: 50 },
            { certaintyFactor: 99 },
        ] as any;

        expect(filterByThreshold(results, 0)).toHaveLength(3);
    });

    it('handles empty array', () => {
        expect(filterByThreshold([], 0)).toHaveLength(0);
    });

    it('exact threshold value is included', () => {
        const results = [{ certaintyFactor: 20 }] as any;
        expect(filterByThreshold(results, 20)).toHaveLength(1);
    });

    it('just below threshold is excluded', () => {
        const results = [{ certaintyFactor: 19.99 }] as any;
        expect(filterByThreshold(results, 20)).toHaveLength(0);
    });
});
