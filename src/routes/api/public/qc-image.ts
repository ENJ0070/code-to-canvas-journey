import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/qc-image')({
  server: { handlers: { GET: async ({ request }) => {
    const { serveQcImage } = await import('@/lib/qc-image.server');
    return serveQcImage(new URL(request.url).searchParams.get('url') ?? '');
  } } },
});