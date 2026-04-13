# Contributing to e-facture-dz

Thank you for your interest in contributing to Algeria's e-invoicing open standard. This document provides guidelines for contributing to the protocol specification.

## How to Contribute

### Reporting Issues

- Use [GitHub Issues](https://github.com/e-facture-dz/spec/issues) to report bugs, suggest improvements, or ask questions about the specification.
- Before opening a new issue, search existing issues to avoid duplicates.
- Use clear, descriptive titles and provide as much context as possible.

### Proposing Changes

All changes to the specification follow the **RFC (Request for Comments)** process:

1. **Open an Issue** — Describe the problem or improvement you want to address.
2. **Discuss** — Engage with maintainers and the community to refine the proposal.
3. **Fork & Branch** — Fork the repository and create a branch for your changes.
4. **Submit a Pull Request** — Reference the issue and provide a clear description of the changes.
5. **Review** — Maintainers will review your PR. Be prepared for feedback and iteration.
6. **Merge** — Once approved, a maintainer will merge your contribution.

### Change Categories

| Category | Scope | Approval |
|----------|-------|----------|
| **Patch** | Typos, clarifications, formatting | Maintainer approval |
| **Minor** | New optional fields, non-breaking additions | Maintainer approval + community review (14 days) |
| **Major** | Breaking changes, field removals, structural changes | Governance board approval + community review (30 days) |

## What You Can Contribute

- **Specification improvements** — Clarifications, corrections, or new sections
- **Schema updates** — JSON Schema fixes or enhancements
- **Documentation** — Translations (especially Arabic), guides, or examples
- **Validation rules** — New business rule definitions
- **Interoperability mappings** — Field mappings to other standards (UBL, Factur-X)

## Guidelines

### Specification Changes

- Keep backward compatibility in mind. Breaking changes require strong justification.
- Include rationale for every change — explain *why*, not just *what*.
- Reference relevant Algerian tax regulations (DGI, Décret exécutif n°05-468) when applicable.
- Update the JSON Schema to match any specification text changes.

### Code Style

- JSON Schema files: 2-space indentation, UTF-8 encoding
- Markdown: One sentence per line for cleaner diffs
- Use ISO standards for dates (ISO 8601), currencies (ISO 4217), and country codes (ISO 3166-1)

### Commit Messages

- Use clear, imperative mood: "Add field X to seller object" not "Added field X"
- Reference the issue number: "Fix NIF validation pattern (#12)"

## Governance

### Current Phase (Initial)

- **Maintainers:** e-facture-dz maintainers
- **Decision process:** Maintainer approval for all changes

### Future Phase

- A governance board composed of signatory software editors will collectively review and approve specification changes.
- The RFC process will include formal community review periods.

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Questions?

Open an issue with the `question` label, and we'll be happy to help.
