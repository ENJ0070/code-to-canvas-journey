import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { finderQcByProduct } from "@/lib/finderqc.functions";
import { useProducts, type Product } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { QcGrid } from "@/components/QcViewer";
import { QcPhotos } from "@/components/QcPhotos";
import { QcSearchForm } from "@/components/QcSearchForm";
import { QC_SETS_PER_PAGE } from '@/lib/qc-pagination';

export const Route = createFileRoute("/qc")({
  validateSearch: (search: Record<string, unknown>) => ({
    product: typeof search['product'] === "string" ? search['product'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Zdjęcia QC — PKMREPS QC Finder" },
      {
        name: "description",
        content:
          "Przeglądaj zdjęcia QC produktów z magazynów agentów lub wklej link z Weidian, 1688 lub Taobao, aby zobaczyć zdjęcia kontroli jakości.",
      },
      { property: "og:title", content: "Zdjęcia QC — PKMREPS" },
      {
        property: "og:description",
        content: "Galeria zdjęć QC z magazynów agentów oraz wyszukiwarka QC po linku produktu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QcPage,
});

function QcPage() {
  const { t } = useLang();
  const { data: products } = useProducts();
  const runProduct = useServerFn(finderQcByProduct);
  const { product: productId } = Route.useSearch();
  const loadProductPage = useCallback(
    (page: number) => runProduct({ data: { productId: productId ?? "", page, pageSize: QC_SETS_PER_PAGE } }),
    [runProduct, productId],
  );

  const withQc = useMemo(
    () => (products ?? []).filter((p: Product) => (p.qc_images ?? []).length > 0),
    [products],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">{t("qc.title")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t("qc.desc")}</p>

      <div className="mb-8 border-b border-border pb-6"><QcSearchForm/></div>

      {productId ? (
        <section className="mb-10 rounded-2xl border border-border bg-surface p-4">
          <h2 className="mb-3 text-lg font-bold">{t("qc.result")}</h2>
          <QcPhotos
            key={productId}
            loadPage={loadProductPage}
            autoLoad
            showMore
            emptyText={t("qc.notFound")}
          />
        </section>
      ) : null}

      {productId ? null : (
        <>
          <h2 className="mb-4 text-lg font-bold">{t("qc.catalog")}</h2>
          {withQc.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
              {t("qc.catalogEmpty")}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {withQc.slice(0, 12).map((p) => (
                <article key={p.id} className="rounded-2xl border border-border bg-surface p-3">
                  <p className="mb-2 truncate text-sm font-semibold">{p.title}</p>
                  <QcGrid images={(p.qc_images ?? []).slice(0, 6)} cols="grid-cols-3" />
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

