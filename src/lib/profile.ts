import { z } from 'zod';

export const PROFILE_KEY = 'public_profile';
export function safeProfileUrl(value: string): string {
  if (/^\/(?!\/)[^\s\\]*$/.test(value)) return value;
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : ''; } catch { return ''; }
}
const media = z.string().max(2000).refine(v => !v || Boolean(safeProfileUrl(v)), 'Nieprawidłowy adres');
export const profileSchema = z.object({
  version: z.literal(1).default(1), name: z.string().trim().min(1).max(80),
  bio: z.string().max(500), avatar: media, background: media, music: media,
  musicStart: z.number().min(0).max(3600).default(0),
  decoration: z.enum(['none', 'snow']),
  links: z.array(z.object({ id: z.string().max(100), title: z.string().trim().min(1).max(120), subtitle: z.string().max(200), url: z.string().max(2000).refine(v => Boolean(safeProfileUrl(v)), 'Podaj adres https:// lub ścieżkę strony'), image: media })).max(40),
});
export type ProfileConfig = z.infer<typeof profileSchema>;
export const defaultProfile: ProfileConfig = { version: 1, name: 'PKMREPS', bio: 'Findsy, QC i wszystko do następnego haulu.', avatar: '', background: '', music: '', musicStart: 0, decoration: 'snow', links: [
  { id: 'finder', title: 'Znajdź swój następny item', subtitle: 'PKMREPS · Find Engine', url: '/', image: '' },
  { id: 'qc', title: 'QC Finder', subtitle: 'Zdjęcia przed zakupem', url: '/qc', image: '' },
  { id: 'agents', title: 'Agenci', subtitle: '', url: '/agenci', image: '' },
  { id: 'shipping', title: 'Kalkulator wysyłki', subtitle: 'Twój haul → Polska', url: '/poradnik#shipping', image: '' },
] };
export function parseProfile(raw?: string): ProfileConfig {
  try { const parsed = profileSchema.safeParse(JSON.parse(raw || '')); return parsed.success ? parsed.data : defaultProfile; } catch { return defaultProfile; }
}