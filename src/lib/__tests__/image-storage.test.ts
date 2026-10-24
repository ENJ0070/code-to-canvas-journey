import { afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ upload: vi.fn(), list: vi.fn() }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: { storage: { from: () => ({ upload: mocks.upload, list: mocks.list }) } } }));
import { archiveImage } from '../image-storage.server';
afterEach(() => { vi.unstubAllGlobals(); vi.resetAllMocks(); });
it('archives USFans JPEG bytes even when the CDN labels them octet-stream', async () => {
  mocks.list.mockResolvedValue({ data: [] }); mocks.upload.mockResolvedValue({ error: null });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new Uint8Array([255,216,255,224,1,2,3]), { headers: { 'content-type': 'application/octet-stream' } })));
  const result = await archiveImage('https://media.usfans.com/photo.jpg');
  expect(result.startsWith('/api/public/product-image?path=archive')).toBe(true);
  expect(mocks.upload.mock.calls[0]?.[2].contentType).toBe('image/jpeg');
});
it('rejects unknown binary bytes rather than serving them as an image', async () => {
  mocks.list.mockResolvedValue({ data: [] });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not an image', { headers: { 'content-type': 'application/octet-stream' } })));
  expect(await archiveImage('https://media.usfans.com/photo.jpg')).toBe('https://media.usfans.com/photo.jpg');
  expect(mocks.upload).not.toHaveBeenCalled();
});
