# e-facture-dz — Protocol Specification

**Version:** 1.0 (Draft)
**Status:** Draft
**License:** CC BY 4.0 (specification) / Apache 2.0 (schema)

---

## Overview

e-facture-dz defines a JSON-native electronic invoicing protocol for Algeria. It provides a structured, machine-readable format for creating, validating, signing, and exchanging invoices in compliance with Algerian tax regulations (Décret exécutif n°05-468).

### Design Principles

1. **Simplicity First** — Easier to implement than Factur-X or UBL
2. **JSON Native** — Modern format preferred by developers
3. **Algeria-first** — Built for DGI, NIF, RC, TVA, TAP, and droit de timbre
4. **Cryptographically Verifiable** — Built-in digital signatures
5. **Interoperable** — Bidirectional conversion with UBL 2.1 and Factur-X
6. **Open** — Freely available specification and reference implementations

## Document Types

| Type Code | Nom (FR) | Name (EN) | Description |
|-----------|----------|-----------|-------------|
| `invoice` | Facture | Invoice | Standard commercial invoice |
| `credit_note` | Avoir | Credit Note | Refund or correction |
| `debit_note` | Note de débit | Debit Note | Additional charge |
| `proforma` | Facture proforma | Proforma Invoice | Quote/estimate |

## Schema Structure

```
fatoura/
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

## Quick Start

### 1. Validate an invoice against the schema

```bash
# Using any JSON Schema validator
npx ajv validate -s schemas/fatoura-dz-1.0.schema.json -d your-invoice.json
```

### 2. Use the reference validator

See the [validator](https://github.com/e-facture-dz/validator) repository for the TypeScript reference implementation that validates both schema conformance and business rules.

### 3. Browse examples

See the [examples](https://github.com/e-facture-dz/examples) repository for sample invoices.

## Repository Structure

```
spec/
├── README.md                        # This file
├── SPECIFICATION.md                 # Complete technical specification
├── CONTRIBUTING.md                  # Contribution guidelines
├── CODE_OF_CONDUCT.md               # Code of conduct
├── LICENSE                          # Apache 2.0 (schema & code)
├── LICENSE-SPEC                     # CC BY 4.0 (specification text)
└── schemas/
    └── fatoura-dz-1.0.schema.json   # JSON Schema
```

## Related Repositories

| Repo | Description |
|------|-------------|
| [validator](https://github.com/e-facture-dz/validator) | Reference TypeScript validator |
| [examples](https://github.com/e-facture-dz/examples) | Sample invoices and integration guides |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to the specification.

## License

- **Specification text** (`SPECIFICATION.md`): [Creative Commons Attribution 4.0](LICENSE-SPEC)
- **Schema files and code**: [Apache License 2.0](LICENSE)
