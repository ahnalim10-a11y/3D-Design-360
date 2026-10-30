/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MeasurementUnit, Language } from '../types';

// Conversion factors to and from standard internal unit (FEET)
export const UNIT_CONVERSIONS = {
  ft: 1.0,
  in: 1 / 12,
  m: 3.28084,
  cm: 0.0328084,
  mm: 0.00328084,
};

// Bangladesh land measurement constants
export const BANGLADESH_LAND_UNITS = {
  SQFT_PER_DECIMAL: 435.6,   // ১ শতক / শতাংশ = ৪৩৫.৬ বর্গফুট
  SQFT_PER_KATHA: 720.0,     // ১ কাঠা = ৭২০ বর্গফুট
  SQFT_PER_BIGHA: 14400.0,   // ১ বিঘা = ২০ কাঠা = ১৪,৪০০ বর্গফুট
  SQFT_PER_SQM: 10.7639,     // ১ বর্গমিটার = ১০.৭৬৩৯ বর্গফুট
};

/**
 * Convert user input number in specified unit into internal FEET value.
 */
export function convertToFeet(value: number, fromUnit: MeasurementUnit): number {
  if (isNaN(value)) return 0;
  return value * UNIT_CONVERSIONS[fromUnit];
}

/**
 * Convert internal FEET into specified unit value.
 */
export function convertFromFeet(feet: number, toUnit: MeasurementUnit): number {
  if (isNaN(feet)) return 0;
  return feet / UNIT_CONVERSIONS[toUnit];
}

/**
 * Format feet into traditional Feet and Inches (e.g., 14' 6" or 14' 0")
 */
export function formatFeetInches(totalFeet: number, lang: Language = 'bn'): string {
  if (isNaN(totalFeet)) return '0';
  const sign = totalFeet < 0 ? '-' : '';
  const absFeet = Math.abs(totalFeet);
  const ft = Math.floor(absFeet);
  const totalInches = Math.round((absFeet - ft) * 12);

  let finalFt = ft;
  let finalIn = totalInches;
  if (finalIn >= 12) {
    finalFt += 1;
    finalIn = 0;
  }

  if (lang === 'bn') {
    return `${sign}${toBengaliNumerals(finalFt)}' ${toBengaliNumerals(finalIn)}"`;
  }
  return `${sign}${finalFt}' ${finalIn}"`;
}

/**
 * Format dimension according to active unit and language
 */
export function formatDimension(feet: number, unit: MeasurementUnit, lang: Language = 'bn'): string {
  if (unit === 'ft') {
    return formatFeetInches(feet, lang);
  }
  const val = convertFromFeet(feet, unit);
  const formattedVal = val.toFixed(1).replace(/\.0$/, '');

  const unitLabels: Record<MeasurementUnit, { bn: string; en: string }> = {
    ft: { bn: 'ফুট', en: 'ft' },
    in: { bn: 'ইঞ্চি', en: 'in' },
    m: { bn: 'মিটার', en: 'm' },
    cm: { bn: 'সেমি', en: 'cm' },
    mm: { bn: 'মিমি', en: 'mm' },
  };

  const unitStr = lang === 'bn' ? unitLabels[unit].bn : unitLabels[unit].en;
  const numStr = lang === 'bn' ? toBengaliNumerals(formattedVal) : formattedVal;
  return `${numStr} ${unitStr}`;
}

/**
 * Convert English numbers/strings to Bengali Numerals
 */
export function toBengaliNumerals(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bnDigits[parseInt(digit, 10)]);
}

/**
 * Format currency in Bangladeshi Taka
 */
export function formatCurrencyBDT(amount: number, lang: Language = 'bn'): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);

  if (lang === 'bn') {
    return `৳ ${toBengaliNumerals(formatted)}`;
  }
  return `BDT ${formatted}`;
}

export interface LandAreaBreakdown {
  sqFt: number;
  decimals: number; // শতক
  katha: number;    // কাঠা
  sqMeters: number;
}

/**
 * Calculate comprehensive land area in sq ft, decimal (শতক), katha (কাঠা), and sq meters
 */
export function calculateLandArea(lengthFt: number, widthFt: number): LandAreaBreakdown {
  const sqFt = Math.max(0, lengthFt * widthFt);
  const decimals = sqFt / BANGLADESH_LAND_UNITS.SQFT_PER_DECIMAL;
  const katha = sqFt / BANGLADESH_LAND_UNITS.SQFT_PER_KATHA;
  const sqMeters = sqFt / BANGLADESH_LAND_UNITS.SQFT_PER_SQM;

  return {
    sqFt: Math.round(sqFt * 100) / 100,
    decimals: Math.round(decimals * 100) / 100,
    katha: Math.round(katha * 100) / 100,
    sqMeters: Math.round(sqMeters * 100) / 100,
  };
}
