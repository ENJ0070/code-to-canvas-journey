import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProfileView } from '@/components/profile/ProfileView';
import { defaultProfile } from '@/lib/profile';

describe('Profile music controls', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  function setup() {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const { container } = render(<ProfileView config={{ ...defaultProfile, music: '/track.mp3', musicStart: 12 }} />);
    const audio = container.querySelector('audio');
    if (!audio) throw new Error('Expected configured music');
    return { audio, play, pause };
  }

  it('starts configured music from the selected second', async () => {
    const { audio, play } = setup();
    await waitFor(() => expect(play).toHaveBeenCalled());
    expect(audio.currentTime).toBe(12);
    expect(audio.volume).toBe(.7);
  });

  it('mutes and restores volume without pausing the track', async () => {
    const { audio, pause } = setup();
    fireEvent.click(await screen.findByRole('button', { name: 'Wycisz muzykę' }));
    expect(audio.muted).toBe(true);
    expect(audio.volume).toBe(0);
    expect(pause).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Włącz muzykę' }));
    expect(audio.muted).toBe(false);
    expect(audio.volume).toBe(.7);
  });

  it('allows lowering and raising volume with the slider', async () => {
    const { audio } = setup();
    const slider = screen.getByRole('slider', { name: 'Głośność muzyki' });
    await screen.findByRole('button', { name: 'Wycisz muzykę' });
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(audio.volume).toBe(.69);
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(audio.volume).toBe(.7);
  });
});