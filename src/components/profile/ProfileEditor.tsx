import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Link } from '@tanstack/react-router';
import { ArrowUp, ArrowDown, Trash2, Plus, Save, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/ImageUploader';
import { useSettings, useRefresh } from '@/lib/store';
import { getPanelToken } from '@/lib/panelToken';
import { parseProfile, profileSchema, PROFILE_KEY, type ProfileConfig } from '@/lib/profile';
import { saveProfile, uploadProfileAudio } from '@/lib/profile.functions';
import { ProfileView } from './ProfileView';

export function ProfileEditor() {
  const { data: settings } = useSettings();
  const [draft, setDraft] = useState<ProfileConfig>(() => parseProfile());
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [audioBusy, setAudioBusy] = useState(false);
  const [error, setError] = useState('');
  const refresh = useRefresh();
  const save = useServerFn(saveProfile);
  const uploadAudio = useServerFn(uploadProfileAudio);
  useEffect(() => { if (!dirty && settings) setDraft(parseProfile(settings[PROFILE_KEY])); }, [settings, dirty]);
  function update<K extends keyof ProfileConfig>(key: K, value: ProfileConfig[K]) { setDirty(true); setDraft(d => ({ ...d, [key]: value })); }
  function move(index: number, direction: number) { const links = [...draft.links]; const target = index + direction; const current = links[index]; const other = links[target]; if (!current || !other) return; links[index] = other; links[target] = current; update('links', links); }
  async function persist() {
    setError(''); const parsed = profileSchema.safeParse(draft);
    if (!parsed.success) { setError(parsed.error.issues.map(i => i.message).join(' · ')); return; }
    setBusy(true); try { await save({ data: { token: getPanelToken(), profile: parsed.data } }); setDirty(false); await refresh('settings'); toast.success('Profil zapisany'); } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się zapisać.'); } finally { setBusy(false); }
  }
  function exportConfig() { const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'pkmreps-profil.json'; a.click(); URL.revokeObjectURL(url); }
  return <section>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-semibold">Profil</h2><div className="flex gap-2"><Button variant="outline" size="icon" title="Pobierz ustawienia profilu" aria-label="Pobierz ustawienia profilu" onClick={exportConfig}><Download/></Button><Button variant="outline" asChild><Link to="/profil" target="_blank">Podgląd <ExternalLink/></Link></Button><Button onClick={() => void persist()} disabled={busy}><Save/>{busy ? 'Zapisywanie…' : 'Zapisz profil'}</Button></div></div>
    {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
    <div className="grid items-start gap-8 lg:grid-cols-2"><div className="space-y-6">
      <label className="block space-y-2 text-sm">Nazwa<Input aria-label="Nazwa profilu" value={draft.name} maxLength={80} onChange={e => update('name', e.target.value)}/></label>
      <label className="block space-y-2 text-sm">Bio<Textarea aria-label="Bio" value={draft.bio} maxLength={500} onChange={e => update('bio', e.target.value)}/></label>
      <div><h3 className="mb-2 text-sm">Zdjęcie profilowe</h3><ImageUploader folder="profile/avatar" multiple={false} urls={draft.avatar ? [draft.avatar] : []} onChange={u => update('avatar', u[0] || '')}/></div>
      <div><h3 className="mb-2 text-sm">Tło</h3><ImageUploader folder="profile/background" multiple={false} urls={draft.background ? [draft.background] : []} onChange={u => update('background', u[0] || '')}/></div>
      <div className="space-y-2"><label className="block text-sm">Muzyka<input aria-label="Wgraj muzykę" type="file" accept="audio/mpeg,audio/wav,audio/ogg,.mp3,.wav,.ogg" disabled={audioBusy} className="mt-2 block w-full text-xs" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 10000000) { setError('Muzyka może mieć maksymalnie 10 MB.'); return; } setAudioBusy(true); setError(''); try { const bytes = new Uint8Array(await file.arrayBuffer()); let binary = ''; for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); const mime = file.type || (file.name.endsWith('.ogg') ? 'audio/ogg' : file.name.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg'); const res = await uploadAudio({ data: { token: getPanelToken(), base64: btoa(binary), contentType: mime as 'audio/mpeg' | 'audio/wav' | 'audio/ogg' } }); update('music', res.url); } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się przesłać muzyki.'); } finally { setAudioBusy(false); } }}/></label>{audioBusy && <p className="text-xs text-muted-foreground">Przesyłanie muzyki…</p>}{draft.music && <div className="flex items-center gap-2"><audio controls src={draft.music} className="min-w-0 flex-1"/><Button variant="ghost" size="icon" aria-label="Usuń muzykę" onClick={() => update('music', '')}><Trash2/></Button></div>}</div>
      {draft.music && <label className="block space-y-2 text-sm">Muzyka gra od sekundy<Input aria-label="Start muzyki w sekundach" type="number" min={0} max={3600} value={draft.musicStart} onChange={e => update('musicStart', Math.max(0, Math.min(3600, Number(e.target.value) || 0)))}/></label>}
      <label className="block space-y-2 text-sm">Dekoracja<select className="block w-full rounded-md border border-input bg-secondary px-3 py-2" value={draft.decoration} onChange={e => update('decoration', e.target.value as 'none' | 'snow')}><option value="none">Brak</option><option value="snow">Spadający śnieg</option></select></label>
      <div className="flex items-center justify-between border-t border-border pt-6"><h3 className="text-lg font-semibold">Linki</h3><Button variant="outline" size="sm" disabled={draft.links.length >= 40} onClick={() => update('links', [...draft.links, { id: crypto.randomUUID(), title: '', subtitle: '', url: '', image: '' }])}><Plus/>Dodaj link</Button></div>
      {draft.links.map((link, i) => <div key={link.id} className="space-y-3 rounded-lg border border-border bg-surface p-4"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{i === 0 ? 'Główny blok' : `Link ${i + 1}`}</span><div className="flex"><Button variant="ghost" size="icon" title="Przesuń w górę" aria-label={`Przesuń link ${i + 1} w górę`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp/></Button><Button variant="ghost" size="icon" title="Przesuń w dół" aria-label={`Przesuń link ${i + 1} w dół`} disabled={i === draft.links.length - 1} onClick={() => move(i, 1)}><ArrowDown/></Button><Button variant="ghost" size="icon" title="Usuń link" aria-label={`Usuń link ${i + 1}`} onClick={() => update('links', draft.links.filter(l => l.id !== link.id))}><Trash2/></Button></div></div>{(['title', 'subtitle', 'url'] as const).map(key => <label key={key} className="block space-y-1 text-xs">{key === 'title' ? 'Nazwa linku' : key === 'subtitle' ? 'Podpis' : 'Adres'}<Input value={link[key]} onChange={e => update('links', draft.links.map(l => l.id === link.id ? { ...l, [key]: e.target.value } : l))} placeholder={key === 'url' ? 'https://… lub /qc' : ''}/></label>)}<ImageUploader label={i === 0 ? 'Zdjęcie głównego bloku' : 'Ikona linku'} multiple={false} folder="profile/links" urls={link.image ? [link.image] : []} onChange={u => update('links', draft.links.map(l => l.id === link.id ? { ...l, image: u[0] || '' } : l))}/></div>)}
    </div><div className="overflow-hidden rounded-lg border border-border lg:sticky lg:top-6"><ProfileView config={draft} preview/></div></div>
  </section>;
}
