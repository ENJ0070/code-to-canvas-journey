import { useRef, useState } from 'react';
import { ArrowUpRight, Volume2, VolumeX, Share2, ScanSearch, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProfileConfig } from '@/lib/profile';
import offerImage from '@/assets/shipping-offer-web.jpg';

export function ProfileView({ config, preview = false }: { config: ProfileConfig; preview?: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [shared, setShared] = useState(false);
  const [audioError, setAudioError] = useState('');
  async function toggleMusic() {
    if (!audio.current) return;
    if (playing) { audio.current.pause(); setPlaying(false); return; }
    try { await audio.current.play(); setPlaying(true); setAudioError(''); } catch { setAudioError('Nie udało się odtworzyć muzyki.'); }
  }
  async function share() {
    try { await navigator.clipboard.writeText(window.location.origin + '/profil'); setShared(true); setTimeout(() => setShared(false), 2000); } catch { setShared(false); }
  }
  return <div className={`profile-stage ${preview ? 'profile-preview' : ''}`}>
    {config.background && <img src={config.background} alt="" className="profile-backdrop" />}
    <div className="profile-shade" />
    {config.decoration === 'snow' && <div className="profile-snow" aria-hidden="true">{Array.from({ length: 30 }, (_, i) => <span key={i} style={{ left: `${(i * 37 + 3) % 100}%`, animationDelay: `${-i * .73}s`, animationDuration: `${9 + i % 8}s` }}>✦</span>)}</div>}
    {!preview && <div className="profile-controls">{config.music && <Button variant="outline" size="icon" title={playing ? 'Wycisz muzykę' : 'Odtwórz muzykę'} aria-label={playing ? 'Wycisz muzykę' : 'Odtwórz muzykę'} onClick={() => void toggleMusic()}>{playing ? <Volume2 size={18}/> : <VolumeX size={18}/>}</Button>}<Button variant="outline" size="icon" title={shared ? 'Skopiowano link' : 'Kopiuj link do profilu'} aria-label="Kopiuj link do profilu" onClick={() => void share()}><Share2 size={17}/></Button></div>}
    {config.music && <audio ref={audio} src={config.music} loop preload="none" onError={() => setAudioError('Nie udało się odtworzyć muzyki.')} />}
    <div className="profile-column" data-no-translate>
      <header className="profile-identity">
        {config.avatar ? <img src={config.avatar} className="profile-avatar" alt={`Zdjęcie ${config.name}`}/> : <div className="profile-avatar profile-monogram">{config.name.slice(0, 2).toUpperCase()}</div>}
        <h1>{config.name}</h1><p>{config.bio}</p>
      </header>
      {audioError && <p role="alert" className="text-center text-xs text-destructive">{audioError}</p>}
      <div className="profile-links">{config.links.map((link, i) => <a key={link.id} href={link.url} target={link.url.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer" className={i === 0 ? 'profile-featured' : 'profile-link'}>
        {i === 0 ? <><img src={link.image || offerImage} alt=""/><div className="profile-featured-caption"><span><span className="block font-semibold">{link.title}</span>{link.subtitle && <span className="mt-1 block text-xs text-muted-foreground">{link.subtitle}</span>}</span><ArrowUpRight size={22}/></div></> : <>{link.image ? <img src={link.image} alt=""/> : <span className="profile-link-symbol">{link.url.includes('qc') ? <ScanSearch size={19}/> : <Link2 size={19}/>}</span>}<span className="min-w-0 flex-1 text-center"><span className="block text-sm font-medium">{link.title}</span>{link.subtitle && <span className="mt-1 block text-xs text-muted-foreground">{link.subtitle}</span>}</span><ArrowUpRight size={16} className="text-muted-foreground"/></>}
      </a>)}</div>
      <footer className="profile-footer">{config.name} <span>·</span> <a href="/">PKMREPS</a></footer>
    </div>
  </div>;
}
