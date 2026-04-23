/**
 * Maps ISO 4217 currency codes to ISO 3166-1 alpha-2 country codes for flag display.
 * For supranational currencies (EUR, XOF, XAF) a representative country is used.
 * react-country-flag also supports "EU" for the European Union flag.
 */
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  // Major / G10
  USD: "US", EUR: "EU", GBP: "GB", JPY: "JP", CHF: "CH",
  CAD: "CA", AUD: "AU", NZD: "NZ", SEK: "SE", NOK: "NO", DKK: "DK",

  // Asia-Pacific
  CNY: "CN", HKD: "HK", SGD: "SG", KRW: "KR", TWD: "TW",
  INR: "IN", PKR: "PK", BDT: "BD", LKR: "LK", NPR: "NP",
  PHP: "PH", IDR: "ID", MYR: "MY", THB: "TH", VND: "VN",
  MMK: "MM", KHR: "KH", LAK: "LA", BND: "BN", MNT: "MN",
  PGK: "PG", FJD: "FJ",

  // Middle East & Africa
  AED: "AE", SAR: "SA", QAR: "QA", KWD: "KW", BHD: "BH",
  OMR: "OM", IQD: "IQ", JOD: "JO", LBP: "LB", ILS: "IL",
  EGP: "EG", NGN: "NG", KES: "KE", GHS: "GH", ZAR: "ZA",
  MAD: "MA", TND: "TN", DZD: "DZ", ETB: "ET", TZS: "TZ",
  UGX: "UG", XOF: "SN", XAF: "CM",

  // Americas
  MXN: "MX", BRL: "BR", COP: "CO", CLP: "CL", ARS: "AR",
  PEN: "PE", UYU: "UY", BOB: "BO", PYG: "PY", VES: "VE",
  GTQ: "GT", CRC: "CR", HNL: "HN", NIO: "NI", DOP: "DO",
  CUP: "CU", JMD: "JM", TTD: "TT", BBD: "BB", BZD: "BZ",
  HTG: "HT", XCD: "AG",

  // Europe (non-EUR)
  ISK: "IS", HUF: "HU", PLN: "PL", CZK: "CZ", RON: "RO",
  BGN: "BG", HRK: "HR", RSD: "RS", BAM: "BA", MKD: "MK",
  ALL: "AL", TRY: "TR",

  // CIS / Eastern Europe
  RUB: "RU", UAH: "UA", BYN: "BY", GEL: "GE", AMD: "AM",
  AZN: "AZ", KZT: "KZ", UZS: "UZ", KGS: "KG", TJS: "TJ",
  TMT: "TM", MDL: "MD",
};

/** Returns the ISO 3166-1 alpha-2 country code for a currency, or null if unknown. */
export function getCurrencyCountryCode(currencyCode: string): string | null {
  return CURRENCY_TO_COUNTRY[currencyCode] ?? null;
}
