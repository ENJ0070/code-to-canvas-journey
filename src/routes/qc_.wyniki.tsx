import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { finderQcByLink } from '@/lib/finderqc.functions';
import { extractSourceLink } from '@/lib/linkConverter';
import { QcPhotos } from '@/components/QcPhotos';
import { QcLoading } from '@/components/QcLoading';
import { QcSearchForm } from '@/components/QcSearchForm';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/qc_/wyniki')({
  validateSearch: (search: Record<string, unknown>) => ({ url: typeof search['url'] === 'string' ? search['url'].slice(0, 2000) : '' }),
  head: () => ({ meta: [
    { title: 'Wyniki zdjęć QC — PKMREPS' }, { name: 'description', content: 'Zdjęcia kontroli jakości z magazynu agenta dla wklejonego linku.' },
    { property: 'og:title', content: 'Wyniki zdjęć QC — PKMREPS' }, { property: 'og:description', content: 'Galeria zdjęć magazynowych QC, bez zdjęć ofertowych i wariantów produktu.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }, { name: 'robots', content: 'noindex' },
  ] }), component: QcResults,
});
function QcResults() {
  const { url } = Route.useSearch();
  const source = extractSourceLink(url);
  const run = useServerFn(finderQcByLink);
  const first = useQuery({ queryKey: ['qc-link', source?.platform, source?.id, 1], queryFn: () => run({ data: { url, page: 1, pageSize: 3 } }), enabled: Boolean(source), staleTime: 10 * 60_000, gcTime: 30 * 60_000, retry: false, refetchOnWindowFocus: false });
  return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6" data-no-translate>
    <Button variant="ghost" asChild className="mb-6"><Link to="/qc" search={{ product: undefined }}><ArrowLeft size={16}/>QC Finder</Link></Button>
    <div className="mb-8 border-b border-border pb-6"><h1 className="text-2xl font-semibold">Zdjęcia QC</h1>{source && <p className="mt-2 text-xs text-muted-foreground">{source.platform.toUpperCase()} · {source.id}</p>}<div className="mt-5"><QcSearchForm key={url} initialValue={url}/></div></div>
    {!source ? <p className="text-sm text-muted-foreground">Wklej link, aby znaleźć zdjęcia QC.</p> : first.isPending ? <QcLoading/> : first.isError ? <div role="alert" className="space-y-4 py-8"><p className="text-sm text-destructive">Źródło QC jest chwilowo niedostępne. Nie udało się wczytać zdjęć.</p><Button variant="outline" onClick={() => void first.refetch()}><RefreshCw size={16}/>Spróbuj ponownie</Button></div> : first.data ? <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium">{first.data.title || 'Kontrola jakości z magazynu'}</p><p className="text-xs text-muted-foreground">{first.data.images.length} zdjęć{first.data.source.startsWith('USFans') ? ' · USFans' : ''}</p></div>
      <QcPhotos key={url} loadPage={page => run({ data: { url, page, pageSize: 3 } })} initialImages={first.data.images} initialPage={1} initialHasMore={first.data.hasMore} showMore cols="grid-cols-2 sm:grid-cols-3"/>
    </> : null}
  </main>;
}
