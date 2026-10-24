import { afterEach, expect, it, vi } from 'vitest';
import { qcImageFallbacks, qcImageSource } from '../qc-image';
import { serveQcImage } from '../qc-image.server';

afterEach(() => vi.unstubAllGlobals());
it('rejects arbitrary hosts, disguised hosts and private destinations', () => {
  for (const url of ['https://127.0.0.1/qc.jpg', 'https://usfans.com.evil.example/qc.jpg', 'https://evil.example/qc.jpg', 'https://media.usfans.com/api/private', 'https://media.usfans.com:8443/qc.jpg']) expect(qcImageSource(url)).toBeNull();
});
it('adds a same-origin fallback only for a known QC photo', () => {
  expect(qcImageFallbacks('https://media.usfans.com/qc.jpg')).toEqual(['/api/public/qc-image?url=https%3A%2F%2Fmedia.usfans.com%2Fqc.jpg']);
  expect(qcImageFallbacks('/api/public/product-image?path=archive/photo.img')).toEqual([]);
});
it('serves USFans JPEG bytes as an image despite the octet-stream header', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new Uint8Array([255,216,255,224]), { headers: { 'Content-Type': 'application/octet-stream' } })));
  const response = await serveQcImage('https://media.usfans.com/qc.jpg');
  expect(response.status).toBe(200);
  expect(response.headers.get('Content-Type')).toBe('image/jpeg');
  expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([255,216,255,224]));
});
it('does not retry or bypass a denied upstream image', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response('denied', { status: 403 })); vi.stubGlobal('fetch', fetcher);
  expect((await serveQcImage('https://media.usfans.com/qc.jpg')).status).toBe(403);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0]?.[1].redirect).toBe('error');
});
it('rejects HTML masquerading as a photo', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>challenge</html>')));
  expect((await serveQcImage('https://media.usfans.com/qc.jpg')).status).toBe(502);
});