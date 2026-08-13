import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, string>();

beforeEach(() => {
  vi.resetModules();
  storage.clear();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
});

describe('apiRequest authentication recovery', () => {
  it('refreshes an expired token and retries the original request', async () => {
    storage.set('admin_access_token', 'expired');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ accessToken: 'fresh' }))
      .mockResolvedValueOnce(Response.json({ id: 'admin' }));
    vi.stubGlobal('fetch', fetchMock);
    const { apiRequest } = await import('./api-client');

    await expect(apiRequest('/api/accounts/me')).resolves.toEqual({ id: 'admin' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(new Headers(fetchMock.mock.calls[2][1].headers).get('Authorization')).toBe('Bearer fresh');
  });

  it('shares one refresh operation between concurrent unauthorized requests', async () => {
    storage.set('admin_access_token', 'expired');
    let protectedCalls = 0;
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/api/accounts/refresh-token')) {
        await Promise.resolve();
        return Response.json({ accessToken: 'fresh' });
      }
      protectedCalls += 1;
      return protectedCalls <= 2
        ? new Response(null, { status: 401 })
        : Response.json({ ok: true });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { apiRequest } = await import('./api-client');

    await Promise.all([apiRequest('/api/admin/dashboard'), apiRequest('/api/admin/resources')]);

    const refreshCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/api/accounts/refresh-token'));
    expect(refreshCalls).toHaveLength(1);
  });

  it('lets the browser set multipart content type for uploads', async () => {
    storage.set('admin_access_token', 'fresh');
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ publicUrl: 'image-url' }, { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    const { uploadRequest } = await import('./api-client');
    const form = new FormData();
    form.append('file', new Blob(['image'], { type: 'image/png' }), 'image.png');

    await uploadRequest('/api/admin/media/images', form);

    expect(new Headers(fetchMock.mock.calls[0][1].headers).has('Content-Type')).toBe(false);
  });
});
