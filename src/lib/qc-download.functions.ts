import { createServerFn } from '@tanstack/react-start';
export const qcDownloadUrl = createServerFn({ method: 'POST' })
  .inputValidator((data: { url: string }) => ({ url: String(data?.url || '').slice(0, 2000) }))
  .handler(async ({ data }) => {
    if (data.url.startsWith('/api/public/product-image?')) return { url: data.url + '&download=1' };
    const { archiveImage } = await import('./image-storage.server');
    const copy = await archiveImage(data.url);
    if (!copy.startsWith('/api/public/product-image?')) throw new Error('Nie udało się pobrać zdjęcia z tego źródła.');
    return { url: copy + '&download=1' };
  });
