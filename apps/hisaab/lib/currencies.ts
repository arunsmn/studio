import type { Currency } from "./types";

export const CURRENCIES: Currency[] = [
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
];

const LOCALE_TO_CURRENCY: Record<string, string> = {
  AE: "AED", AU: "AUD", BR: "BRL", CA: "CAD", CH: "CHF",
  CN: "CNY", DK: "DKK", DE: "EUR", FR: "EUR", IT: "EUR",
  ES: "EUR", NL: "EUR", GB: "GBP", HK: "HKD", ID: "IDR",
  IN: "INR", JP: "JPY", KR: "KRW", MX: "MXN", MY: "MYR",
  NO: "NOK", NZ: "NZD", PH: "PHP", SE: "SEK", SG: "SGD",
  TH: "THB", TR: "TRY", US: "USD", ZA: "ZAR",
};

export function detectCurrency(): Currency {
  if (typeof navigator === "undefined") {
    return CURRENCIES.find((c) => c.code === "USD")!;
  }
  const locale = navigator.language ?? "en-US";
  const region = locale.split("-")[1]?.toUpperCase() ?? "";
  const code = LOCALE_TO_CURRENCY[region] ?? "USD";
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES.find((c) => c.code === "USD")!;
}
