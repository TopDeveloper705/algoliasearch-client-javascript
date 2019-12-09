import { Cache, CacheEvents } from '@algolia/cache-common';

export function createInMemoryCache(): Cache {
  /* eslint-disable functional/immutable-data, functional/no-let, functional/prefer-readonly-type */
  let cache: { [key: string]: any } = {};

  return {
    get<TValue>(
      key: object,
      defaultValue: () => Readonly<Promise<TValue>>,
      events: CacheEvents<TValue> = {
        miss: () => Promise.resolve(),
      }
    ): Readonly<Promise<TValue>> {
      const keyAsString = JSON.stringify(key);

      if (keyAsString in cache) {
        return Promise.resolve(JSON.parse(cache[keyAsString]));
      }

      const promise = defaultValue();
      const miss = (events && events.miss) || (() => Promise.resolve());

      return promise.then((value: TValue) => miss(value)).then(() => promise);
    },

    set<TValue>(key: object, value: TValue): Readonly<Promise<TValue>> {
      cache[JSON.stringify(key)] = JSON.stringify(value);

      return Promise.resolve(value);
    },

    delete(key: object): Readonly<Promise<void>> {
      delete cache[JSON.stringify(key)];

      return Promise.resolve();
    },

    clear(): Readonly<Promise<void>> {
      cache = {};

      return Promise.resolve();
    },
  };
}
