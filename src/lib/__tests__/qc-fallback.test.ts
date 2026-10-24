import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ agent: vi.fn(), finder: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => ({ inputValidator: () => ({ handler: (fn: unknown) => fn }) }) }));
vi.mock('@/lib/agentApi', () => ({ fetchUsfansDetails: mocks.agent }));
vi.mock('@/lib/finderqc.server', () => ({ fetchFinderQcByUrl: mocks.finder }));
vi.mock('@/lib/image-storage.server', () => ({ archiveProductImages: (row: unknown) => Promise.resolve(row) }));
import { finderQcByLink } from '../finderqc.functions';
const call = finderQcByLink as unknown as (args: { data: { url: string; page: number; pageSize: number } }) => Promise<{ images: string[]; hasMore: boolean }>;
beforeEach(() => vi.resetAllMocks());
describe('QC fallback', () => {
  it('shows FinderQC photos when agent has no QC', async () => { mocks.agent.mockResolvedValue(null); mocks.finder.mockResolvedValue({ ok: true, images: ['https://finderqc.com/photo.jpg'], totalPhotos: 1, hasMore: false }); const result = await call({ data: { url: 'https://weidian.com/item.html?itemID=12345', page: 1, pageSize: 4 } }); expect(result.images).toEqual(['https://finderqc.com/photo.jpg']); expect(result.hasMore).toBe(false); });
  it('keeps available agent photos if FinderQC is down', async () => { mocks.agent.mockResolvedValue({ qcImages: ['https://usfans.com/qc.jpg'] }); mocks.finder.mockRejectedValue(new Error('unavailable')); expect((await call({ data: { url: 'https://weidian.com/item.html?itemID=12345', page: 1, pageSize: 4 } })).images).toEqual(['https://usfans.com/qc.jpg']); });
  it('reports source failure rather than a false empty success', async () => { mocks.agent.mockResolvedValue(null); mocks.finder.mockRejectedValue(new Error('unavailable')); await expect(call({ data: { url: 'https://weidian.com/item.html?itemID=12345', page: 1, pageSize: 4 } })).rejects.toThrow('Źródło QC'); });
});
