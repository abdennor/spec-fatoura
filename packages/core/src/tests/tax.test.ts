import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calcLineTaxes, calcTotals, TAX_RATES, STAMP_DUTY_RATE } from "../tax.js";

describe("calcLineTaxes", () => {
  it("calculates TVA_19 correctly", () => {
    const result = calcLineTaxes({ amountBeforeTax: 1000, taxCodes: ["TVA_19"] });
    assert.equal(result.amountBeforeTax, 1000);
    assert.equal(result.taxes.length, 1);
    assert.equal(result.taxes[0].code, "TVA_19");
    assert.equal(result.taxes[0].rate, 19);
    assert.equal(result.taxes[0].amount, 190);
    assert.equal(result.total, 1190);
  });

  it("calculates multiple taxes", () => {
    const result = calcLineTaxes({ amountBeforeTax: 5000, taxCodes: ["TVA_19", "TAP"] });
    assert.equal(result.taxes.length, 2);
    assert.equal(result.taxes[0].amount, 950);
    assert.equal(result.taxes[1].amount, 100);
    assert.equal(result.total, 6050);
  });

  it("handles EXONERE (0% tax)", () => {
    const result = calcLineTaxes({ amountBeforeTax: 2000, taxCodes: ["EXONERE"] });
    assert.equal(result.taxes[0].amount, 0);
    assert.equal(result.total, 2000);
  });
});

describe("calcTotals", () => {
  it("calculates totals from lines", () => {
    const lines = [
      { amountBeforeTax: 1000, taxes: [{ code: "TVA_19", rate: 19, amount: 190 }] },
      { amountBeforeTax: 2000, taxes: [{ code: "TVA_19", rate: 19, amount: 380 }] },
    ];
    const result = calcTotals({ lines });
    assert.equal(result.totalBeforeTax, 3000);
    assert.equal(result.totalTax, 570);
    assert.equal(result.total, 3570);
    assert.equal(result.stampDuty, undefined);
  });

  it("applies stamp duty for cash payment", () => {
    const lines = [
      { amountBeforeTax: 10000, taxes: [{ code: "TVA_19", rate: 19, amount: 1900 }] },
    ];
    const result = calcTotals({ lines, isCashPayment: true });
    assert.equal(result.totalBeforeTax, 10000);
    assert.equal(result.totalTax, 1900);
    assert.notEqual(result.stampDuty, undefined);
    assert.equal(result.stampDuty!.rate, STAMP_DUTY_RATE);
    assert.equal(result.stampDuty!.base, 11900);
    assert.equal(result.stampDuty!.amount, 119);
    assert.equal(result.total, 12019);
  });
});
