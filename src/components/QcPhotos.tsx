import { useCallback, useEffect, useRef, useState } from "react";

import { QcGrid } from "@/components/QcViewer";
import { QcLoading } from "@/components/QcLoading";
import { Button } from '@/components/ui/button';
import { QC_PHOTOS_PER_PAGE } from '@/lib/qc-pagination';

export type QcPage = {
  ok: boolean;
  title: string;
  images: string[];
  totalPhotos: number;
  hasMore: boolean;
  source: string;
};

const STEP = QC_PHOTOS_PER_PAGE;

/** Four QC sets per page; thumbnails stay lazy-loaded in QcGrid. */
export function QcPhotos({
  loadPage,
  autoLoad = false,
  initialImages,
  initialPage = 0,
  initialHasMore = true,
  cols,
  showMore = false,
  emptyText = "Nie znaleziono zdjęć QC.",
  buttonText = "Pokaż więcej",
  startText = "Pokaż zdjęcia QC",
}: {
  loadPage: (page: number) => Promise<QcPage>;
  autoLoad?: boolean;
  /** Zdjęcia znane od razu (np. zapisane przy produkcie) — widoczne bez klikania. */
  initialImages?: string[];
  initialPage?: number;
  initialHasMore?: boolean;
  cols?: string;
  /** Pokazuj przycisk dociągania kolejnych zdjęć. */
  showMore?: boolean;
  emptyText?: string;
  buttonText?: string;
  startText?: string;
}) {
  const [images, setImages] = useState<string[]>(initialImages ?? []);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [shown, setShown] = useState(STEP);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(initialPage > 0);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const fetchNext = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setError('');
    setBusy(true);
    setTouched(true);
    const next = page + 1;
    try {
      const res = await loadPage(next);
      if (!mounted.current) return;
      setImages((prev) => Array.from(new Set([...prev, ...res.images])));
      setHasMore(res.hasMore);
      setPage(next);
      setShown((s) => Math.max(s, next === 1 ? STEP : s + STEP));
    } catch {
      if (mounted.current) setError('Nie udało się połączyć ze źródłem QC. Spróbuj ponownie.');
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  }, [loadPage, page]);

  useEffect(() => {
    if (autoLoad && page === 0 && !busy) void fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  useEffect(() => {
    if (!initialImages?.length) return;
    setImages((prev) => Array.from(new Set([...initialImages, ...prev])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImages?.join("|")]);

  function more() {
    if (shown < images.length) {
      setShown((s) => s + STEP);
      return;
    }
    if (hasMore) void fetchNext();
  }

  const canShowMore = shown < images.length || hasMore;

  return (
    <div className="space-y-3">
      {images.length > 0 ? <QcGrid images={images.slice(0, shown)} {...(cols ? { cols } : {})} /> : null}
      {busy ? <QcLoading /> : null}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      {!busy && !error && touched && images.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface-deep p-4 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : null}
      {!busy && showMore && canShowMore ? (
        <Button variant="outline"
          onClick={more}
          className="w-full rounded-lg border border-border px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-primary transition-colors hover:border-primary"
        >
          {images.length === 0 ? startText : buttonText}
        </Button>
      ) : null}
    </div>
  );
}
