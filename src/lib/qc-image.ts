const QC_IMAGE_HOSTS = ['usfans.com', 'finderqc.com', 'geilicdn.com', 'alicdn.com', 'uufinds.com', 'kakobyy.com'];

/** Only known photo CDNs; never turn a QC fallback into an arbitrary URL proxy. */
export function qcImageSource(source: string): URL | null {
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !QC_IMAGE_HOSTS.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) return null;
    if (!/\.(jpe?g|png|webp|gif|avif)$/i.test(url.pathname)) return null;
    return url;
  } catch { return null; }
}

export function qcImageFallbacks(source: string): string[] {
  const url = qcImageSource(source);
  return url ? [`/api/public/qc-image?url=${encodeURIComponent(url.href)}`] : [];
}