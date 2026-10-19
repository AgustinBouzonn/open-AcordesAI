import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetErrorReporter, normalizeRoute, reportClientError, scrubMessage } from '../../services/errorReporter';

describe('errorReporter', () => {
  const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));

  beforeEach(() => {
    __resetErrorReporter();
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
    window.location.hash = '#/song/123?tab=chords';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes routes so reports group by screen', () => {
    expect(normalizeRoute('#/song/123?x=1')).toBe('/song/:id');
    expect(normalizeRoute('#/setlist/public/0123456789abcdef0123456789abcdef')).toBe('/setlist/public/:token');
    expect(normalizeRoute('')).toBe('/');
  });

  it('scrubs emails and long numbers from messages', () => {
    expect(scrubMessage('fallo para ana@mail.com en 12345678')).toBe('fallo para [email] en [n]');
  });

  it('posts a trimmed report with the normalized route', () => {
    reportClientError(new TypeError('x is undefined'), 'boundary');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/signals\/client-error$/);
    expect(JSON.parse(String(init.body))).toEqual({ message: 'TypeError: x is undefined', source: 'boundary', route: '/song/:id' });
  });

  it('dedupes repeated errors and caps reports per session', () => {
    for (let i = 0; i < 3; i++) reportClientError(new Error('same'), 'window');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    for (let i = 0; i < 10; i++) reportClientError(new Error(`distinct ${i}`), 'window');
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('never throws even if fetch is unavailable', () => {
    vi.stubGlobal('fetch', () => { throw new Error('no fetch'); });
    expect(() => reportClientError('boom', 'unhandledrejection')).not.toThrow();
  });
});
