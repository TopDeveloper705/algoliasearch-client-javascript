/* eslint sonarjs/cognitive-complexity: 0 */ // --> OFF

import { createBrowserLocalStorageCache } from '@algolia/cache-browser-local-storage/createBrowserLocalStorageCache';
import { createNullCache } from '@algolia/cache-common/createNullCache';
import { createInMemoryCache } from '@algolia/cache-in-memory/createInMemoryCache';
import { Requester } from '@algolia/requester-common';
import { anything, spy, verify, when } from 'ts-mockito';

import { createFakeRequester, createFixtures } from '../Fixtures';

const transporterRequest = createFixtures().transporterRequest();
transporterRequest.cacheable = true;

const drivers = [createNullCache, createInMemoryCache];

// @ts-ignore
// eslint-disable-next-line no-undef
if (testing.isBrowser()) {
  drivers.push(createBrowserLocalStorageCache);
}

describe('request cache integration with cache drivers', () => {
  beforeEach(async () => {
    // @ts-ignore
    // eslint-disable-next-line no-undef
    if (testing.isBrowser()) {
      await createBrowserLocalStorageCache().clear();
    }
  });

  const expectedCalls = {
    'in-progress': {
      [createNullCache.name]: 13,
      [createInMemoryCache.name]: 4,
      [createBrowserLocalStorageCache.name]: 4,
    },
    resolved: {
      [createNullCache.name]: 10,
      [createInMemoryCache.name]: 10,
      [createBrowserLocalStorageCache.name]: 10,
    },
  };

  it('cache read requests in progress', async () => {
    let requester: Requester;

    for (let index = 0; index < drivers.length; index++) {
      when((requester = spy(createFakeRequester())).send(anything())).thenResolve({
        content: JSON.stringify({ hits: [] }),
        status: 200,
        isTimedOut: false,
      });

      const driver = drivers[index]();

      const transporter = createFixtures().transporter(requester, { requestsCache: driver });

      const responses = [];
      for (let callNumber = 1; callNumber <= 10; callNumber++) {
        transporterRequest.data = {};
        responses.push(transporter.read(transporterRequest));
      }

      for (let callNumber = 1; callNumber <= 3; callNumber++) {
        transporterRequest.data = { callNumber };
        responses.push(transporter.read(transporterRequest));
      }

      for (let responsesNumber = 0; responsesNumber < responses.length; responsesNumber++) {
        await responses[responsesNumber];
      }

      verify(requester.send(anything())).times(expectedCalls['in-progress'][drivers[index].name]);
    }
  });

  it('do not cache read requests resolved', async () => {
    let requester: Requester;

    for (let index = 0; index < drivers.length; index++) {
      when((requester = spy(createFakeRequester())).send(anything())).thenResolve({
        content: JSON.stringify({ hits: [] }),
        status: 200,
        isTimedOut: false,
      });

      const driver = drivers[index]();

      const transporter = createFixtures().transporter(requester, { requestsCache: driver });

      for (let callNumber = 1; callNumber <= 10; callNumber++) {
        await expect(transporter.read(transporterRequest)).resolves.toMatchObject({ hits: [] });
      }

      verify(requester.send(anything())).times(expectedCalls.resolved[drivers[index].name]);
    }
  });
});
