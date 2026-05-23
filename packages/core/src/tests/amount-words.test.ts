import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { amountToWords } from "../amount-words.js";

describe("amountToWords - French", () => {
  it("converts zero", () => {
    assert.equal(amountToWords(0, "DZD", "fr"), "zéro dinars algériens");
  });

  it("converts simple amounts", () => {
    assert.equal(amountToWords(1, "DZD", "fr"), "un dinars algériens");
    assert.equal(amountToWords(21, "DZD", "fr"), "vingt-et-un dinars algériens");
  });

  it("converts thousands", () => {
    const result = amountToWords(1500, "DZD", "fr");
    assert.ok(result.includes("mille"));
    assert.ok(result.includes("dinars algériens"));
  });

  it("converts decimals", () => {
    const result = amountToWords(1234.56, "DZD", "fr");
    assert.ok(result.includes("virgule"));
    assert.ok(result.includes("cinquante-six"));
  });
});

describe("amountToWords - Arabic", () => {
  it("converts zero", () => {
    assert.equal(amountToWords(0, "DZD", "ar"), "صفر دينار جزائري");
  });

  it("converts simple amounts", () => {
    const result = amountToWords(5, "DZD", "ar");
    assert.ok(result.includes("خمسة"));
    assert.ok(result.includes("دينار جزائري"));
  });
});
