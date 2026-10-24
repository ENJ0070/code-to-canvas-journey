import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';
import { qcDownloadUrl } from '@/lib/qc-download.functions';
import { toast } from 'sonner';
import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { StableImage } from "@/components/StableImage";

/** Siatka miniatur QC — klik otwiera przeglądarkę ze zoomem i obrotem. */
export function QcGrid({
  images,
  cols = "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
}: {
  images: string[];
  cols?: string;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(null);

  if (!images.length) {
    return (
      <p className="rounded-xl border border-border bg-surface-deep p-4 text-center text-sm text-muted-foreground">
        {t("qc.noPhotos", "Brak zdjęć QC")}
      </p>
    );
  }

  return (
    <>
      <div className={`grid gap-2 ${cols}`}>
        {images.map((u, i) => (
          <Button variant="ghost"
            key={`${u}-${i}`}
            aria-label={`Otwórz zdjęcie QC ${i + 1}`}
            onClick={() => setOpen(i)}
            className="h-auto aspect-square overflow-hidden rounded-lg border border-border p-0 transition-colors hover:border-primary [content-visibility:auto] [contain-intrinsic-size:240px]"
          >
            <StableImage src={u} alt={`QC ${i + 1}`} loading="lazy" width={480} height={480} className="h-full w-full object-cover" />
          </Button>
        ))}
      </div>
      {open !== null ? (
        <QcLightbox images={images} index={open} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}

/** Pełnoekranowa przeglądarka zdjęć: zoom, obrót, przesuwanie, strzałki. */
export function QcLightbox({
  images,
  index,
  onClose,
}: {
  images: string[];
  index: number;
  onClose: () => void;
}) {
  const [i, setI] = useState(index);
  const download = useServerFn(qcDownloadUrl);
  const [downloading, setDownloading] = useState(false);
  async function saveImage() {
    const image = images[i]; if (!image) return;
    setDownloading(true);
    try { const result = await download({ data: { url: image } }); const a = document.createElement('a'); a.href = result.url; a.download = `qc-${i + 1}.jpg`; a.click(); } catch { toast.error('Nie udało się pobrać zdjęcia.'); } finally { setDownloading(false); }
  }
  const [scale, setScale] = useState(1);
  const [rot, setRot] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);

  const reset = useCallback(() => {
    setScale(1);
    setRot(0);
    setPos({ x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (d: number) => {
      setI((v) => (v + d + images.length) % images.length);
      reset();
    },
    [images.length, reset],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(6, s + 0.4));
      if (e.key === "-") setScale((s) => Math.max(1, s - 0.4));
      if (e.key.toLowerCase() === "r") setRot((r) => r + 90);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  const btn =
    "grid h-10 w-10 place-items-center rounded-full border border-border bg-surface-deep/60 text-base text-foreground transition-colors hover:border-primary hover:text-primary";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-surface-deep/95" onClick={onClose}>
      <div
        className="flex items-center justify-between gap-2 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="rounded-full bg-surface-deep/60 px-3 py-1 text-xs font-semibold text-foreground">
          {i + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" title="Pobierz zdjęcie QC" aria-label="Pobierz zdjęcie QC" disabled={downloading} onClick={() => void saveImage()}><Download size={18}/></Button>
          <button className={btn} title="Pomniejsz" onClick={() => setScale((s) => Math.max(1, s - 0.4))}>
            −
          </button>
          <button className={btn} title="Powiększ" onClick={() => setScale((s) => Math.min(6, s + 0.4))}>
            +
          </button>
          <button className={btn} title="Obróć" onClick={() => setRot((r) => r + 90)}>
            ⟳
          </button>
          <button className={btn} title="Reset" onClick={reset}>
            ⭯
          </button>
          <button className={btn} title="Zamknij" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div
        className="relative flex-1 select-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => {
          setScale((s) => Math.min(6, Math.max(1, s - Math.sign(e.deltaY) * 0.25)));
        }}
        onDoubleClick={() => setScale((s) => (s > 1 ? 1 : 2.5))}
        onPointerDown={(e) => setDrag({ x: e.clientX - pos.x, y: e.clientY - pos.y })}
        onPointerMove={(e) => {
          if (!drag || scale === 1) return;
          setPos({ x: e.clientX - drag.x, y: e.clientY - drag.y });
        }}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        <StableImage
          src={images[i]}
          alt={`QC ${i + 1}`}
          draggable={false}
          className="absolute left-1/2 top-1/2 max-h-[80vh] max-w-[92vw] rounded-xl object-contain transition-transform duration-100"
          style={{
            transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${scale}) rotate(${rot}deg)`,
            cursor: scale > 1 ? (drag ? "grabbing" : "grab") : "zoom-in",
          }}
        />
        {images.length > 1 ? (
          <>
            <button
              className={`${btn} absolute left-3 top-1/2 -translate-y-1/2`}
              onClick={() => go(-1)}
            >
              ‹
            </button>
            <button
              className={`${btn} absolute right-3 top-1/2 -translate-y-1/2`}
              onClick={() => go(1)}
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      <div className="flex gap-2 overflow-x-auto p-3" onClick={(e) => e.stopPropagation()}>
        {images.map((u, k) => (
          <button
            key={`${u}-${k}`}
            onClick={() => {
              setI(k);
              reset();
            }}
            className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border ${
              k === i ? "border-primary" : "border-border"
            }`}
          >
            <StableImage src={u} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
