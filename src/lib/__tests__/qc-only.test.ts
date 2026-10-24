import { expect, it } from 'vitest';
import { warehouseQcImages, qcThumbnail } from '../qc-only';
it('excludes product gallery and colour variants from warehouse results', () => {
  expect(warehouseQcImages({ images: ['https://cdn.example/product.jpg'], colorImages: ['https://cdn.example/blue.jpg'], skuList: [{ imgUrl: 'https://cdn.example/red.jpg' }], qcImages: ['https://media.usfans.com/qc.jpg'] })).toEqual(['https://media.usfans.com/qc.jpg']);
});
it('returns no photos when only product or variant pictures exist', () => expect(warehouseQcImages({ images: ['https://cdn.example/product.jpg'], colorImages: ['https://cdn.example/blue.jpg'] })).toEqual([]));
it('deduplicates and rejects invalid warehouse URLs', () => expect(warehouseQcImages({ qcImages: ['https://media.usfans.com/qc.jpg', 'https://media.usfans.com/qc.jpg', 'javascript:alert(1)', {}] })).toEqual(['https://media.usfans.com/qc.jpg']));
it('uses a smaller thumbnail only on the supported warehouse CDN', () => { expect(qcThumbnail('https://media.usfans.com/qc.jpg')).toContain('x-oss-process='); expect(qcThumbnail('/api/public/product-image?path=archive/a.img')).toBe('/api/public/product-image?path=archive/a.img'); });