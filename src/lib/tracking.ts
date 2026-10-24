export type TrackingEvent = { status: string; time: string };
export function latestTrackingEvent(events: TrackingEvent[]): TrackingEvent | undefined {
  return [...events].sort((a, b) => (Date.parse(b.time) || 0) - (Date.parse(a.time) || 0))[0];
}
export function trackingStage(status: string): string | undefined {
  if (/(not delivered|delivery failed|unsuccessful|exception|return|failed attempt|nie doręcz|nie dostarcz)/i.test(status)) return undefined;
  if (/(^delivered\b|successfully delivered|shipment delivered|package delivered|dostarczono|签收)/i.test(status)) return 's7';
  if (/(out for delivery|ready for pickup|do odbioru|kurier w drodze)/i.test(status)) return 's6';
  if (/(arrived.*(poland|polska|warsaw)|delivery center|sortown)/i.test(status)) return 's5';
  if (/(customs|clearance|odpraw|import scan)/i.test(status)) return 's4';
  if (/(flight|linehaul|transit|transport)/i.test(status)) return 's3';
  if (/(shipped|departed|export|dispatch|wysłan)/i.test(status)) return 's2';
  if (/(warehouse|packed|awaiting|created|oczek|spakowan)/i.test(status)) return 's1';
  return undefined;
}
export function providerDeliveryDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value) || !Number.isFinite(Date.parse(value))) return undefined;
  return value.slice(0, 10);
}
