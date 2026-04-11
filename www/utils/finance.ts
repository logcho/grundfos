// utils/finance.ts

export type CityKey = "Dallas" | "Austin" | "Houston" | "Tucson" | "Default";

export const TEXAS_UTILITY_RATES: Record<CityKey, number> = {
    "Dallas": 9.45,
    "Austin": 12.50,
    "Houston": 11.20,
    "Tucson": 14.80,
    "Default": 10.00
};

export interface FinancialROI {
    rateApplied: number;
    annualSavings: number;
}

export function calculateFinancialROI(annualYieldGallons: number, city: string = "Dallas"): FinancialROI {
    const cityKey = (TEXAS_UTILITY_RATES[city as CityKey] ? city : "Default") as CityKey;
    const ratePer1000 = TEXAS_UTILITY_RATES[cityKey];
    const annualSavingsUSD = (annualYieldGallons / 1000) * ratePer1000;

    return {
        rateApplied: ratePer1000,
        annualSavings: Math.round(annualSavingsUSD)
    };
}