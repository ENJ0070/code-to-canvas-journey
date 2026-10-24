/** Keep import conversions identical to the existing catalogue rates. */
export const IMPORT_PLN_TO_USD = 0.25;
export const IMPORT_CNY_TO_PLN = 0.552421;
export function pricesFromUsd(usd: number) {
  if (!Number.isFinite(usd) || usd < 0) throw new Error("Nieprawidłowa cena USD.");
  const price = Math.round((usd / IMPORT_PLN_TO_USD) * 100) / 100;
  return { price, price_cny: Math.round((price / IMPORT_CNY_TO_PLN) * 100) / 100 };
}