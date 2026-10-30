import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { profileSchema, PROFILE_KEY } from './profile';
import { PROFILE_VIDEO_LIMIT, profileVideoType } from './profile-video';

export const saveProfile = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ token: z.string().max(4000), profile: profileSchema }).parse(data))
  .handler(async ({ data }) => {
    const { verifyToken } = await import('./session.server');
    if ((await verifyToken(data.token))?.role !== 'admin') throw new Error('Brak uprawnień.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin.from('settings').upsert({ key: PROFILE_KEY, value: JSON.stringify(data.profile) });
    if (error) throw new Error('Nie udało się zapisać profilu.');
    return { ok: true };
  });

export const uploadProfileAudio = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ token: z.string().max(4000), base64: z.string().min(1).max(14000000), contentType: z.enum(['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-wav']) }).parse(data))
  .handler(async ({ data }) => {
    const { verifyToken } = await import('./session.server');
    if ((await verifyToken(data.token))?.role !== 'admin') throw new Error('Brak uprawnień.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const bytes = Uint8Array.from(atob(data.base64), c => c.charCodeAt(0));
    const head = String.fromCharCode(...bytes.slice(0, 12));
    const mp3 = head.startsWith('ID3') || (bytes[0] === 255 && ((bytes[1] ?? 0) & 224) === 224);
    const wav = head.startsWith('RIFF') && head.slice(8) === 'WAVE';
    const ogg = head.startsWith('OggS');
    if (!mp3 && !wav && !ogg) throw new Error('Wybierz plik MP3, WAV lub OGG.');
    const ext = mp3 ? 'mp3' : wav ? 'wav' : 'ogg';
    const path = `catalog/profile/music/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabaseAdmin.storage.from('product-images').upload(path, bytes, { contentType: mp3 ? 'audio/mpeg' : wav ? 'audio/wav' : 'audio/ogg', upsert: false, cacheControl: '31536000' });
    if (error) throw new Error('Nie udało się zapisać muzyki.');
    return { url: `/api/public/product-image?path=${encodeURIComponent(path)}` };
  });

export const uploadProfileVideo = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Wybierz plik filmu.');
    const token = z.string().max(4000).parse(data.get('token'));
    const file = data.get('file');
    if (!(file instanceof File) || file.size === 0 || file.size > PROFILE_VIDEO_LIMIT) throw new Error('Film może mieć maksymalnie 10 MB.');
    return { token, file };
  })
  .handler(async ({ data }) => {
    const { verifyToken } = await import('./session.server');
    if ((await verifyToken(data.token))?.role !== 'admin') throw new Error('Brak uprawnień.');
    const bytes = new Uint8Array(await data.file.arrayBuffer());
    const type = profileVideoType(bytes);
    if (!type) throw new Error('Wybierz film MP4 lub WebM.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const path = `catalog/profile/video/${crypto.randomUUID()}.${type === 'video/mp4' ? 'mp4' : 'webm'}`;
    const { error } = await supabaseAdmin.storage.from('product-images').upload(path, bytes, { contentType: type, upsert: false, cacheControl: '31536000' });
    if (error) throw new Error('Nie udało się zapisać filmu.');
    return { url: `/api/public/product-image?path=${encodeURIComponent(path)}` };
  });
/** Publiczny licznik wejść na profil — wspólny dla wszystkich, zapisywany w bazie. */
export const registerProfileView = createServerFn({ method: 'POST' }).handler(async () => {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.rpc('increment_profile_views' as never);
  if (error) return { views: null as number | null };
  return { views: Number(data) || null };
});
