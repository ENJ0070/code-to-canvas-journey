import { extractSourceLink } from './linkConverter';
import { warehouseQcImages } from './qc-only';

/** Request the warehouse QC endpoint only, without loading a product catalogue or SKU gallery. */
export async function fetchWarehouseQc(rawUrl: string): Promise<string[]> {
  const source = extractSourceLink(rawUrl);
  if (!source) return [];
  const response = await fetch(`https://www.usfans.com/api/goods/estimate-info?goodsId=${encodeURIComponent(source.id)}`, { signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Magazyn QC jest chwilowo niedostępny.');
  const result = await response.json() as { data?: unknown };
  return warehouseQcImages(result.data);
}