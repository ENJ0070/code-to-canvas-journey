import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Volume2, VolumeX, Share2, ScanSearch, Link2, MapPin, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { ProfileConfig } from '@/lib/profile';
import { ProfileSocials } from './ProfileSocials';
import offerImage from '@/assets/shipping-offer-web.jpg';

export function ProfileView({ config, preview = false }: { config: ProfileConfig; preview?: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const volumeRef = useRef(70);
  const previousVolume = useRef(70);
  const [videoFailed, setVideoFailed] = useState(false);
  const [shared, setShared] = useState(false);
  const [audioError, setAudioError] = useState('');
  const started = useRef(false);
  useEffect(() => setVideoFailed(false), [config.backgroundVideo]);
  useEffect(() => {
    if (preview) return;
    const root = stage.current;
    const dot = cursor.current;
    if (!root || !dot) return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let previousTime = 0;
    const animate = (time: number) => {
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16.67;
      previousTime = time;
      const easing = 1 - Math.exp(-elapsed / 120);
      x += (targetX - x) * easing;
      y += (targetY - y) * easing;
      root.style.setProperty('--profile-x', `${x}`);
      root.style.setProperty('--profile-y', `${y}`);
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > .001) frame = requestAnimationFrame(animate);
      else { frame = 0; previousTime = 0; }
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      root.classList.add('profile-pointer-active');
      dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      if (reducedMotion.matches) return;
      targetX = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1));
      targetY = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1));
      if (!frame) frame = requestAnimationFrame(animate);
    };
    const reset = () => {
      root.classList.remove('profile-pointer-active');
      targetX = 0; targetY = 0;
      if (!frame) frame = requestAnimationFrame(animate);
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
    };
  }, [preview]);
  function seekStart(el: HTMLAudioElement) { if (!started.current) { started.current = true; try { el.currentTime = config.musicStart || 0; } catch { /* ignore */ } } }
  useEffect(() => {
    const el = audio.current;
    if (preview || !config.music || !el) return;
    let done = false;
    started.current = false;
    const start = async () => { if (done) return; seekStart(el); try { el.volume = volumeRef.current / 100; el.muted = volumeRef.current === 0; await el.play(); done = true; setPlaying(true); cleanup(); } catch { /* Browser requires a gesture; keep the profile visible. */ } };
    const events = ['pointerdown', 'keydown'] as const;
    const cleanup = () => events.forEach(ev => window.removeEventListener(ev, start));
    events.forEach(ev => window.addEventListener(ev, start, { passive: true }));
    void start();
    return () => { done = true; cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.music, preview]);
  function changeVolume(value: number) {
    const next = Math.max(0, Math.min(100, value));
    setVolume(next);
    volumeRef.current = next;
    if (next > 0) previousVolume.current = next;
    if (audio.current) { audio.current.volume = next / 100; audio.current.muted = next === 0; }
  }
  async function startMusic() {
    const el = audio.current;
    if (!el) return;
    seekStart(el);
    try { el.volume = volumeRef.current / 100; el.muted = volumeRef.current === 0; await el.play(); setPlaying(true); setAudioError(''); } catch { setAudioError('Nie udało się odtworzyć muzyki.'); }
  }
  async function toggleMusic() {
    if (!playing) { if (volume === 0) changeVolume(previousVolume.current); await startMusic(); return; }
    changeVolume(volume === 0 ? previousVolume.current : 0);
  }
  async function share() {
    try { await navigator.clipboard.writeText(window.location.origin + '/profil'); setShared(true); setTimeout(() => setShared(false), 2000); } catch { setShared(false); }
  }
  return <div ref={stage} className={`profile-stage ${preview ? 'profile-preview' : ''}`}>
    {!preview && <div ref={cursor} className="profile-cursor" aria-hidden="true"><span/></div>}
    {config.background && <img src={config.background} alt="" className="profile-backdrop" />}
    {config.backgroundVideo && !videoFailed && <video key={config.backgroundVideo} src={config.backgroundVideo} poster={config.background || undefined} autoPlay loop muted playsInline preload="metadata" className="profile-backdrop" aria-hidden="true" onError={() => setVideoFailed(true)} />}
    <div className="profile-shade" />
    {config.decoration === 'snow' && <div className="profile-snow" aria-hidden="true">{Array.from({ length: 30 }, (_, i) => <span key={i} style={{ left: `${(i * 37 + 3) % 100}%`, animationDelay: `${-i * .73}s`, animationDuration: `${9 + i % 8}s` }}>✦</span>)}</div>}
    {!preview && <><div className="profile-controls">{config.music && <div className="profile-volume"><Button variant="ghost" size="icon" title={playing && volume > 0 ? 'Wycisz muzykę' : 'Włącz muzykę'} aria-label={playing && volume > 0 ? 'Wycisz muzykę' : 'Włącz muzykę'} onClick={() => void toggleMusic()}>{playing && volume > 0 ? <Volume2 size={18}/> : <VolumeX size={18}/>}</Button><Slider aria-label="Głośność muzyki" value={[volume]} min={0} max={100} step={1} onValueChange={values => { const value = values[0]; if (value !== undefined) changeVolume(value); }} /><output aria-live="off">{volume}%</output></div>}</div><div className="profile-share"><Button variant="outline" size="icon" title={shared ? 'Skopiowano link' : 'Kopiuj link do profilu'} aria-label="Kopiuj link do profilu" onClick={() => void share()}><Share2 size={17}/></Button></div></>}
    {config.music && <audio ref={audio} src={config.music} loop preload="metadata" onLoadedMetadata={() => { if (audio.current) seekStart(audio.current); }} onError={() => setAudioError('Nie udało się odtworzyć muzyki.')} />}
    <div className="profile-column" data-no-translate>
      <header className="profile-identity">
        {config.avatar ? <img src={config.avatar} className="profile-avatar" alt={`Zdjęcie ${config.name}`}/> : <div className="profile-avatar profile-monogram">{config.name.slice(0, 2).toUpperCase()}</div>}
        <h1 className="profile-name"><span>{config.name}</span><span className="profile-verified" role="img" aria-label="Zweryfikowany profil" title="Zweryfikowany profil"><BadgeCheck size={22} aria-hidden="true"/></span></h1><p>{config.bio}</p>{config.location && <div className="profile-location" title="Lokalizacja"><MapPin size={14} aria-hidden="true"/><span>{config.location}</span></div>}<ProfileSocials socials={config.socials}/>
      </header>
      {audioError && <p role="alert" className="text-center text-xs text-destructive">{audioError}</p>}
      <div className="profile-links">{config.links.map((link, i) => <a key={link.id} href={link.url} target={link.url.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer" className={i === 0 ? 'profile-featured' : 'profile-link'}>
        {i === 0 ? <><img src={link.image || offerImage} alt=""/><div className="profile-featured-caption"><span><span className="block font-semibold">{link.title}</span>{link.subtitle && <span className="mt-1 block text-xs text-muted-foreground">{link.subtitle}</span>}</span><ArrowUpRight size={22}/></div></> : <>{link.image ? <img src={link.image} alt=""/> : <span className="profile-link-symbol">{link.url.includes('qc') ? <ScanSearch size={19}/> : <Link2 size={19}/>}</span>}<span className="min-w-0 flex-1 text-center"><span className="block text-sm font-medium">{link.title}</span>{link.subtitle && <span className="mt-1 block text-xs text-muted-foreground">{link.subtitle}</span>}</span><ArrowUpRight size={16} className="text-muted-foreground"/></>}
      </a>)}</div>
      <footer className="profile-footer">{config.name} <span>·</span> <a href="/">PKMREPS</a></footer>
    </div>
  </div>;
}
