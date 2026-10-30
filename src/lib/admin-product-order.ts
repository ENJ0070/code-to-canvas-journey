type ReviewProduct = {
  price: number;
  image_url?: string | null;
  qc_images?: string[] | null;
};

export function hasMissingMainImage(product: ReviewProduct): boolean {
  const url = product.image_url?.trim() ?? "";
  return !url || url.startsWith("/api/public/product-image");
}

export function hasMissingQc(product: ReviewProduct): boolean {
  return !(product.qc_images ?? []).some((url) => url.trim());
}

export function adminProductPriority(product: ReviewProduct): number {
  if (Number(product.price) === 0) return 0;
  if (hasMissingMainImage(product)) return 1;
  if (hasMissingQc(product)) return 2;
  return 3;
}

export function sortAdminProducts<T extends ReviewProduct>(products: readonly T[]): T[] {
  return products
    .map((product, index) => ({ product, index }))
    .sort((a, b) => adminProductPriority(a.product) - adminProductPriority(b.product) || a.index - b.index)
    .map(({ product }) => product);
}