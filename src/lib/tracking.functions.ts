import { createServerFn } from '@tanstack/react-start';
import { latestTrackingEvent, trackingStage, providerDeliveryDate } from './tracking';
export type TrackResult = { ok: boolean; error?: string; code?: string; source?: string; stageKey?: string; lastStatus?: string; lastTime?: string; deliveryDate?: string; events?: { status: string; time: string }[]; unavailable?: boolean; destination?: string; };

/** Only actual carrier events are shown. A number prefix is not evidence of an ETA. */
export const trackParcel = createServerFn({ method: 'POST' })
  .inputValidator((data: { code: string }) => {
    const code = String(data?.code ?? '').trim().replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z0-9-]{6,64}$/.test(code)) throw new Error('Nieprawidłowy numer przesyłki.');
    return { code };
  })
  .handler(async ({ data }): Promise<TrackResult> => {
    try {
      const response = await fetch(`https://global.cainiao.com/global/detail.json?mailNos=${encodeURIComponent(data.code)}&lang=en-US`, { signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json' } });
      if (!response.ok) { console.warn('Tracking provider unavailable', response.status); return { ok: true, unavailable: true, code: data.code, destination: 'Polska' }; }
      const json = await response.json() as { module?: { detailList?: { desc?: string; standerdDesc?: string; time?: string; timeStr?: string }[]; estimatedDeliveryDate?: string }[] };
      const parcel = json.module?.[0];
      const events = (parcel?.detailList ?? []).map(e => ({ status: String(e.desc || e.standerdDesc || '').trim(), time: String(e.time || e.timeStr || '').trim() })).filter(e => Boolean(e.status));
      const latest = latestTrackingEvent(events);
      if (latest) return { ok: true, code: data.code, source: 'Cainiao', destination: 'Polska (wybrany kierunek)', lastStatus: latest.status, lastTime: latest.time, stageKey: trackingStage(latest.status), deliveryDate: providerDeliveryDate(parcel?.estimatedDeliveryDate), events: events.slice(0, 30) };
    } catch { console.warn('Tracking provider returned no usable data'); }
    return { ok: true, unavailable: true, code: data.code, destination: 'Polska' };
  });
