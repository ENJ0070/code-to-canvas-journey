import { describe, it, expect } from 'vitest';
import { parseProfile, profileSchema, safeProfileUrl, defaultProfile } from '../profile';
describe('Public profile', () => {
  it('allows internal links without requiring Linktree', () => expect(safeProfileUrl('/qc')).toBe('/qc'));
  it('rejects executable links', () => expect(safeProfileUrl('javascript:alert(1)')).toBe(''));
  it('supports a featured first link followed by ordered tiles', () => { const config = profileSchema.parse({ ...defaultProfile, links: [{ ...defaultProfile.links[0], id: 'first', title: 'First', url: '/qc', subtitle: '', image: '' }, { id: 'second', title: 'Second', url: '/agenci', subtitle: '', image: '' }] }); expect(config.links.map(l => l.id)).toEqual(['first', 'second']); });
  it('supports optional background, music and snow', () => { const config = profileSchema.parse({ ...defaultProfile, background: '/background.jpg', music: '/music.mp3', decoration: 'snow' }); expect(config.background).toBe('/background.jpg'); expect(config.music).toBe('/music.mp3'); expect(config.decoration).toBe('snow'); });
  it('keeps small social icons for filled addresses only', () => { const config = profileSchema.parse({ ...defaultProfile, socials: { discord: 'https://discord.gg/pkm', tiktok: '', website: '/' } }); expect(config.socials.discord).toBe('https://discord.gg/pkm'); expect(config.socials.tiktok).toBe(''); });
  it('adds socials automatically to profile data saved before they existed', () => expect(parseProfile(JSON.stringify({ ...defaultProfile, socials: undefined })).socials).toEqual({ discord: '', tiktok: '', website: '/' }));
  it('rejects executable social links', () => expect(profileSchema.safeParse({ ...defaultProfile, socials: { discord: 'javascript:alert(1)', tiktok: '', website: '/' } }).success).toBe(false));
  it('recovers from invalid saved data', () => expect(parseProfile('{')).toEqual(defaultProfile));
  it('sets Shenzhen, China for older profiles without a location', () => expect(parseProfile(JSON.stringify({ ...defaultProfile, location: undefined })).location).toBe('Shenzhen, China'));
  it('preserves configured background video', () => expect(profileSchema.parse({ ...defaultProfile, backgroundVideo: '/clip.mp4' }).backgroundVideo).toBe('/clip.mp4'));
});