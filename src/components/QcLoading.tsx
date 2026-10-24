import { LoaderCircle } from 'lucide-react';

/** No polling state or guessed countdown while the provider is working. */
export function QcLoading({ label = "Szukam zdjęć QC" }: { seconds?: number; label?: string }) {

  return (
    <div role="status" className="flex min-h-40 flex-col items-center justify-center gap-3 border-y border-border bg-surface-deep p-6 text-center">
      <LoaderCircle className="h-6 w-6 animate-spin motion-reduce:animate-none text-muted-foreground" aria-hidden/>
      <p className="text-sm font-semibold">{label}…</p>
    </div>
  );
}
