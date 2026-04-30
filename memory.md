# e-facture-dz — Memory & Brainstorm Context

## Project State (as of April 2026)

- **Status:** Draft v1.0 — specification and JSON Schema exist; no production implementations in this repo yet
- **Ecosystem:** Spec repo only; `validator` and `examples` repos are referenced but external
- **Maturity:** Early stage — community, governance board, and RFC process not yet formalized

---

## What Exists

| Artifact | Status |
|----------|--------|
| `SPECIFICATION.md` | Complete technical spec (11 sections, 650+ lines) |
| `schemas/efacture-dz-1.0.schema.json` | JSON Schema Draft 2020-12, ~450 lines |
| `README.md` | Overview + quick start |
| `CONTRIBUTING.md` | RFC process, change categories |
| `CODE_OF_CONDUCT.md` | Standard CoC |
| `LICENSE` + `LICENSE-SPEC` | Apache 2.0 + CC BY 4.0 |

---

## What is Missing / Potential Gaps

### Documentation Gaps
- No Arabic translation of the specification (mentioned as desired in CONTRIBUTING)
- No migration guide for future major versions
- No FAQ or troubleshooting guide
- No implementation guide / developer onboarding

### Schema / Spec Gaps
- `id` pattern only allows `^[a-zA-Z0-9\-]+$` — no guidance on recommended format (e.g. FAT-YYYY-NNNNNN)
- NIF validation in schema checks pattern but not check-digit logic (business rule only)
- No formal list of the 58 wilaya codes in the schema (spec mentions them but schema doesn't enumerate them for NIF validation)
- `TAP` applicability rules not enforced (TAP is 2% on gross revenue, not all lines qualify)
- No `refersTo` field for credit notes / debit notes linking back to the original invoice
- No multi-currency support (foreign currency with DZD equivalent)
- No partial payment / installment payment support
- `amountInWords` has no locale or language guidance
- Attachment `data` field is optional — no guidance on when to include vs. link externally

### Ecosystem Gaps
- No reference validator in this repo (external)
- No example invoices in this repo (external)
- No test suite or conformance tests
- No OpenAPI / REST API spec for potential DGI submission endpoint
- No CLI tool

### Governance / Process Gaps
- Governance board not yet formed
- No versioning changelog
- No formal release process / tags
- No issue/PR templates in `.github/`

---

## Brainstorm: Ideas to Explore

### 1. Enrich the Specification
- Add a `refersTo` field on `credit_note` / `debit_note` to reference the original invoice ID
- Define `amountInWords` locale rules (French, Arabic, Tamazight)
- Add a section on partial payments and installment schedules
- Clarify TAP applicability (which activity categories are subject to TAP)
- Add wilaya code enumeration to the schema for NIF validation

### 2. Improve the Schema
- Add `if/then` conditional: require `stampDuty` when `payment.method = "cash"`
- Add `if/then` conditional: require `refersTo` when `type = "credit_note"` or `"debit_note"`
- Consider making `legalForm` and `activityNature` required for seller (currently only noted in spec text)
- Add `minLength` / `maxLength` constraints where missing
- Consider a `$comment` for each field explaining Algerian legal context

### 3. Developer Experience
- Add `schemas/examples/` directory with valid and invalid example invoices
- Add a JSON Schema `$defs` for common regex patterns (NIF, RC, NIS, AI)
- Add GitHub Actions to validate the schema itself and lint Markdown
- Add `.github/ISSUE_TEMPLATE/` for bug reports, RFCs, and questions
- Add `.github/pull_request_template.md`

### 4. Tooling
- Reference validator in TypeScript/Node.js (in this repo or linked)
- Python implementation for DGI-facing integrations
- CLI tool: `efacture validate invoice.json`
- PDF generator reference implementation

### 5. Interoperability
- Add mapping tables for PEPPOL BIS (EU e-invoicing)
- Add guidance for cross-border invoices (DZD + foreign currency)
- Add Jibayatic platform submission format guidance

### 6. Security
- Define certificate revocation handling
- Add timestamp authority (TSA) guidance
- Document how to verify a signed invoice
- Add guidance on key storage and rotation

### 7. Governance / Community
- Create a GOVERNANCE.md file
- Define the RFC numbering system
- Set up a `CHANGELOG.md`
- Establish a mailing list or discussion forum

---

## Key Questions for Brainstorming

1. **Scope of v1.0 vs v1.1:** What features are blocking for v1.0 finality vs. safe to defer?
2. **Validator location:** Should the reference validator live in this repo or stay external?
3. **DGI integration:** Is there a known DGI API endpoint or submission format to align with?
4. **TAP handling:** How should TAP be modeled — per line or per invoice summary?
5. **Arabic support:** Should `amountInWords` be required in Arabic for DGI compliance?
6. **Proforma status:** Should `proforma` invoices be excluded from signing requirements?
7. **`additionalProperties: false`:** Strict schema — is this the right choice for extensibility?
8. **Multi-party invoices:** Are three-party scenarios (factoring, agent invoicing) in scope?
9. **QR code:** Should a QR code field or specification be added for printed invoices?
10. **Jibayatic:** Is the spec intended to feed directly into Algeria's Jibayatic platform?

---

## Terminology Quick Reference

| Term | Meaning |
|------|---------|
| NIF | Numéro d'Identification Fiscale (tax ID, 15–20 digits) |
| RC | Registre de Commerce (commercial registry) |
| NIS | Numéro d'Identification Statistique |
| AI | Article d'Imposition |
| DGI | Direction Générale des Impôts (tax authority) |
| AECE | Autorité Économique de Certification Électronique |
| TVA | Taxe sur la Valeur Ajoutée (VAT) |
| TAP | Taxe sur l'Activité Professionnelle (2%) |
| HT | Hors Taxe (before tax) |
| TTC | Toutes Taxes Comprises (tax included) |
| DA / DZD | Dinar Algérien |
| Jibayatic | DGI online tax declaration portal |
| UBL | Universal Business Language (OASIS standard) |
| Factur-X | Franco-German hybrid PDF+XML invoice standard |
| CII | Cross-Industry Invoice (UN/CEFACT XML) |
| PEPPOL | Pan-European Public Procurement On-Line |
| PDF/A-3 | ISO 19005-3 archival PDF with embedded files |

---

## Session Notes

*(Add brainstorm notes here as the conversation progresses)*
