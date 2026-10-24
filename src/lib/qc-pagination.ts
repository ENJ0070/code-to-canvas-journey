/** FinderQC pageSize counts QC sets, not individual photographs. */
export const QC_SETS_PER_PAGE = 4;
export const QC_PHOTOS_PER_PAGE = 20;
export function qcPageImages(warehouse: string[], finder: string[]): string[] {
  // Prefer complete FinderQC sets; warehouse photos supplement only remaining slots.
  return Array.from(new Set([...finder, ...warehouse])).slice(0, QC_PHOTOS_PER_PAGE);
}