export interface ViabilityScoreInput {
    usableSqft?: number;
    annualSavings?: number;
    hasCoolingTowers?: boolean;
    esgRiskScore?: number;
}

export interface ViabilityBreakdown {
    financial: number;
    physical: number;
    esg: number;
}

export interface ViabilityResult {
    score: number;
    breakdown: ViabilityBreakdown;
    status: string;
    uiColor: string;
}

export function calculateViabilityScore({
    usableSqft = 0,
    annualSavings = 0,
    hasCoolingTowers = false,
    esgRiskScore = 50
}: ViabilityScoreInput): ViabilityResult {
    // 1. Define the Weights (Must sum to 1.0)
    const weights = {
        financial: 0.45,
        physical: 0.25,
        esg: 0.30
    };

    // 2. Define Normalization Ceilings 
    // Adjusted: 150k is now the ceiling. 100k will score very well (66/100).
    const CEILINGS = {
        sqft: 150000,
        savings: 150000
    };

    // 3. Normalize the raw data to a 0-100 scale
    let normPhysical = Math.min((usableSqft / CEILINGS.sqft) * 100, 100);
    let normFinancial = Math.min((annualSavings / CEILINGS.savings) * 100, 100);
    let normESG = Math.min(esgRiskScore, 100);

    // 4. Calculate the Base Score
    let baseScore = (normFinancial * weights.financial) +
        (normPhysical * weights.physical) +
        (normESG * weights.esg);

    // 5. Apply the Cooling Tower "Gate"
    let finalScore = baseScore;
    if (!hasCoolingTowers) {
        // Softened penalty: Only a 15% reduction. 
        // The building can still use water for toilets, irrigation, or process water.
        finalScore = finalScore * 0.85;
    }

    // Round the score for clean UI display
    finalScore = Math.round(finalScore);

    // 6. Determine Classification Tier for your Next.js UI
    let status = "PENDING";
    let statusColor = "gray";

    if (finalScore >= 80) {
        // If it scores above 80 without a cooling tower, it's still a massive opportunity.
        // We just differentiate the label slightly for the sales team.
        status = hasCoolingTowers ? "PRIME TARGET" : "HIGHLY VIABLE";
        statusColor = "emerald"; // Tailwind green
    } else if (finalScore >= 45) { // Lowered the floor slightly to 45
        status = "VIABLE";
        statusColor = "blue";
    } else {
        status = "REJECTED";
        statusColor = "rose"; // Tailwind red
    }

    return {
        score: finalScore,
        breakdown: {
            financial: Math.round(normFinancial),
            physical: Math.round(normPhysical),
            esg: Math.round(normESG)
        },
        status: status,
        uiColor: statusColor
    };
}