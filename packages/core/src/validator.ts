import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { EFactureEnvelope } from "./types.js";

// @ts-ignore - ESM default import compatibility
const AjvConstructor = (Ajv2020 as any).default ?? Ajv2020;
// @ts-ignore - ESM default import compatibility
const addFormatsCompat = (addFormats as any).default ?? addFormats;

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load schema from the schemas directory in the repo root
const schemaPath = join(__dirname, "../../../schemas/efacture-dz-1.0.schema.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

const ajv = new AjvConstructor({ allErrors: true, strict: false });
addFormatsCompat(ajv);
const validateSchema = ajv.compile(schema);

export interface ValidationError {
  code: string;
  message: string;
  path?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function approxEqual(a: number, b: number, tolerance = 0.01): boolean {
  return Math.abs(a - b) <= tolerance;
}

/**
 * Validate an e-facture-dz envelope against the JSON Schema and business rules.
 */
export function validate(envelope: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. JSON Schema validation
  const schemaValid = validateSchema(envelope);
  if (!schemaValid && validateSchema.errors) {
    for (const err of validateSchema.errors) {
      errors.push({
        code: "SCHEMA_ERROR",
        message: err.message ?? "Schema validation error",
        path: err.instancePath || undefined,
      });
    }
    return { valid: false, errors };
  }

  const env = envelope as EFactureEnvelope;
  const doc = env.efacture;

  // Rule 1: Invoice ID alphanumeric with hyphens
  if (!/^[a-zA-Z0-9\-]+$/.test(doc.id)) {
    errors.push({ code: "INVALID_ID", message: "Invoice ID must be alphanumeric with hyphens only" });
  }

  // Rule 2: Dates
  const issueDate = new Date(doc.issueDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (issueDate > today) {
    errors.push({ code: "FUTURE_ISSUE_DATE", message: "issueDate must not be in the future" });
  }
  if (doc.dueDate) {
    const dueDate = new Date(doc.dueDate);
    if (dueDate < issueDate) {
      errors.push({ code: "INVALID_DUE_DATE", message: "dueDate must be >= issueDate" });
    }
  }

  // Rule 3: Amounts have max 2 decimal places
  const checkDecimals = (val: number, field: string) => {
    if (round2(val) !== val) {
      errors.push({ code: "TOO_MANY_DECIMALS", message: `${field} must have at most 2 decimal places`, path: field });
    }
  };

  // Rules 4 & 5: Line-level tax and total
  for (let i = 0; i < doc.lines.length; i++) {
    const line = doc.lines[i];
    checkDecimals(line.amountBeforeTax, `lines[${i}].amountBeforeTax`);
    checkDecimals(line.total, `lines[${i}].total`);

    let taxSum = 0;
    for (let j = 0; j < line.taxes.length; j++) {
      const tax = line.taxes[j];
      checkDecimals(tax.amount, `lines[${i}].taxes[${j}].amount`);
      const expectedTax = round2(line.amountBeforeTax * (tax.rate / 100));
      if (!approxEqual(tax.amount, expectedTax)) {
        errors.push({
          code: "INVALID_LINE_TAX_AMOUNT",
          message: `lines[${i}].taxes[${j}].amount ${tax.amount} does not match amountBeforeTax × rate/100 = ${expectedTax}`,
        });
      }
      taxSum += tax.amount;
    }

    const expectedTotal = round2(line.amountBeforeTax + taxSum);
    if (!approxEqual(line.total, expectedTotal)) {
      errors.push({
        code: "INVALID_LINE_TOTAL",
        message: `lines[${i}].total ${line.total} does not match amountBeforeTax + sum(taxes) = ${expectedTotal}`,
      });
    }
  }

  // Rule 6: totalBeforeTax = sum of lines
  const sumHT = round2(doc.lines.reduce((s, l) => s + l.amountBeforeTax, 0));
  if (!approxEqual(doc.totals.totalBeforeTax, sumHT)) {
    errors.push({
      code: "INVALID_TOTAL_BEFORE_TAX",
      message: `totals.totalBeforeTax ${doc.totals.totalBeforeTax} does not match sum of lines = ${sumHT}`,
    });
  }

  // Rule 7: Each tax entry amount = base × rate/100
  for (let i = 0; i < doc.totals.taxes.length; i++) {
    const te = doc.totals.taxes[i];
    const expected = round2(te.base * (te.rate / 100));
    if (!approxEqual(te.amount, expected)) {
      errors.push({
        code: "INVALID_TAX_ENTRY_AMOUNT",
        message: `totals.taxes[${i}].amount ${te.amount} does not match base × rate/100 = ${expected}`,
      });
    }
  }

  // Rule 8: totalTax = sum of taxes
  const sumTax = round2(doc.totals.taxes.reduce((s, t) => s + t.amount, 0));
  if (!approxEqual(doc.totals.totalTax, sumTax)) {
    errors.push({
      code: "INVALID_TOTAL_TAX",
      message: `totals.totalTax ${doc.totals.totalTax} does not match sum of tax entries = ${sumTax}`,
    });
  }

  // Rule 9: Stamp duty
  if (doc.totals.stampDuty) {
    const sd = doc.totals.stampDuty;
    const expectedSd = round2(sd.base * (sd.rate / 100));
    if (!approxEqual(sd.amount, expectedSd)) {
      errors.push({
        code: "INVALID_STAMP_DUTY",
        message: `totals.stampDuty.amount ${sd.amount} does not match base × rate/100 = ${expectedSd}`,
      });
    }
  }

  // Rule 10: Grand total
  const stampAmount = doc.totals.stampDuty?.amount ?? 0;
  const expectedGrand = round2(doc.totals.totalBeforeTax + doc.totals.totalTax + stampAmount);
  if (!approxEqual(doc.totals.total, expectedGrand)) {
    errors.push({
      code: "INVALID_GRAND_TOTAL",
      message: `totals.total ${doc.totals.total} does not match totalBeforeTax + totalTax + stampDuty = ${expectedGrand}`,
    });
  }

  // Rule 11: NIF pattern
  const nifPattern = /^[0-9]{15,20}$/;
  if (!nifPattern.test(doc.seller.nif)) {
    errors.push({ code: "INVALID_SELLER_NIF", message: "seller.nif must be 15-20 digits", path: "seller.nif" });
  }
  if (!nifPattern.test(doc.buyer.nif)) {
    errors.push({ code: "INVALID_BUYER_NIF", message: "buyer.nif must be 15-20 digits", path: "buyer.nif" });
  }

  return { valid: errors.length === 0, errors };
}
