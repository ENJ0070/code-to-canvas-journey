/** Pobieranie zdjęć QC z FinderQC (finderqc.com) — otwarte API katalogu QC. */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

export type FinderQcResult = {
  ok: boolean;
  title: string;
  images: string[];
  totalPhotos: number;
  hasMore: boolean;
  source: string;
};

const EMPTY: FinderQcResult = {
  ok: false,
  title: "",
  images: [],
  totalPhotos: 0,
  hasMore: false,
  source: "",
};

const HEADERS = {
  "User-Agent": UA,
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://finderqc.com",
  Referer: "https://finderqc.com/",
};

/** Use the upstream JSON contract; do not bypass denied requests with a proxy. */
async function getJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(12000) });
  if (!res.ok) { console.warn('FinderQC unavailable', res.status); throw new Error('Źródło QC jest chwilowo niedostępne.'); }
  return await res.json();
}

/**
 * Zwraca zdjęcia QC dla identyfikatora produktu (itemID z Weidian / Taobao / 1688).
 * `page` stronicuje po partiach QC (jedna partia = kilka zdjęć).
 */
export async function fetchFinderQcById(
  itemId: string,
  page = 1,
  pageSize = 4,
): Promise<FinderQcResult> {
  const url = `https://server.finderqc.com/api/spu/webSpuInfo?id=${encodeURIComponent(
    itemId,
  )}&page=${page}&pageSize=${pageSize}`;
  try {
    const json = await getJson(url);
    const spu = json?.data?.spuInfo;
    if (!spu) return EMPTY;

    const groups: any[] = Array.isArray(spu.spuQcName) ? spu.spuQcName : [];
    const images: string[] = [];
    for (const g of groups) {
      for (const img of Array.isArray(g?.spuImg) ? g.spuImg : []) {
        const u = String(img?.url ?? "");
        if (/^https?:\/\//i.test(u)) images.push(u);
      }
    }
    return {
      ok: true,
      title: String(spu.enTitle || spu.originalTitle || "").trim(),
      images: Array.from(new Set(images)),
      totalPhotos: Number(spu.qcPhotosCount) || images.length,
      hasMore: groups.length >= pageSize,
      source: `https://finderqc.com/product/${spu.mallType || "Weidian"}/${itemId}`,
    };
  } catch {
    throw new Error('Nie udało się pobrać zdjęć ze źródła QC.');
  }
}

/** To samo, ale na podstawie dowolnego linku (agenta lub sklepu źródłowego). */
export async function fetchFinderQcByUrl(
  rawUrl: string,
  page = 1,
  pageSize = 4,
): Promise<FinderQcResult> {
  const { extractSourceLink } = await import("@/lib/linkConverter");
  const parsed = extractSourceLink(rawUrl);
  if (!parsed?.id) return EMPTY;
  return fetchFinderQcById(String(parsed.id), page, pageSize);
}
