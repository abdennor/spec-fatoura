export type DocumentType = "invoice" | "credit_note" | "debit_note" | "proforma";
export type PaymentMethod = "cash" | "bank_transfer" | "check" | "credit_card" | "wire_transfer";
export type SignatureAlgorithm = "RSA-SHA256" | "ECDSA-P256";
export type LegalForm = "SARL" | "EURL" | "SPA" | "SPAS" | "SPASU" | "SNC" | "SCS" | "GIE" | "EI" | "EPIC" | "OTHER";

export interface Address {
  street: string;
  city: string;
  postalCode?: string;
  state?: string;
  country: string;
}

export interface Contact {
  phone?: string;
  email?: string;
  fax?: string;
}

export interface Registrations {
  rc?: string;
  nis?: string;
  ai?: string;
}

export interface Party {
  name: string;
  legalForm?: LegalForm;
  activityNature?: string;
  nif: string;
  registrations?: Registrations;
  capitalSocial?: number;
  address: Address;
  contact?: Contact;
}

export interface LineTax {
  code: string;
  rate: number;
  amount: number;
}

export interface LineItem {
  description: string;
  amountBeforeTax: number;
  taxes: LineTax[];
  total: number;
  metadata?: Record<string, unknown>;
}

export interface TaxEntry {
  code: string;
  name: string;
  base: number;
  rate: number;
  amount: number;
}

export interface StampDuty {
  base: number;
  rate: number;
  amount: number;
}

export interface Totals {
  totalBeforeTax: number;
  taxes: TaxEntry[];
  totalTax: number;
  stampDuty?: StampDuty;
  total: number;
  amountInWords?: string;
}

export interface BankAccount {
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  iban?: string;
  bic?: string;
}

export interface Payment {
  method?: PaymentMethod;
  terms?: string;
  bankAccount?: BankAccount;
  instructions?: string;
}

export interface Attachment {
  filename: string;
  mimeType: string;
  description?: string;
  data?: string;
}

export interface SoftwareVendor {
  name: string;
  website?: string;
  email?: string;
}

export interface Software {
  name: string;
  version: string;
  vendor?: SoftwareVendor;
}

export interface Metadata {
  generatedAt?: string;
  schemaVersion?: string;
  software?: Software;
}

export interface Signature {
  algorithm: SignatureAlgorithm;
  certificate?: string;
  value: string;
  signedAt?: string;
}

export interface EFactureDocument {
  version: "1.0";
  type: DocumentType;
  id: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  language?: string;
  seller: Party;
  buyer: Party;
  lines: LineItem[];
  totals: Totals;
  payment?: Payment;
  notes?: string;
  attachments?: Attachment[];
  metadata?: Metadata;
  signature?: Signature;
}

export interface EFactureEnvelope {
  $schema?: string;
  efacture: EFactureDocument;
}
