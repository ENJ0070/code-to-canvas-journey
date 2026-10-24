import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { extractSourceLink } from '@/lib/linkConverter';

export function QcSearchForm({ initialValue = '', compact = false }: { initialValue?: string; compact?: boolean }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  return <form className="space-y-3" onSubmit={e => {
    e.preventDefault();
    const text = value.trim();
    const url = /^\d+$/.test(text) ? `https://weidian.com/item.html?itemID=${text}` : text;
    if (!extractSourceLink(url)) { setError('Wklej link produktu z Weidian, Taobao, 1688 lub agenta.'); return; }
    setError(''); void navigate({ to: '/qc/wyniki', search: { url } });
  }}>
    <div className={`flex gap-2 ${compact ? 'flex-col' : 'flex-col sm:flex-row'}`}>
      <Input aria-label="Link do zdjęć QC" value={value} onChange={e => setValue(e.target.value)} placeholder="https://weidian.com/item.html?itemID=…" maxLength={2000} className="min-w-0 flex-1"/>
      <Button type="submit" disabled={!value.trim()}><Search size={16}/>Pokaż QC</Button>
    </div>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </form>;
}
