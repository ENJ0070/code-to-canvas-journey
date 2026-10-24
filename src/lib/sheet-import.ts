import { z } from "zod";
import { rowsToProducts, type ImportedRow } from "./csvImport";
import { convertLink, extractSourceLink } from "./linkConverter";
import { pricesFromUsd } from "./import-prices";

export function imageCandidates(cells: string[]): string[] {
  return Array.from(new Set(cells.flatMap(cell => cell.match(/https:\/\/[^\s"'<>),;]+/g) ?? [])
    .filter(url => /\.(png|jpe?g|webp|avif)(?:[?/#]|$)|\/product-image\?|googleusercontent\.com|\/image\//i.test(url)))).slice(0, 12);
}
export const selectionSchema = z.object({
  rows: z.array(z.object({
    row: z.number().int().min(0), title: z.string().max(300), category: z.string().max(100),
    usdCell: z.number().int().min(0).nullable(), usdText: z.string().max(80).nullable(),
    image: z.string().nullable(), linkCell: z.number().int().min(0).nullable(),
    warning: z.string().max(300),
  })),
});
export type SheetSelection = z.infer<typeof selectionSchema>["rows"][number];
export function selectedUsd(header: string, cell: string, selected: string | null): number | null {
  if (!selected || !cell.includes(selected)) return null;
  const usdHeader = /usd|dollar|dolar|\$/i.test(header);
  if (!usdHeader && !/usd|us\$|\$/i.test(selected)) return null;
  // Never reinterpret a CNY/EUR token as a dollar amount.
  if (/cny|rmb|yuan|eur|€|¥|￥/i.test(selected)) return null;
  const numbers = selected.match(/\d+(?:[.,]\d+)?/g);
  if (numbers?.length !== 1) return null;
  const value = Number(numbers[0]?.replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : null;
}
export function selectionToProduct(headers: string[], cells: string[], selection: SheetSelection): { product: ImportedRow | null; warning: string } {
  const usd = selection.usdCell === null ? null : selectedUsd(headers[selection.usdCell] ?? "", cells[selection.usdCell] ?? "", selection.usdText);
  const image = selection.image && imageCandidates(cells).includes(selection.image) ? selection.image : null;
  const rawLink = selection.linkCell === null ? "" : cells[selection.linkCell] ?? "";
  const source = (rawLink.match(/https?:\/\/[^\s"'<>]+/g) ?? []).map(extractSourceLink).find(Boolean);
  if (!selection.title.trim() || usd === null || !image || !source) {
    return { product: null, warning: selection.warning || "Brak pewnej ceny USD, zdjęcia lub linku produktu — wiersz pominięty." };
  }
  const [base] = rowsToProducts([headers, cells]);
  const converted = pricesFromUsd(usd);
  return { product: {
    title: selection.title.trim(), category: selection.category, ...converted,
    image_url: image, images: [], qc_url: base?.qc_url ?? null,
    store_url: source.url, store_name: base?.store_name ?? "", quality: base?.quality ?? "Best",
    batch: base?.batch ?? "", sizes: base?.sizes ?? [], tiktok_url: base?.tiktok_url ?? null,
    agent_links: { ...base?.agent_links, ESGobuy: convertLink(source.url, "ESGobuy") },
  }, warning: selection.warning };
}