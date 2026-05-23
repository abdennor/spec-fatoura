# e-facture-dz — Project Instructions

## What is this project?

**e-facture-dz** (also referred to as **spec-fatoura**) is an open, JSON-native electronic invoicing protocol designed for Algeria. It defines a machine-readable standard for creating, validating, digitally signing, and exchanging invoices in compliance with Algerian tax law (Décret exécutif n°05-468).

The repository is the **specification** repo. It contains:
- The protocol specification text (`SPECIFICATION.md`)
- The JSON Schema (`schemas/efacture-dz-1.0.schema.json`)
- Contribution guidelines and governance documents

---

## Repository Layout

```
spec-fatoura/
├── README.md                          # Overview and quick start
├── SPECIFICATION.md                   # Full technical spec (22 KB)
├── CONTRIBUTING.md                    # RFC-based contribution process
├── CODE_OF_CONDUCT.md                 # Community standards
├── LICENSE                            # Apache 2.0 (schema & code)
├── LICENSE-SPEC                       # CC BY 4.0 (specification text)
├── instruction.md                     # This file
├── memory.md                          # Project context and brainstorm notes
├── package.json                       # Monorepo root (npm workspaces)
├── tsconfig.base.json                 # Shared TypeScript config
├── packages/
│   └── core/                          # @e-facture-dz/core library
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts               # Barrel exports
│           ├── types.ts               # TypeScript interfaces
│           ├── validator.ts           # Schema + business rule validation
│           ├── tax.ts                 # Tax calculation utilities
│           ├── amount-words.ts        # Number-to-words (FR/AR)
│           └── tests/                 # Node.js test runner tests
└── schemas/
    └── efacture-dz-1.0.schema.json    # JSON Schema (Draft 2020-12)
```

Related (external) repos referenced in the project:
| Repo | Description |
|------|-------------|
| `e-facture-dz/validator` | Reference TypeScript validator |
| `e-facture-dz/examples` | Sample invoices and integration guides |

---

## Core Design Principles

1. **Simplicity First** — Simpler to implement than Factur-X or UBL
2. **JSON Native** — Modern developer-friendly format
3. **Algeria-first** — Built around DGI, NIF, RC, TVA, TAP, droit de timbre
4. **Cryptographically Verifiable** — Built-in digital signatures (RSA-SHA256 or ECDSA-P256)
5. **Interoperable** — Bidirectional mapping to UBL 2.1 and Factur-X/CII
6. **Open** — CC BY 4.0 (spec) + Apache 2.0 (schema/code)

---

## Document Types

| Code | FR Name | EN Name | Use |
|------|---------|---------|-----|
| `invoice` | Facture | Invoice | Standard commercial invoice |
| `credit_note` | Avoir | Credit Note | Refund or correction |
| `debit_note` | Note de débit | Debit Note | Additional charge |
| `proforma` | Facture proforma | Proforma Invoice | Quote / estimate |

---

## Invoice JSON Structure

Every document is wrapped in an `efacture` root object:

```
efacture/
├── version*         "1.0" (fixed)
├── type*            invoice | credit_note | debit_note | proforma
├── id*              Unique alphanumeric + hyphens ID
├── issueDate*       YYYY-MM-DD
├── dueDate          YYYY-MM-DD (optional)
├── currency*        ISO 4217 (e.g. DZD)
├── language         ISO 639-1 (default: fr)
├── seller*          Party object
├── buyer*           Party object
├── lines[]*         Array of line items (min 1)
├── totals*          Summary totals
├── payment          Payment info
├── notes            Free text
├── attachments[]    Embedded files (base64)
├── metadata         Software/generation info
└── signature        Digital signature
```
`*` = required

### Party Object (seller / buyer)
| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Legal name (raison sociale) |
| `nif` | Yes | 15–20 digit tax ID |
| `address` | Yes | street, city, country (ISO 3166-1 alpha-2) |
| `legalForm` | Seller: Yes | SARL, EURL, SPA, EI, … |
| `activityNature` | Seller: Yes | Description of business activity |
| `registrations.rc` | Seller: Yes | Registre de Commerce |
| `registrations.nis` | No | Statistical ID |
| `registrations.ai` | No | Article d'Imposition |
| `capitalSocial` | No | Share capital (number) |
| `contact` | No | phone, email, fax |

### Line Item Object
| Field | Required | Notes |
|-------|----------|-------|
| `description` | Yes | Item/service description |
| `amountBeforeTax` | Yes | HT amount (≥ 0) |
| `taxes[]` | Yes | Array of `{code, rate, amount}` |
| `total` | Yes | HT + all taxes |
| `metadata` | No | Free-form (quantity, unit, unitPrice, sku…) |

### Totals Object
| Field | Required | Notes |
|-------|----------|-------|
| `totalBeforeTax` | Yes | Sum of lines HT |
| `taxes[]` | Yes | Array of `{code, name, base, rate, amount}` |
| `totalTax` | Yes | Sum of all taxes |
| `stampDuty` | No | Cash-payment stamp duty `{base, rate, amount}` |
| `total` | Yes | Grand total TTC |
| `amountInWords` | No | Amount written in words |

---

## Algerian Tax Details

### Tax Codes
| Code | Name | Rate |
|------|------|------|
| `TVA_19` | TVA Taux Normal | 19% |
| `TVA_9` | TVA Taux Réduit | 9% |
| `EXONERE` | Exonéré de TVA | 0% |
| `HORS_CHAMP` | Hors champ TVA | 0% |
| `TAP` | Taxe sur l'Activité Professionnelle | 2% |

### Stamp Duty (Droit de Timbre)
- Rate: **1%** on cash payments
- Triggered when `payment.method = "cash"`
- Exempt for bank_transfer, check, credit_card, wire_transfer

### NIF Pattern
- `^[0-9]{15,20}$`
- Positions: Wilaya (2) + Taxpayer type (3) + Sequential (9) + Check digit (1)

### RC Pattern
- `^[0-9]{2}/[0-9]{2}-[0-9]{7}[A-Z][0-9]{2}$`
- e.g. `16/00-0012345B99`

### Legal Forms
SARL, EURL, SPA, SPAS, SPASU, SNC, SCS, GIE, EI, EPIC, OTHER

---

## Validation Rules (Business Logic)

1. Invoice ID: unique per seller, alphanumeric + hyphens
2. `issueDate` must not be in the future; `dueDate` ≥ `issueDate`
3. All monetary values: max 2 decimal places
4. Line tax: `amount` = `amountBeforeTax` × (`rate` / 100)
5. Line total: `total` = `amountBeforeTax` + Σ taxes
6. `totalBeforeTax` = Σ `lines[].amountBeforeTax`
7. Tax entry: `amount` = `base` × (`rate` / 100)
8. `totalTax` = Σ `taxes[].amount`
9. Stamp duty: `amount` = `base` × (`rate` / 100) when cash
10. Grand total: `total` = `totalBeforeTax` + `totalTax` + `stampDuty.amount`

---

## Digital Signature

**Algorithms:** RSA-SHA256 (recommended, AECE-compatible) or ECDSA-P256

**Signing Process:**
1. Extract fields to sign: `version`, `type`, `id`, `issueDate`, `dueDate`, `currency`, `seller`, `buyer`, `lines`, `totals`, `payment`, `notes`
2. Canonicalize: sort keys alphabetically, minify JSON
3. Hash: SHA-256
4. Sign with private key
5. Attach `signature` object to document

**Unsigned fields:** `metadata`, `signature`, `attachments`

**AECE Certificate:** THI9A-ENTREPRISE — Algerian qualified electronic seal, valid 2 years, from [ra.aece.dz](https://ra.aece.dz)

---

## PDF Embedding (e-facture PDF)

A PDF/A-3 file that embeds `efacture.json` as an Associated File:
- Relationship: `Data`
- MIME: `application/json`
- Required XMP metadata: `fx:DocumentType = efacture`, `fx:DocumentVersion`, `fx:InvoiceId`

---

## Interoperability

- **UBL 2.1**: Full field mapping defined in spec §9.1
- **Factur-X / CII**: Full field mapping defined in spec §9.2
- Round-trip conversion is lossless

---

## Versioning Policy

Semantic versioning (`MAJOR.MINOR.PATCH`):
- **MAJOR** → breaking changes (governance board + 30-day review)
- **MINOR** → new optional fields (maintainer + 14-day review)
- **PATCH** → fixes/clarifications (maintainer approval)

---

## Contribution Process (RFC)

1. Open an Issue describing the problem
2. Community discussion
3. Fork → branch → PR referencing the issue
4. Maintainer review
5. Merge

**Code style:**
- JSON Schema: 2-space indent, UTF-8
- Markdown: one sentence per line
- Dates: ISO 8601 | Currencies: ISO 4217 | Countries: ISO 3166-1

---

## Quick Validation

```bash
npx ajv validate -s schemas/efacture-dz-1.0.schema.json -d your-invoice.json
```
