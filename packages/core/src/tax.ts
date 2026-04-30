export type TaxCode = "TVA_19" | "TVA_9" | "EXONERE" | "HORS_CHAMP" | "TAP";

export const TAX_RATES: Record<TaxCode, number> = {
  TVA_19: 19,
  TVA_9: 9,
  EXONERE: 0,
  HORS_CHAMP: 0,
  TAP: 2,
};

export const TAX_NAMES: Record<TaxCode, string> = {
  TVA_19: "TVA Taux Normal",
  TVA_9: "TVA Taux Réduit",
  EXONERE: "Exonéré de TVA",
  HORS_CHAMP: "Hors champ TVA",
  TAP: "Taxe sur l'Activité Professionnelle",
};

export const STAMP_DUTY_RATE = 1; // 1% on cash payments

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface LineTaxCalcInput {
  amountBeforeTax: number;
  taxCodes: TaxCode[];
}

export interface LineTaxCalcResult {
  amountBeforeTax: number;
  taxes: Array<{ code: TaxCode; rate: number; amount: number }>;
  total: number;
}

/**
 * Calculate taxes and total for a single invoice line.
 */
export function calcLineTaxes(input: LineTaxCalcInput): LineTaxCalcResult {
  const taxes = input.taxCodes.map((code) => {
    const rate = TAX_RATES[code];
    return { code, rate, amount: round2(input.amountBeforeTax * (rate / 100)) };
  });
  const taxSum = taxes.reduce((s, t) => s + t.amount, 0);
  return {
    amountBeforeTax: input.amountBeforeTax,
    taxes,
    total: round2(input.amountBeforeTax + taxSum),
  };
}

export interface TotalsCalcInput {
  lines: Array<{ amountBeforeTax: number; taxes: Array<{ code: string; rate: number; amount: number }> }>;
  isCashPayment?: boolean;
}

export interface TotalsCalcResult {
  totalBeforeTax: number;
  taxes: Array<{ code: string; name: string; base: number; rate: number; amount: number }>;
  totalTax: number;
  stampDuty?: { base: number; rate: number; amount: number };
  total: number;
}

/**
 * Calculate invoice totals from line items.
 */
export function calcTotals(input: TotalsCalcInput): TotalsCalcResult {
  const totalBeforeTax = round2(input.lines.reduce((s, l) => s + l.amountBeforeTax, 0));

  // Aggregate taxes by code
  const taxMap = new Map<string, { rate: number; base: number; amount: number }>();
  for (const line of input.lines) {
    for (const tax of line.taxes) {
      const existing = taxMap.get(tax.code);
      if (existing) {
        existing.base = round2(existing.base + line.amountBeforeTax);
        existing.amount = round2(existing.amount + tax.amount);
      } else {
        taxMap.set(tax.code, { rate: tax.rate, base: line.amountBeforeTax, amount: tax.amount });
      }
    }
  }

  const taxes = Array.from(taxMap.entries()).map(([code, entry]) => ({
    code,
    name: TAX_NAMES[code as TaxCode] ?? code,
    base: entry.base,
    rate: entry.rate,
    amount: entry.amount,
  }));

  const totalTax = round2(taxes.reduce((s, t) => s + t.amount, 0));

  let stampDuty: TotalsCalcResult["stampDuty"];
  let grandTotal = round2(totalBeforeTax + totalTax);

  if (input.isCashPayment) {
    const stampBase = grandTotal;
    const stampAmount = round2(stampBase * (STAMP_DUTY_RATE / 100));
    stampDuty = { base: stampBase, rate: STAMP_DUTY_RATE, amount: stampAmount };
    grandTotal = round2(grandTotal + stampAmount);
  }

  return { totalBeforeTax, taxes, totalTax, stampDuty, total: grandTotal };
}
