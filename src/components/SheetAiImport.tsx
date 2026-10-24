import { useState } from "react";
import { Sparkles, Square } from "lucide-react";
import { Button } from "./ui/button";
import { analyzeSheetBatch } from "@/lib/sheet-ai.functions";
import { parseDelimited, type ImportedRow } from "@/lib/csvImport";
import { getPanelToken } from "@/lib/panelToken";
import { useRef } from "react";

export function SheetAiImport({ text, disabled, onResult, onBusy }: { text: string; disabled: boolean; onResult: (rows: ImportedRow[]) => void; onBusy: (busy: boolean) => void }) {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const stop = useRef(false);
  const analyze = async () => {
    const [headers, ...rows] = parseDelimited(text);
    if (!headers || !rows.length) return;
    stop.current = false; setRunning(true); onBusy(true); setWarnings([]);
    const products: ImportedRow[] = [];
    const notes: string[] = [];
    try {
      for (let i = 0; i < rows.length && !stop.current; i += 5) {
        setStatus(`Analizuję zdjęcia i ceny: ${i}/${rows.length}`);
        const result = await analyzeSheetBatch({ data: { token: getPanelToken(), headers, rows: rows.slice(i, i+5) } });
        result.forEach(item => { if (item.product) products.push(item.product); if (item.warning) notes.push(`Wiersz ${i+item.row+2}: ${item.warning}`); });
        onResult([...products]); setWarnings([...notes]);
      }
      setStatus(`${stop.current ? "Zatrzymano" : "Gotowe"}: ${products.length} produktów do sprawdzenia, ${notes.length} uwag.`);
    } catch (error) {
      setStatus(`${error instanceof Error ? error.message : "Analiza nie powiodła się."} Zachowano ${products.length} przeanalizowanych produktów.`);
    } finally { setRunning(false); onBusy(false); }
  };
  return <div className="mt-4 space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled={disabled || running || !text.trim()} onClick={() => void analyze()}><Sparkles />Analizuj zdjęcia i ceny USD</Button>
      {running && <Button variant="outline" onClick={() => { stop.current = true; }}><Square />Zatrzymaj</Button>}
    </div>
    {status && <p className="text-sm text-muted-foreground" role="status">{status}</p>}
    {warnings.length > 0 && <details className="text-xs text-muted-foreground"><summary>Uwagi ({warnings.length})</summary><ul className="mt-2 max-h-48 overflow-auto">{warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></details>}
  </div>;
}