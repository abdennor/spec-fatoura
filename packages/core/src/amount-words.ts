const ONES_FR = [
  "", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
  "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
  "dix-sept", "dix-huit", "dix-neuf",
];
const TENS_FR = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

function belowHundredFr(n: number): string {
  if (n < 20) return ONES_FR[n];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  if (ten === 7 || ten === 9) {
    return TENS_FR[ten] + (one === 1 && ten === 7 ? "-et-" : "-") + ONES_FR[10 + one];
  }
  if (ten === 8) {
    return "quatre-vingt" + (one > 0 ? "-" + ONES_FR[one] : "s");
  }
  return TENS_FR[ten] + (one === 1 ? "-et-un" : one > 0 ? "-" + ONES_FR[one] : "");
}

function belowThousandFr(n: number): string {
  if (n < 100) return belowHundredFr(n);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const hundredWord = hundreds === 1 ? "cent" : ONES_FR[hundreds] + " cent" + (rest === 0 && hundreds > 1 ? "s" : "");
  return rest === 0 ? hundredWord : hundredWord + " " + belowHundredFr(rest);
}

function numberToWordsFr(n: number): string {
  if (n === 0) return "zéro";
  if (n < 0) return "moins " + numberToWordsFr(-n);

  const integer = Math.floor(n);
  const decimal = Math.round((n - integer) * 100);

  const parts: string[] = [];

  if (integer >= 1_000_000_000) {
    const billions = Math.floor(integer / 1_000_000_000);
    parts.push(belowThousandFr(billions) + " milliard" + (billions > 1 ? "s" : ""));
  }
  if (integer >= 1_000_000) {
    const millions = Math.floor((integer % 1_000_000_000) / 1_000_000);
    if (millions > 0) parts.push(belowThousandFr(millions) + " million" + (millions > 1 ? "s" : ""));
  }
  if (integer >= 1_000) {
    const thousands = Math.floor((integer % 1_000_000) / 1_000);
    if (thousands > 0) parts.push((thousands === 1 ? "mille" : belowThousandFr(thousands) + " mille"));
  }
  const remainder = integer % 1_000;
  if (remainder > 0) parts.push(belowThousandFr(remainder));

  let result = parts.join(" ");
  if (decimal > 0) {
    result += " virgule " + belowHundredFr(decimal);
  }
  return result;
}

const ONES_AR = [
  "", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
  "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر",
  "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر",
];
const TENS_AR = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
const HUNDREDS_AR = ["", "مئة", "مئتان", "ثلاثمئة", "أربعمئة", "خمسمئة", "ستمئة", "سبعمئة", "ثمانمئة", "تسعمئة"];

function belowThousandAr(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES_AR[n];
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const one = n % 10;
    return one === 0 ? TENS_AR[ten] : ONES_AR[one] + " و" + TENS_AR[ten];
  }
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return rest === 0 ? HUNDREDS_AR[hundreds] : HUNDREDS_AR[hundreds] + " و" + belowThousandAr(rest);
}

function numberToWordsAr(n: number): string {
  if (n === 0) return "صفر";
  if (n < 0) return "سالب " + numberToWordsAr(-n);

  const integer = Math.floor(n);
  const decimal = Math.round((n - integer) * 100);

  const parts: string[] = [];

  if (integer >= 1_000_000_000) {
    const billions = Math.floor(integer / 1_000_000_000);
    parts.push(belowThousandAr(billions) + " مليار");
  }
  if (integer >= 1_000_000) {
    const millions = Math.floor((integer % 1_000_000_000) / 1_000_000);
    if (millions > 0) parts.push(belowThousandAr(millions) + " مليون");
  }
  if (integer >= 1_000) {
    const thousands = Math.floor((integer % 1_000_000) / 1_000);
    if (thousands > 0) parts.push(belowThousandAr(thousands) + " ألف");
  }
  const remainder = integer % 1_000;
  if (remainder > 0) parts.push(belowThousandAr(remainder));

  let result = parts.join(" و");
  if (decimal > 0) {
    result += " فاصلة " + belowThousandAr(decimal);
  }
  return result;
}

/**
 * Convert a numeric amount to words.
 * @param amount - The numeric amount
 * @param currency - Currency code (e.g. "DZD")
 * @param language - "fr" (French) or "ar" (Arabic), default "fr"
 */
export function amountToWords(amount: number, currency = "DZD", language: "fr" | "ar" = "fr"): string {
  const currencyNames: Record<string, { fr: string; ar: string }> = {
    DZD: { fr: "dinars algériens", ar: "دينار جزائري" },
    EUR: { fr: "euros", ar: "يورو" },
    USD: { fr: "dollars américains", ar: "دولار أمريكي" },
  };

  const currencyName = currencyNames[currency]?.[language] ?? currency;

  if (language === "ar") {
    return numberToWordsAr(amount) + " " + currencyName;
  }
  return numberToWordsFr(amount) + " " + currencyName;
}
