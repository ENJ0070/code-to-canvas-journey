import { createFileRoute } from "@tanstack/react-router";

const SAFE_PATH = /^[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]{1,8}$/;

export const Route = createFileRoute("/api/public/product-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const path = new URL(request.url).searchParams.get("path") ?? "";
        if (!SAFE_PATH.test(path) || path.includes("..") || !/^(archive|catalog)\//.test(path)) {
          return new Response("Invalid image path", { status: 400 });
        }

        let data: Blob | null = null;
        if ((process.env['SUPABASE_SERVICE_ROLE_KEY'] || process.env['DB_SERVICE_ROLE_KEY'])) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const res = await supabaseAdmin.storage.from("product-images").download(path);
          data = res.error ? null : res.data;
        } else if (process.env['SUPABASE_URL']) {
          // Brak klucza serwera — próbujemy publicznego adresu zdjęcia zamiast zwracać błąd.
          const r = await fetch(
            `${process.env['SUPABASE_URL']}/storage/v1/object/public/product-images/${path}`,
          ).catch(() => null);
          data = r?.ok ? await r.blob() : null;
        }
        if (!data) return new Response("Image not found", { status: 404 });

        const range = request.headers.get('Range');
        if (range && /^catalog\/profile\/(video|music)\//.test(path)) {
          const match = /^bytes=(\d*)-(\d*)$/.exec(range);
          if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${data.size}` } });
          const start = match[1] ? Number(match[1]) : Math.max(0, data.size - Number(match[2]));
          const end = match[1] && match[2] ? Math.min(Number(match[2]), data.size - 1) : data.size - 1;
          if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= data.size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${data.size}` } });
          return new Response(data.slice(start, end + 1, data.type), { status: 206, headers: { 'Content-Type': data.type || 'application/octet-stream', 'Content-Range': `bytes ${start}-${end}/${data.size}`, 'Content-Length': `${end - start + 1}`, 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
        }

        return new Response(data, {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
            ...(new URL(request.url).searchParams.get('download') === '1' ? { 'Content-Disposition': `attachment; filename="${path.split('/').pop()}"` } : {}),
          },
        });
      },
    },
  },
});