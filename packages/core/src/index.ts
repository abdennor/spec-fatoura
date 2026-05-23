export type {
  DocumentType,
  PaymentMethod,
  SignatureAlgorithm,
  LegalForm,
  Address,
  Contact,
  Registrations,
  Party,
  LineTax,
  LineItem,
  TaxEntry,
  StampDuty,
  Totals,
  BankAccount,
  Payment,
  Attachment,
  SoftwareVendor,
  Software,
  Metadata,
  Signature,
  EFactureDocument,
  EFactureEnvelope,
} from "./types.js";

export { validate } from "./validator.js";
export type { ValidationError, ValidationResult } from "./validator.js";

export {
  TAX_RATES,
  TAX_NAMES,
  STAMP_DUTY_RATE,
  calcLineTaxes,
  calcTotals,
} from "./tax.js";
export type { TaxCode, LineTaxCalcInput, LineTaxCalcResult, TotalsCalcInput, TotalsCalcResult } from "./tax.js";

export { amountToWords } from "./amount-words.js";
