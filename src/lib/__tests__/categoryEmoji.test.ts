import { describe, expect, it } from 'vitest';
import { categoryEmoji } from '../categoryEmoji';

describe('screenshot category names', () => {
  it('recognizes Room', () => expect(categoryEmoji('Room')).toBe('📦'));
  it('recognizes Sets', () => expect(categoryEmoji('Sets')).toBe('📦'));
  it('distinguishes non-clothing accessories', () => expect(categoryEmoji('Akcesoria (nie ciuch)')).toBe('🧩'));
});