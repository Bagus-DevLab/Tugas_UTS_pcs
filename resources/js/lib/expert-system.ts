/**
 * Expert System Engine - Forward Chaining + Certainty Factor
 *
 * Metode: Certainty Factor (CF) Combination
 * Formula: CF_combine(CF1, CF2) = CF1 + CF2 * (1 - CF1)
 *
 * Proses:
 * 1. User memilih gejala yang dialami
 * 2. Untuk setiap penyakit, cari gejala yang cocok
 * 3. Hitung CF gabungan dari gejala yang cocok
 * 4. Urutkan penyakit berdasarkan CF tertinggi
 */

export interface SymptomData {
    id: number;
    code: string;
    name: string;
    description: string | null;
}

export interface DiseaseData {
    id: number;
    name: string;
    slug: string;
    latin_name: string | null;
    description: string;
    cause: string;
    symptoms?: Array<SymptomData & { pivot: { weight: number } }>;
    treatments?: TreatmentData[];
}

export interface TreatmentData {
    id: number;
    disease_id: number;
    type: 'prevention' | 'chemical' | 'biological' | 'cultural';
    description: string;
    dosage: string | null;
    dosage_unit: string | null;
    priority: number;
}

export interface DiagnosisResult {
    disease: DiseaseData;
    certaintyFactor: number; // 0-100
    matchingSymptoms: number;
    totalSymptoms: number;
    matchedSymptomDetails: Array<{
        symptom: SymptomData;
        weight: number;
    }>;
}

/**
 * Perform diagnosis using Forward Chaining + Certainty Factor method
 *
 * @param selectedSymptomIds - Array of symptom IDs selected by user
 * @param diseases - Array of diseases with their symptoms (including pivot weights)
 * @returns Array of diagnosis results sorted by certainty factor (descending)
 */
export function diagnose(
    selectedSymptomIds: number[],
    diseases: DiseaseData[]
): DiagnosisResult[] {
    const results: DiagnosisResult[] = [];

    for (const disease of diseases) {
        // Skip "Healthy" disease in diagnosis
        if (disease.slug === 'healthy') continue;

        const diseaseSymptoms = disease.symptoms ?? [];
        const diseaseSymptomIds = diseaseSymptoms.map((s) => s.id);

        // Find matching symptoms (Forward Chaining)
        const matchingSymptomIds = selectedSymptomIds.filter((id) =>
            diseaseSymptomIds.includes(id)
        );

        if (matchingSymptomIds.length === 0) continue;

        // Calculate Certainty Factor using combination formula
        // CF_combine(CF1, CF2) = CF1 + CF2 * (1 - CF1)
        let combinedCF = 0;
        const matchedSymptomDetails: DiagnosisResult['matchedSymptomDetails'] = [];

        for (const symptomId of matchingSymptomIds) {
            const symptom = diseaseSymptoms.find((s) => s.id === symptomId);
            if (!symptom) continue;

            const weight = symptom.pivot.weight;
            matchedSymptomDetails.push({ symptom, weight });

            if (combinedCF === 0) {
                combinedCF = weight;
            } else {
                combinedCF = combinedCF + weight * (1 - combinedCF);
            }
        }

        results.push({
            disease,
            certaintyFactor: Math.round(combinedCF * 10000) / 100, // Convert to percentage
            matchingSymptoms: matchingSymptomIds.length,
            totalSymptoms: diseaseSymptomIds.length,
            matchedSymptomDetails,
        });
    }

    // Sort by certainty factor descending
    results.sort((a, b) => b.certaintyFactor - a.certaintyFactor);

    return results;
}

/**
 * Get the top diagnosis result
 */
export function getTopDiagnosis(results: DiagnosisResult[]): DiagnosisResult | null {
    return results.length > 0 ? results[0] : null;
}

/**
 * Filter results above a minimum certainty threshold
 */
export function filterByThreshold(
    results: DiagnosisResult[],
    minCertainty: number = 20
): DiagnosisResult[] {
    return results.filter((r) => r.certaintyFactor >= minCertainty);
}
