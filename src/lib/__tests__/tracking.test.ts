import { describe, it, expect } from 'vitest';
import { latestTrackingEvent, trackingStage, providerDeliveryDate } from '../tracking';
describe('China to Poland tracking', () => {
  it('uses latest event rather than a past customs event', () => { const latest = latestTrackingEvent([{ status: 'customs clearance', time: '2026-10-20' }, { status: 'out for delivery', time: '2026-10-24' }]); expect(latest?.status).toBe('out for delivery'); expect(trackingStage(latest?.status || '')).toBe('s6'); });
  it('does not mark a failed delivery as delivered', () => expect(trackingStage('Not delivered, unsuccessful delivery')).toBeUndefined());
  it('does not invent a calendar ETA without provider data', () => expect(providerDeliveryDate(undefined)).toBeUndefined());
  it('preserves the exact provider delivery day', () => expect(providerDeliveryDate('2026-10-27')).toBe('2026-10-27'));
});
