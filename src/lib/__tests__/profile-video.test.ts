import { describe, expect, it } from 'vitest';
import { PROFILE_VIDEO_LIMIT, profileVideoType } from '../profile-video';
describe('Profile background upload', () => {
  it('accepts MP4 container bytes', () => expect(profileVideoType(new Uint8Array([0,0,0,20,102,116,121,112,105,115,111,109]))).toBe('video/mp4'));
  it('rejects HTML disguised as video', () => expect(profileVideoType(new TextEncoder().encode('<html>not a video</html>'))).toBeNull());
  it('rejects videos larger than 10 MB', () => expect(profileVideoType(new Uint8Array(PROFILE_VIDEO_LIMIT + 1))).toBeNull());
});