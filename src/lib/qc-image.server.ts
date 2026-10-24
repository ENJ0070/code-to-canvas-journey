import { qcImageSource } from './qc-image';

const MAX_BYTES = 10 * 1024 * 1024;

/** Serve original QC bytes without archiving or following redirects/access blocks. */
export async function serveQcImage(source: string): Promise<Response> {
  const url = qcImageSource(source);
  if (!url) return new Response('Invalid QC image', { status: 400 });
  try {
    const upstream = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(12000) });
    if (!upstream.ok) return new Response('QC image unavailable', { status: upstream.status === 403 ? 403 : 502 });
    if (Number(upstream.headers.get('content-length')) > MAX_BYTES) return new Response('Image too large', { status: 413 });
    const reader = upstream.body?.getReader();
    if (!reader) return new Response('QC image unavailable', { status: 502 });
    const chunks: Uint8Array[] = [];
    let length = 0;
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > MAX_BYTES) { await reader.cancel(); return new Response('Image too large', { status: 413 }); }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const signature = String.fromCharCode(...bytes.slice(0, 12));
    const type = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'image/jpeg'
      : bytes[0] === 137 && signature.slice(1, 4) === 'PNG' ? 'image/png'
      : signature.startsWith('GIF8') ? 'image/gif'
      : signature.startsWith('RIFF') && signature.slice(8) === 'WEBP' ? 'image/webp'
      : signature.slice(4, 8) === 'ftyp' && /^avi[fs]$/.test(signature.slice(8)) ? 'image/avif' : null;
    if (!type) return new Response('Invalid image bytes', { status: 502 });
    return new Response(bytes, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new Response('QC image unavailable', { status: 502 }); }
}