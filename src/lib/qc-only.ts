/** QC photos only: never use product images, SKU pictures or colour variants. */
export function warehouseQcImages(data: unknown): string[] {
  if (!data || typeof data !== 'object') return [];
  const value = (data as Record<string, unknown>)['qcImages'];
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((url): url is string => {
    if (typeof url !== 'string') return false;
    try { return new URL(url).protocol === 'https:'; } catch { return false; }
  }))).slice(0, 40);
}
