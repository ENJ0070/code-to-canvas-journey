import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProfileView } from '@/components/profile/ProfileView';
import { defaultProfile } from '@/lib/profile';

describe('Profile music controls', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  function setup() {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    let paused = true;
    vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockImplementation(() => paused);
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(async function (this: HTMLMediaElement) { paused = false; this.dispatchEvent(new Event('play')); });
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) { paused = true; this.dispatchEvent(new Event('pause')); });
    const { container } = render(<ProfileView config={{ ...defaultProfile, music: '/track.mp3', musicStart: 12 }} />);
    const audio = container.querySelector('audio');
    if (!audio) throw new Error('Expected configured music');
    return { audio, play, pause };
  }

  it('does not start music until the visitor presses the music button', async () => {
    const { play } = setup();
    fireEvent.pointerDown(window);
    fireEvent.click(document.body);
    expect(play).not.toHaveBeenCalled();
  });

  it('starts from the selected second after pressing play, and the same button stops it', async () => {
    const { audio, play, pause } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Włącz muzykę' }));
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
    expect(audio.currentTime).toBe(12);
    expect(audio.volume).toBe(.7);
    fireEvent.click(await screen.findByRole('button', { name: 'Zatrzymaj muzykę' }));
    expect(pause).toHaveBeenCalled();
    await screen.findByRole('button', { name: 'Włącz muzykę' });
  });

  it('pauses when the tab is hidden and does not resume when it comes back', async () => {
    const { play, pause } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Włącz muzykę' }));
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(pause).toHaveBeenCalled();
    hidden.mockReturnValue(false);
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('allows lowering and raising volume with the slider', () => {
    const { audio } = setup();
    const slider = screen.getByRole('slider', { name: 'Głośność muzyki' });
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(audio.volume).toBe(.69);
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(audio.volume).toBe(.7);
  });
});
