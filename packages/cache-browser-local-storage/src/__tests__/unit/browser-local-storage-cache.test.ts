import { version } from '@algolia/client-common';

import { createBrowserLocalStorageCache } from '../..';

const notAvailableStorage: Storage = new Proxy(window.localStorage || {}, {
  get() {
    return () => {
      throw new Error('Component is not available');
    };
  },
});

describe('browser local storage cache', () => {
  beforeEach(async () => await createBrowserLocalStorageCache({ version }).clear());

  it('sets/gets values', async () => {
    const cache = createBrowserLocalStorageCache({ version });

    const defaultValue = () => Promise.resolve({ bar: 1 });

    const missMock = jest.fn();

    expect(
      await cache.get({ key: 'foo' }, defaultValue, {
        miss: () => Promise.resolve(missMock()),
      })
    ).toMatchSnapshot({ bar: 1 });

    expect(missMock.mock.calls.length).toBe(1);

    await cache.set({ key: 'foo' }, { foo: 2 });

    expect(
      await cache.get({ key: 'foo' }, defaultValue, {
        miss: () => Promise.resolve(missMock()),
      })
    ).toMatchObject({ foo: 2 });

    expect(missMock.mock.calls.length).toBe(1);
  });

  it('deletes keys', async () => {
    const cache = createBrowserLocalStorageCache({ version });
    await cache.set({ key: 'foo' }, { bar: 1 });

    await cache.delete({ key: 'foo' });

    const defaultValue = () => Promise.resolve({ bar: 2 });

    const missMock = jest.fn();

    expect(
      await cache.get({ key: 'foo' }, defaultValue, {
        miss: () => Promise.resolve(missMock()),
      })
    ).toMatchObject({ bar: 2 });

    expect(missMock.mock.calls.length).toBe(1);
  });

  it('allows to be clear', async () => {
    const cache = createBrowserLocalStorageCache({ version });
    await cache.set({ key: 1 }, { 'set-1': 1 });
    await cache.set({ key: 2 }, { 'set-2': 2 });

    expect(localStorage.getItem(`algoliasearch-client-js-${version}`)).toBe(
      '{"{\\"key\\":1}":{"set-1":1},"{\\"key\\":2}":{"set-2":2}}'
    );

    await cache.clear();

    expect(localStorage.getItem(`algoliasearch-client-js-${version}`)).toBeNull();

    const defaultValue1 = () => Promise.resolve({ 'get-1': 1 });
    const defaultValue2 = () => Promise.resolve({ 'get-2': 2 });

    const missMock = jest.fn();

    expect(
      await cache.get({ key: 1 }, defaultValue1, {
        miss: () => Promise.resolve(missMock()),
      })
    ).toMatchObject({ 'get-1': 1 });

    expect(
      await cache.get({ key: 2 }, defaultValue2, {
        miss: () => Promise.resolve(missMock()),
      })
    ).toMatchObject({ 'get-2': 2 });

    expect(missMock.mock.calls.length).toBe(2);
  });

  it('do throws localstorage related exceptions', async () => {
    const cache = createBrowserLocalStorageCache({
      version,
      localStorage: notAvailableStorage,
    });
    const key = { foo: 'bar' };
    const value = 'foo';
    const fallback = 'bar';

    const message = 'Component is not available';
    await expect(cache.clear()).rejects.toEqual(new Error(message));
    await expect(cache.delete(key)).rejects.toEqual(new Error(message));
    await expect(cache.set(key, value)).rejects.toEqual(new Error(message));
    await expect(cache.get(key, () => Promise.resolve(fallback))).rejects.toEqual(
      new Error(message)
    );
  });
  it('creates a namespace within local storage', async () => {
    const cache = createBrowserLocalStorageCache({
      version,
    });
    const key = { foo: 'bar' };
    const value = 'foo';
    expect(localStorage.getItem(`algoliasearch-client-js-${version}`)).toBeNull();

    await cache.set(key, value);

    expect(localStorage.getItem(`algoliasearch-client-js-${version}`)).toBe(
      '{"{\\"foo\\":\\"bar\\"}":"foo"}'
    );
  });
});
