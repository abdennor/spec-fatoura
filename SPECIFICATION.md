# e-facture-dz Protocol Specification

**Version:** 1.0 (Draft)
**Date:** April 2026
**Status:** Draft
**License:** CC BY 4.0

---

## 1. Introduction

e-facture-dz is an open electronic invoicing protocol designed for Algeria. It provides a JSON-native standard for creating, validating, signing, and exchanging electronic invoices in compliance with Algerian tax regulations (Décret exécutif n°05-468).

### 1.1 Scope

This specification defines:
- The JSON schema for electronic invoice documents
- Algerian tax-specific fields and validation rules
- Digital signature requirements
- PDF embedding specification (e-facture PDF)
- Interoperability mappings with UBL 2.1 and Factur-X

### 1.2 Terminology

| Term | Definition |
|------|------------|
| **NIF** | Numéro d'Identification Fiscale — Algerian tax ID |
| **RC** | Registre de Commerce — Commercial registry number |
| **NIS** | Numéro d'Identification Statistique — Statistical ID |
| **AI** | Article d'Imposition — Tax article number |
| **DGI** | Direction Générale des Impôts — Algerian tax authority |
| **TVA** | Taxe sur la Valeur Ajoutée — Value Added Tax |
| **TAP** | Taxe sur l'Activité Professionnelle — Professional activity tax |
| **Jibayatic** | Algerian online tax declaration platform |

---

## 2. Document Types

| Type Code | Nom (FR) | Name (EN) | Description |
|-----------|----------|-----------|-------------|
| `invoice` | Facture | Invoice | Standard commercial invoice |
| `credit_note` | Avoir | Credit Note | Refund or correction |
| `debit_note` | Note de débit | Debit Note | Additional charge |
| `proforma` | Facture proforma | Proforma Invoice | Quote/estimate |

---

## 3. Schema Structure

### 3.1 Overview

```
efacture/
├── version          # Protocol version (required)
├── type             # Document type (required)
├── id               # Unique invoice identifier (required)
├── issueDate        # Invoice issue date (required)
├── dueDate          # Payment due date (optional)
├── currency         # ISO 4217 currency code (required)
├── language         # ISO 639-1 language code (optional)
├── seller           # Seller party details (required)
├── buyer            # Buyer party details (required)
├── lines[]          # Invoice line items with tax details (required, min 1)
├── totals           # Summary totals (required)
├── payment          # Payment information (optional)
├── notes            # Free-text notes (optional)
├── attachments[]    # Embedded documents (optional)
├── metadata         # Generation metadata including software info (optional)
└── signature        # Digital signature (optional)
```

### 3.2 Complete Example

```json
{
  "$schema": "https://e-facture-dz.github.io/spec/schemas/efacture-dz-1.0.schema.json",
  "efacture": {
    "version": "1.0",
    "type": "invoice",
    "id": "FAT-2024-001234",
    "issueDate": "2024-06-15",
    "dueDate": "2024-07-15",
    "currency": "DZD",
    "language": "fr",

    "seller": {
      "name": "Acme Software SARL",
      "legalForm": "SARL",
      "activityNature": "Développement et vente de logiciels",
      "nif": "000016000000001",
      "registrations": {
        "rc": "16/00-0012345B99",
        "nis": "16200012345678",
        "ai": "16500123456"
      },
      "capitalSocial": 1000000.00,
      "address": {
        "street": "123 Rue Didouche Mourad",
        "city": "Alger",
        "postalCode": "16000",
        "state": "Alger",
        "country": "DZ"
      },
      "contact": {
        "email": "contact@acme.dz",
        "phone": "+213 21 XX XX XX"
      }
    },

    "buyer": {
      "name": "TechCorp EURL",
      "legalForm": "EURL",
      "activityNature": "Services informatiques",
      "nif": "000031000000099",
      "registrations": {
        "rc": "31/00-0098765A12",
        "nis": "31200098765432"
      },
      "capitalSocial": 500000.00,
      "address": {
        "street": "45 Boulevard de l'ALN",
        "city": "Oran",
        "postalCode": "31000",
        "state": "Oran",
        "country": "DZ"
      },
      "contact": {
        "email": "comptabilite@techcorp.dz"
      }
    },

    "lines": [
      {
        "description": "Abonnement mensuel - Formule Pro",
        "amountBeforeTax": 50000.00,
        "taxes": [
          { "code": "TVA_19", "rate": 19, "amount": 9500.00 },
          { "code": "TAP", "rate": 2, "amount": 1000.00 }
        ],
        "total": 60500.00,
        "metadata": {
          "quantity": 1,
          "unit": "service",
          "unitPrice": 50000.00,
          "sku": "ABO-PRO-001"
        }
      },
      {
        "description": "Formation utilisateur",
        "amountBeforeTax": 10000.00,
        "taxes": [
          { "code": "TVA_19", "rate": 19, "amount": 1900.00 }
        ],
        "total": 11900.00,
        "metadata": {
          "quantity": 2,
          "unit": "heure",
          "unitPrice": 5000.00
        }
      }
    ],

    "totals": {
      "totalBeforeTax": 60000.00,
      "taxes": [
        {
          "code": "TVA_19",
          "name": "TVA Taux Normal",
          "base": 60000.00,
          "rate": 19,
          "amount": 11400.00
        },
        {
          "code": "TAP",
          "name": "Taxe sur l'Activité Professionnelle",
          "base": 50000.00,
          "rate": 2,
          "amount": 1000.00
        }
      ],
      "totalTax": 12400.00,
      "stampDuty": {
        "base": 72400.00,
        "rate": 1,
        "amount": 724.00
      },
      "total": 73124.00,
      "amountInWords": "Soixante-treize mille cent vingt-quatre dinars algériens"
    },

    "payment": {
      "method": "cash",
      "terms": "net_30",
      "bankAccount": {
        "bankName": "Banque Nationale d'Algérie",
        "bankCode": "BNA",
        "accountNumber": "00000000000000000000",
        "iban": "DZ0000000000000000000000",
        "bic": "BNADDZAL"
      },
      "instructions": "Référence à mentionner: FAT-2024-001234"
    },

    "notes": "Merci pour votre confiance. Facture payable sous 30 jours.",

    "metadata": {
      "generatedAt": "2024-06-15T10:30:00Z",
      "schemaVersion": "1.0",
      "software": {
        "name": "Mon Logiciel",
        "version": "1.0.0",
        "vendor": {
          "name": "Mon Entreprise SARL",
          "website": "https://example.dz",
          "email": "support@example.dz"
        }
      }
    },

    "signature": {
      "algorithm": "RSA-SHA256",
      "certificate": "base64-encoded-x509-certificate",
      "value": "base64-encoded-signature",
      "signedAt": "2024-06-15T10:30:00Z"
    }
  }
}
```

---

## 4. Field Definitions

### 4.1 Root Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | Yes | Protocol version (semver format) |
| `type` | enum | Yes | Document type: `invoice`, `credit_note`, `debit_note`, `proforma` |
| `id` | string | Yes | Unique invoice identifier |
| `issueDate` | date | Yes | Invoice issue date (ISO 8601: YYYY-MM-DD) |
| `dueDate` | date | No | Payment due date |
| `currency` | string | Yes | ISO 4217 currency code |
| `language` | string | No | ISO 639-1 language code (default: `fr`) |

### 4.2 Party Object (Seller/Buyer)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Legal business name (raison sociale) |
| `legalForm` | string | Yes* | Legal form of the entity |
| `activityNature` | string | Yes* | Nature/type of business activity |
| `nif` | string | Yes | Numéro d'Identification Fiscale (tax ID) |
| `registrations` | object | No | Country-specific registration numbers (RC, NIS, AI) |
| `capitalSocial` | decimal | No | Share capital amount (required for legal entities) |
| `address` | object | Yes | Postal address |
| `contact` | object | No | Contact information (phone, email, fax) |

*Required for seller in Algeria; conditionally required for buyer (if business entity).

### 4.3 Address Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `street` | string | Yes | Street address |
| `city` | string | Yes | City name |
| `postalCode` | string | No | Postal/ZIP code |
| `state` | string | No | State/Province/Wilaya |
| `country` | string | Yes | ISO 3166-1 alpha-2 country code |

### 4.4 Contact Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone` | string | No | Primary telephone number |
| `email` | string | No | Email address |
| `fax` | string | No | Fax number |

### 4.5 Line Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Item/service description |
| `amountBeforeTax` | decimal | Yes | Total amount before tax (HT) |
| `taxes` | array | Yes | All applicable taxes (VAT, TAP, etc.) |
| `total` | decimal | Yes | Line total including all taxes |
| `metadata` | object | No | Free-form object for additional line details |

### 4.6 Line Tax Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Tax code identifier (e.g., TVA_19, TAP) |
| `rate` | decimal | Yes | Tax rate percentage |
| `amount` | decimal | Yes | Calculated tax amount |

### 4.7 Totals Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalBeforeTax` | decimal | Yes | Sum of line items before tax (HT) |
| `taxes` | array | Yes | Breakdown of all taxes |
| `totalTax` | decimal | Yes | Sum of all tax amounts |
| `stampDuty` | object | No | Stamp duty for cash payments |
| `total` | decimal | Yes | Grand total including all taxes and stamp duty |
| `amountInWords` | string | No | Total amount written in words |

### 4.8 Tax Entry Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Tax code identifier |
| `name` | string | Yes | Tax name |
| `base` | decimal | Yes | Taxable base amount |
| `rate` | decimal | Yes | Tax rate percentage |
| `amount` | decimal | Yes | Calculated tax amount |

### 4.9 Stamp Duty Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `base` | decimal | Yes | Amount on which stamp duty is calculated |
| `rate` | decimal | Yes | Stamp duty rate as percentage |
| `amount` | decimal | Yes | Calculated stamp duty amount |

### 4.10 Metadata Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `generatedAt` | datetime | No | Timestamp when invoice was generated (ISO 8601) |
| `schemaVersion` | string | No | Version of the schema used |
| `software` | object | No | Information about the generating software |

### 4.11 Software Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name of the software that generated the invoice |
| `version` | string | Yes | Version of the software (semver recommended) |
| `vendor` | object | No | Information about the software vendor |

### 4.12 Vendor Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Legal name of the software vendor |
| `website` | string | No | Vendor's website URL |
| `email` | string | No | Vendor's support or contact email |

---

## 5. Algerian Tax Requirements

### 5.1 Registration Numbers

| Number | Name | Pattern | Required |
|--------|------|---------|----------|
| **NIF** | Numéro d'Identification Fiscale | `^[0-9]{15,20}$` | Yes |
| **RC** | Registre de Commerce | `^[0-9]{2}/[0-9]{2}-[0-9]{7}[A-Z][0-9]{2}$` | Yes (seller) |
| **NIS** | Numéro d'Identification Statistique | `^[0-9]{11,15}$` | No |
| **AI** | Article d'Imposition | `^[0-9]{11}$` | No |

### 5.2 NIF Structure

```
Position:  1-2   3-5    6-14       15
           ┌─┐   ┌─┐    ┌──────┐   ┌─┐
NIF:       16    000    000000001  X
           └─┘   └─┘    └──────┘   └─┘
           │     │      │          │
           │     │      │          └── Check digit
           │     │      └── Sequential number
           │     └── Taxpayer type code
           └── Wilaya code
```

**Validation:**
1. Length: 15 or 20 digits
2. Digits 1-2: Valid wilaya code (01-58)
3. Digits 3-5: Taxpayer type (specific codes)
4. Digit 15 (or 20): Check digit validation

### 5.3 RC (Registre de Commerce) Format

```
Format: WW/YY-NNNNNNNXNN

Where:
- WW: Wilaya code (01-58)
- YY: Registration year (last 2 digits)
- NNNNNNN: Sequential number (7 digits)
- X: Letter code (A-Z)
- NN: Additional number (2 digits)

Example: 16/00-0012345B99
```

### 5.4 Tax Codes

| Code | Name | Rate | Description |
|------|------|------|-------------|
| `TVA_19` | TVA Taux Normal | 19% | Standard rate for most goods and services |
| `TVA_9` | TVA Taux Réduit | 9% | Reduced rate for basic products |
| `EXONERE` | Exonéré de TVA | 0% | VAT exempt operations |
| `HORS_CHAMP` | Hors champ TVA | 0% | Outside VAT scope |
| `TAP` | Taxe sur l'Activité Professionnelle | 2% | Professional activity tax |

### 5.5 Currency

- Code: `DZD` (Dinar Algérien)
- Symbol: DA
- Decimals: 2

### 5.6 Stamp Duty (Droit de Timbre)

Applicable on cash payments per Article 300 of the Tax Code:
- Rate: 1%
- Applies when: `payment.method` is `cash`
- Exempt when: `bank_transfer`, `check`, `credit_card`, `wire_transfer`

### 5.7 Legal Forms

| Code | Name |
|------|------|
| `SARL` | Société à Responsabilité Limitée |
| `EURL` | Entreprise Unipersonnelle à Responsabilité Limitée |
| `SPA` | Société Par Actions |
| `SPAS` | Société Par Actions Simplifiée |
| `SPASU` | Société Par Actions Simplifiée Unipersonnelle |
| `SNC` | Société en Nom Collectif |
| `SCS` | Société en Commandite Simple |
| `GIE` | Groupement d'Intérêt Économique |
| `EI` | Entreprise Individuelle |
| `EPIC` | Établissement Public à caractère Industriel et Commercial |
| `OTHER` | Autre forme juridique |

### 5.8 Wilayas (Provinces)

58 wilayas with codes `01` (Adrar) through `58` (In Guezzam). See the JSON Schema for the complete list.

---

## 6. Validation Rules

1. **Invoice ID:** Must be unique per seller, alphanumeric with hyphens allowed
2. **Dates:** `issueDate` must not be in the future; `dueDate` must be >= `issueDate`
3. **Amounts:** All monetary values must have max 2 decimal places
4. **Line Tax:** For each tax: `amount` = `amountBeforeTax` x (`rate` / 100)
5. **Line Total:** `total` = `amountBeforeTax` + sum of `taxes[].amount`
6. **Total Before Tax:** `totalBeforeTax` = sum of all `lines[].amountBeforeTax`
7. **Tax Entry:** For each totals tax entry: `amount` = `base` x (`rate` / 100)
8. **Total Tax:** `totalTax` = sum of all `taxes[].amount`
9. **Stamp Duty:** If cash payment: `stampDuty.amount` = `stampDuty.base` x (`stampDuty.rate` / 100)
10. **Grand Total:** `total` = `totalBeforeTax` + `totalTax` + `stampDuty.amount` (if applicable)
11. **NIF:** Must match pattern `^[0-9]{15,20}$`

---

## 7. Security & Signing

### 7.1 Supported Algorithms

| Algorithm | Use Case | Key Size |
|-----------|----------|----------|
| RSA-SHA256 | AECE compatible (recommended) | 2048-bit minimum |
| ECDSA P-256 | Alternative | 256-bit |

### 7.2 Signed vs Unsigned Fields

**Signed fields:**
- `version`, `type`, `id`, `issueDate`, `dueDate`, `currency`
- `seller`, `buyer`, `lines`, `totals`, `payment`, `notes`

**Unsigned fields:**
- `metadata` (software info, timestamps)
- `signature` (the signature itself)
- `attachments`

### 7.3 Signature Structure

```json
{
  "signature": {
    "algorithm": "RSA-SHA256",
    "certificate": "base64-encoded-x509-certificate",
    "value": "base64-encoded-signature",
    "signedAt": "2024-06-15T10:30:00Z"
  }
}
```

### 7.4 Signing Process

1. **Extract**: Remove `metadata`, `signature`, and `attachments` fields
2. **Canonicalize**: Sort keys alphabetically, minify JSON
3. **Hash**: SHA-256 hash of canonical JSON
4. **Sign**: Sign hash with private key (RSA-SHA256 or ECDSA)
5. **Attach**: Add signature object to invoice

### 7.5 AECE THI9A-ENTREPRISE Certificate

Algeria requires qualified electronic seals from AECE (Autorité Économique de Certification Électronique).

**THI9A-ENTREPRISE:**
- Electronic seal certificate for legal entities
- Valid for 2 years with unlimited sealing operations
- FIPS 140-2 certified secure device
- Compliant with Loi 15-04

**How to obtain:**
1. Register at [ra.aece.dz](https://ra.aece.dz)
2. Submit required documents
3. Complete identity verification
4. Receive secure signature device

---

## 8. PDF Embedding (e-facture PDF)

An "e-facture PDF" is a PDF/A-3 compliant file that embeds the machine-readable JSON. This enables human-readable invoices that also contain structured data for automated processing.

### 8.1 File Structure

```
invoice.pdf (PDF/A-3)
│
├── Visual content (rendered by implementation)
│   └── Invoice layout, logo, formatting, etc.
│
└── Embedded files (Associated Files - AF)
    ├── efacture.json          # Complete document (REQUIRED)
    │   └── Relationship: "Data"
    │   └── MIME type: "application/json"
    │
    └── [attachments...]      # Original attachments
```

### 8.2 PDF Metadata Requirements

| Metadata Field | Value | Required |
|----------------|-------|----------|
| `dc:format` | `application/pdf` | Yes |
| `pdfaid:part` | `3` | Yes |
| `pdfaid:conformance` | `B` (basic) or `A` (accessible) | Yes |
| `fx:DocumentType` | `efacture` | Yes |
| `fx:DocumentVersion` | Protocol version (e.g., `1.0`) | Yes |
| `fx:InvoiceId` | Value of `efacture.id` | Yes |

### 8.3 Embedding Rules

1. **efacture.json** MUST be embedded as an Associated File (AF) at document level
2. MUST use relationship type `Data` (AFRelationship)
3. MUST include the complete document including signature
4. File name MUST be `efacture.json`
5. The `signature` field remains inside `efacture.json` — no separate signature file needed
6. PDF digital signatures (PAdES) are optional and independent

### 8.4 Validation

A valid e-facture PDF MUST:
1. Be PDF/A-3 compliant
2. Contain exactly one `efacture.json` embedded file
3. Have `efacture.json` pass schema validation
4. Have matching metadata (`fx:InvoiceId` = `efacture.id`)

---

## 9. Interoperability

### 9.1 Field Mapping: e-facture-dz to UBL 2.1

| e-facture-dz Field | UBL 2.1 Element |
|---------------------|-----------------|
| `id` | `cbc:ID` |
| `issueDate` | `cbc:IssueDate` |
| `dueDate` | `cbc:DueDate` |
| `type` | `cbc:InvoiceTypeCode` |
| `currency` | `cbc:DocumentCurrencyCode` |
| `seller.name` | `cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name` |
| `seller.nif` | `cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID` |
| `seller.registrations.rc` | `cac:AccountingSupplierParty/cac:Party/cac:PartyLegalEntity/cbc:CompanyID` |
| `seller.address` | `cac:AccountingSupplierParty/cac:Party/cac:PostalAddress` |
| `buyer.name` | `cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name` |
| `buyer.nif` | `cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID` |
| `buyer.address` | `cac:AccountingCustomerParty/cac:Party/cac:PostalAddress` |
| `lines[].description` | `cac:InvoiceLine/cac:Item/cbc:Name` |
| `lines[].amountBeforeTax` | `cac:InvoiceLine/cbc:LineExtensionAmount` |
| `lines[].taxes[].code` | `cac:InvoiceLine/cac:Item/cac:ClassifiedTaxCategory/cbc:ID` |
| `lines[].taxes[].rate` | `cac:InvoiceLine/cac:Item/cac:ClassifiedTaxCategory/cbc:Percent` |
| `totals.totalBeforeTax` | `cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount` |
| `totals.totalTax` | `cac:TaxTotal/cbc:TaxAmount` |
| `totals.total` | `cac:LegalMonetaryTotal/cbc:PayableAmount` |
| `payment.method` | `cac:PaymentMeans/cbc:PaymentMeansCode` |
| `payment.bankAccount.iban` | `cac:PaymentMeans/cac:PayeeFinancialAccount/cbc:ID` |
| `notes` | `cbc:Note` |

### 9.2 Field Mapping: e-facture-dz to Factur-X (CII)

| e-facture-dz Field | Factur-X (CII) Element |
|---------------------|------------------------|
| `id` | `rsm:ExchangedDocument/ram:ID` |
| `issueDate` | `rsm:ExchangedDocument/ram:IssueDateTime` |
| `type` | `rsm:ExchangedDocument/ram:TypeCode` |
| `currency` | `ram:InvoiceCurrencyCode` |
| `seller.name` | `ram:SellerTradeParty/ram:Name` |
| `seller.nif` | `ram:SellerTradeParty/ram:SpecifiedTaxRegistration/ram:ID` |
| `seller.registrations.rc` | `ram:SellerTradeParty/ram:SpecifiedLegalOrganization/ram:ID` |
| `seller.address` | `ram:SellerTradeParty/ram:PostalTradeAddress` |
| `buyer.name` | `ram:BuyerTradeParty/ram:Name` |
| `buyer.nif` | `ram:BuyerTradeParty/ram:SpecifiedTaxRegistration/ram:ID` |
| `buyer.address` | `ram:BuyerTradeParty/ram:PostalTradeAddress` |
| `lines[].description` | `ram:SpecifiedTradeProduct/ram:Name` |
| `lines[].amountBeforeTax` | `ram:SpecifiedLineTradeSettlement/.../ram:LineTotalAmount` |
| `lines[].taxes[].rate` | `ram:ApplicableTradeTax/ram:RateApplicablePercent` |
| `totals.totalBeforeTax` | `ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:TaxBasisTotalAmount` |
| `totals.totalTax` | `ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:TaxTotalAmount` |
| `totals.total` | `ram:SpecifiedTradeSettlementHeaderMonetarySummation/ram:GrandTotalAmount` |
| `payment.method` | `ram:SpecifiedTradeSettlementPaymentMeans/ram:TypeCode` |
| `notes` | `ram:IncludedNote/ram:Content` |

### 9.3 Lossless Conversion

The schema captures all mandatory fields required by UBL and Factur-X:
- **No data loss** when converting to international standards
- **Round-trip capability**: e-facture-dz to UBL to e-facture-dz produces identical output
- **Extension data preserved** in custom namespaces when converting

---

## 10. Versioning

**Semantic Versioning:** `MAJOR.MINOR.PATCH`

| Change Type | Version Impact | Example |
|-------------|----------------|---------|
| Breaking changes | MAJOR | 1.0 to 2.0 |
| New optional fields | MINOR | 1.0 to 1.1 |
| Bug fixes, clarifications | PATCH | 1.0.0 to 1.0.1 |

**Compatibility Guarantee:**
- MINOR versions are backward compatible
- MAJOR versions provide a migration guide
- Deprecated fields are supported for 2 major versions

---

## 11. References

- Direction Générale des Impôts (DGI): https://www.mfdgi.gov.dz
- UBL 2.1 Specification: http://docs.oasis-open.org/ubl/UBL-2.1.html
- Factur-X Specification: https://fnfe-mpe.org/factur-x/
- UN/CEFACT CII: https://unece.org/trade/uncefact
- JSON Schema: https://json-schema.org/
- AECE: https://aece.dz/fr/services/
