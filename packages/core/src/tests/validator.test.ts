import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validate } from "../validator.js";

function makeValidEnvelope() {
  return {
    efacture: {
      version: "1.0",
      type: "invoice",
      id: "FAC-2024-001",
      issueDate: "2024-06-15",
      currency: "DZD",
      seller: {
        name: "SARL Exemple Tech",
        nif: "000216000000099",
        legalForm: "SARL",
        activityNature: "Services informatiques",
        registrations: { rc: "16/00-0012345B99" },
        address: { street: "123 Rue Didouche Mourad", city: "Alger", country: "DZ" },
      },
      buyer: {
        name: "EURL Client",
        nif: "000216000000100",
        address: { street: "45 Blvd Mohamed V", city: "Oran", country: "DZ" },
      },
      lines: [
        {
          description: "Développement application web",
          amountBeforeTax: 100000,
          taxes: [{ code: "TVA_19", rate: 19, amount: 19000 }],
          total: 119000,
        },
      ],
      totals: {
        totalBeforeTax: 100000,
        taxes: [{ code: "TVA_19", name: "TVA Taux Normal", base: 100000, rate: 19, amount: 19000 }],
        totalTax: 19000,
        total: 119000,
      },
    },
  };
}

describe("validate", () => {
  it("accepts a valid invoice", () => {
    const result = validate(makeValidEnvelope());
    assert.equal(result.valid, true, `Errors: ${JSON.stringify(result.errors)}`);
    assert.equal(result.errors.length, 0);
  });

  it("rejects future issue date", () => {
    const env = makeValidEnvelope();
    env.efacture.issueDate = "2099-01-01";
    const result = validate(env);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === "FUTURE_ISSUE_DATE"));
  });

  it("rejects invalid NIF", () => {
    const env = makeValidEnvelope();
    env.efacture.seller.nif = "123"; // too short
    const result = validate(env);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === "INVALID_SELLER_NIF" || e.code === "SCHEMA_ERROR"));
  });

  it("rejects incorrect line total", () => {
    const env = makeValidEnvelope();
    env.efacture.lines[0].total = 999999; // wrong
    const result = validate(env);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === "INVALID_LINE_TOTAL" || e.code === "INVALID_GRAND_TOTAL"));
  });

  it("rejects incorrect grand total", () => {
    const env = makeValidEnvelope();
    env.efacture.totals.total = 1; // wrong
    const result = validate(env);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === "INVALID_GRAND_TOTAL"));
  });
});
