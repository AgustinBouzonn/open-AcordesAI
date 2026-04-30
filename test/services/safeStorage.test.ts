import { describe, it, expect, beforeEach } from 'vitest';
import { safeStorage } from '../../services/safeStorage';

describe('safeStorage', () => {
  beforeEach(() => {
    try { window.localStorage.clear(); } catch { /* noop */ }
  });

  it('writes and reads through localStorage when available', () => {
    safeStorage.set('foo', 'bar');
    expect(safeStorage.get('foo')).toBe('bar');
  });

  it('removes a key', () => {
    safeStorage.set('foo', 'bar');
    safeStorage.remove('foo');
    expect(safeStorage.get('foo')).toBeNull();
  });

  it('returns null for missing keys', () => {
    expect(safeStorage.get('does-not-exist')).toBeNull();
  });
});
