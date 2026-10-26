import { beforeEach, describe, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';

const db = vi.hoisted(() => ({ rows: {} as Record<string, string>, fail: false }));
vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: { from: () => ({
    select: () => ({
      in: async (_column: string, keys: string[]) => ({ data: keys.filter(key => key in db.rows).map(key => ({ key, value: db.rows[key] })), error: db.fail ? { message: 'offline' } : null }),
      eq: (_column: string, key: string) => ({ maybeSingle: async () => ({ data: db.rows[key] ? { value: db.rows[key] } : null, error: db.fail ? { message: 'offline' } : null }) }),
    }),
    upsert: async (input: { key: string; value: string } | { key: string; value: string }[]) => {
      if (db.fail) return { error: { message: 'offline' } };
      for (const row of Array.isArray(input) ? input : [input]) db.rows[row.key] = row.value;
      return { error: null };
    },
  }) },
}));
import { changePanelCredentials, confirmPanelPassword, loginPanel, verifyPanelSession } from '../panel-auth.server';

beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto);
  vi.stubEnv('PANEL_ADMIN_LOGIN', 'test-admin');
  vi.stubEnv('PANEL_ADMIN_PASSWORD', 'fixture-password-only');
  vi.stubEnv('PANEL_SESSION_SECRET', 'fixture-signing-secret-only');
  db.rows = {}; db.fail = false;
});

async function signIn() {
  const result = await loginPanel('test-admin', 'fixture-password-only');
  if (!result.ok || !('token' in result)) throw new Error('fixture login failed');
  return result.token;
}

describe('signed panel security', () => {
  it('accepts a real signed session but rejects appended token segments and forged expiry', async () => {
    const token = await signIn();
    expect((await verifyPanelSession(token))?.role).toBe('admin');
    expect(await verifyPanelSession(`${token}.extra`)).toBeNull();
    expect(await verifyPanelSession(`panel.NaN.${token.split('.')[2]}`)).toBeNull();
  });
  it('requires the correct current password for destructive confirmation', async () => {
    const token = await signIn();
    expect(await confirmPanelPassword(token, 'wrong-password')).toBe(false);
    expect(await confirmPanelPassword(token, 'fixture-password-only')).toBe(true);
    expect(await confirmPanelPassword('forged', 'fixture-password-only')).toBe(false);
  });
  it('locks after ten failed attempts, including concurrent requests', async () => {
    await Promise.all(Array.from({ length: 10 }, () => loginPanel('test-admin', 'wrong-password')));
    expect(JSON.parse(db.rows['secret_panel_attempts'] ?? '{}').count).toBe(10);
    expect((await loginPanel('test-admin', 'fixture-password-only')).ok).toBe(false);
  });
  it('fails closed when credential storage cannot be read', async () => {
    const token = await signIn(); db.fail = true;
    expect(await verifyPanelSession(token)).toBeNull();
    await expect(loginPanel('test-admin', 'fixture-password-only')).rejects.toThrow();
  });
  it('stores only a password hash and invalidates existing sessions after credential changes', async () => {
    const token = await signIn();
    expect(await changePanelCredentials(token, 'fixture-password-only', 'new-admin', 'new-fixture-password')).toEqual({ error: null });
    expect(db.rows['secret_panel_password']).not.toBe('new-fixture-password');
    expect(db.rows['secret_panel_password']).toMatch(/^[^:]+:[a-f0-9]{64}$/);
    expect(await verifyPanelSession(token)).toBeNull();
    expect((await loginPanel('new-admin', 'new-fixture-password')).ok).toBe(true);
  });
});