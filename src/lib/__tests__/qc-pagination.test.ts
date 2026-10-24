import { describe, expect, it } from 'vitest';
import { QC_SETS_PER_PAGE, QC_PHOTOS_PER_PAGE, qcPageImages } from '../qc-pagination';
describe('four QC sets', () => {
  it('requests four sets and supports five photos per set', () => {
    expect(QC_SETS_PER_PAGE).toBe(4);
    expect(QC_PHOTOS_PER_PAGE).toBe(20);
    const sets = Array.from({length:4}, (_,s) => Array.from({length:5},(_,p)=>`https://example.com/set-${s}-${p}.jpg`));
    expect(qcPageImages([],sets.flat())).toHaveLength(20);
  });
  it('keeps four-photo sets intact without inventing extra photos', () => {
    const photos = Array.from({length:16},(_,i)=>`https://example.com/${i}.jpg`);
    expect(qcPageImages([],photos)).toHaveLength(16);
  });
  it('deduplicates supplements and bounds the visible page', () => {
    const photos=Array.from({length:20},(_,i)=>`https://example.com/${i}.jpg`);
    expect(qcPageImages([photos[0] ?? '', 'https://example.com/extra.jpg'],photos)).toEqual(photos);
  });
});