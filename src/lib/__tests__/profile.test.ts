import { describe, it, expect } from 'vitest';
import { parseProfile, profileSchema, safeProfileUrl, defaultProfile } from '../profile';
describe('Public profile', () => {
  it('allows internal links without requiring Linktree', () => expect(safeProfileUrl('/qc')).toBe('/qc'));
  it('rejects executable links', () => expect(safeProfileUrl('javascript:alert(1)')).toBe(''));
  it('supports a featured first link followed by ordered tiles', () => { const config = profileSchema.parse({ ...defaultProfile, links: [{ ...defaultProfile.links[0], id: 'first', title: 'First', url: '/qc', subtitle: '', image: '' }, { id: 'second', title: 'Second', url: '/agenci', subtitle: '', image: '' }] }); expect(config.links.map(l => l.id)).toEqual(['first', 'second']); });
  it('supports optional background, music and snow', () => { const config = profileSchema.parse({ ...defaultProfile, background: '/background.jpg', music: '/music.mp3', decoration: 'snow' }); expect(config.background).toBe('/background.jpg'); expect(config.music).toBe('/music.mp3'); expect(config.decoration).toBe('snow'); });
  it('recovers from invalid saved data', () => expect(parseProfile('{')).toEqual(defaultProfile));
});