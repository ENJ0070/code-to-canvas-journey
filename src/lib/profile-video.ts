export const PROFILE_VIDEO_LIMIT = 10_000_000;
export function profileVideoType(bytes: Uint8Array): 'video/mp4' | 'video/webm' | null {
  if (bytes.length < 12 || bytes.length > PROFILE_VIDEO_LIMIT) return null;
  const signature = String.fromCharCode(...bytes.slice(4, 8));
  if (signature === 'ftyp') return 'video/mp4';
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3 && new TextDecoder().decode(bytes.slice(0, 4096)).includes('webm')) return 'video/webm';
  return null;
}