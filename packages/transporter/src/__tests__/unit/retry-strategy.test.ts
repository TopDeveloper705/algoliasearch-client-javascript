import { Requester } from '@algolia/requester-common';
import { anything, deepEqual, spy, verify, when } from 'ts-mockito';

import { createApiError, Transporter } from '../..';
import { getAvailableHosts } from '../../concerns/getAvailableHosts';
import { createUnavailableStatefullHost } from '../../createStatefullHost';
import { createFakeRequester, createFixtures } from '../fixtures';

let requesterMock: Requester;
let transporter: Transporter;

const transporterRequest = createFixtures().transporterRequest();

const defaultHost = () => Promise.resolve(undefined);

describe('retry strategy', () => {
  beforeEach(() => {
    const requester = createFakeRequester();
    requesterMock = spy(requester);
    transporter = createFixtures().transporter(requester);

    when(requesterMock.send(anything())).thenResolve({
      content: '{"hits": [{"name": "Star Wars"}]}',
      status: 200,
      isTimedOut: false,
    });
  });

  it('retries after a timeout', async () => {
    when(requesterMock.send(deepEqual(createFixtures().writeRequest()))).thenResolve({
      content: '',
      status: 0,
      isTimedOut: true,
    });

    await transporter.write(transporterRequest, {});

    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[1], defaultHost)
    ).resolves.toBeUndefined();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[0], defaultHost)
    ).resolves.toBeUndefined();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[2], defaultHost)
    ).resolves.toBeUndefined();

    verify(requesterMock.send(anything())).twice();
  });

  it('retries after a network error', async () => {
    when(requesterMock.send(deepEqual(createFixtures().readRequest()))).thenResolve({
      content: '',
      status: 0,
      isTimedOut: false,
    });

    await transporter.read(transporterRequest, {});

    verify(requesterMock.send(anything())).twice();

    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[1], defaultHost)
    ).resolves.toBeUndefined();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[0], defaultHost)
    ).resolves.toBeTruthy();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[2], defaultHost)
    ).resolves.toBeUndefined();
  });

  it('retries after a 1xx', async () => {
    when(requesterMock.send(deepEqual(createFixtures().readRequest()))).thenResolve({
      content: '',
      status: 101,
      isTimedOut: false,
    });

    await transporter.read(transporterRequest);

    verify(requesterMock.send(anything())).twice();

    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[1], defaultHost)
    ).resolves.toBeUndefined();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[0], defaultHost)
    ).resolves.toBeTruthy();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[2], defaultHost)
    ).resolves.toBeUndefined();
  });

  it('do not retry after a 2xx', async () => {
    type SearchResponse = {
      readonly hits: ReadonlyArray<{ readonly name: string }>;
    };

    const response = await transporter.read<SearchResponse>(transporterRequest, {});

    expect(response.hits[0].name).toBe('Star Wars');
    verify(requesterMock.send(anything())).once();

    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[1], defaultHost)
    ).resolves.toBeUndefined();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[0], defaultHost)
    ).resolves.toBeUndefined();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[2], defaultHost)
    ).resolves.toBeUndefined();
  });

  it('retries after a 3xx', async () => {
    when(requesterMock.send(deepEqual(createFixtures().readRequest()))).thenResolve({
      content: '',
      status: 300,
      isTimedOut: false,
    });

    await transporter.read(transporterRequest);

    verify(requesterMock.send(anything())).twice();

    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[1], defaultHost)
    ).resolves.toBeUndefined();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[0], defaultHost)
    ).resolves.toBeTruthy();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[2], defaultHost)
    ).resolves.toBeUndefined();
  });

  it('do not retry after a 4xx', async () => {
    when(requesterMock.send(deepEqual(createFixtures().writeRequest()))).thenResolve({
      content: JSON.stringify({
        message: 'Invalid Application ID',
        status: 404,
      }),
      status: 404,
      isTimedOut: false,
    });

    await expect(transporter.write(transporterRequest)).rejects.toEqual(
      createApiError('Invalid Application ID', 404)
    );

    verify(requesterMock.send(anything())).once();

    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[1], defaultHost)
    ).resolves.toBeUndefined();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[0], defaultHost)
    ).resolves.toBeUndefined();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[2], defaultHost)
    ).resolves.toBeUndefined();
  });

  it('retries after a 5xx', async () => {
    when(requesterMock.send(deepEqual(createFixtures().writeRequest()))).thenResolve({
      content: '',
      status: 500,
      isTimedOut: false,
    });

    await transporter.write(transporterRequest, {});

    verify(requesterMock.send(anything())).twice();

    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[1], defaultHost)
    ).resolves.toBeTruthy();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[0], defaultHost)
    ).resolves.toBeUndefined();
    await expect(
      transporter.hostsCache.get<any>(transporter.hosts[2], defaultHost)
    ).resolves.toBeUndefined();
  });

  it('takes cache in consideration', async () => {
    when(requesterMock.send(deepEqual(createFixtures().writeRequest()))).thenResolve({
      content: '',
      status: 500,
      isTimedOut: false,
    });

    await transporter.write(transporterRequest, {});

    verify(requesterMock.send(anything())).twice();

    await transporter.write(transporterRequest, {});

    verify(requesterMock.send(anything())).times(3); // +1
  });

  it('respects TTL', async () => {
    // Set one host down.
    await transporter.hostsCache.set(transporter.hosts[0], {
      ...createUnavailableStatefullHost(transporter.hosts[0]),
      downDate: Date.now() - 300 * 1000 + 10,
    });

    expect(await getAvailableHosts(transporter.hostsCache, transporter.hosts)).toHaveLength(2);

    await transporter.hostsCache.set(transporter.hosts[0], {
      protocol: 'https',
      url: 'read.com',
      downDate: Date.now() - 300 * 1000 - 20,
    });
    await expect(
      getAvailableHosts(transporter.hostsCache, transporter.hosts)
    ).resolves.toHaveLength(3);
  });

  it('respests hosts order', async () => {
    // Default
    expect((await getAvailableHosts(transporter.hostsCache, transporter.hosts))[0]).toEqual(
      transporter.hosts[0]
    );

    // Remove one host
    await transporter.hostsCache.set(
      transporter.hosts[0],
      createUnavailableStatefullHost(transporter.hosts[0])
    );
    expect((await getAvailableHosts(transporter.hostsCache, transporter.hosts))[0]).toEqual(
      transporter.hosts[1]
    );
    await expect(
      getAvailableHosts(transporter.hostsCache, transporter.hosts)
    ).resolves.toHaveLength(2);

    // Remove all down
    await transporter.hostsCache.set(
      transporter.hosts[1],
      createUnavailableStatefullHost(transporter.hosts[1])
    );
    await transporter.hostsCache.set(
      transporter.hosts[2],
      createUnavailableStatefullHost(transporter.hosts[2])
    );
    expect((await getAvailableHosts(transporter.hostsCache, transporter.hosts))[0]).toEqual(
      transporter.hosts[0]
    );
    await expect(
      getAvailableHosts(transporter.hostsCache, transporter.hosts)
    ).resolves.toHaveLength(3);
  });

  it('gives all hosts when all are down', async () => {
    await transporter.hostsCache.set(
      transporter.hosts[0],
      createUnavailableStatefullHost(transporter.hosts[0])
    );
    await transporter.hostsCache.set(
      transporter.hosts[1],
      createUnavailableStatefullHost(transporter.hosts[1])
    );
    await transporter.hostsCache.set(
      transporter.hosts[2],
      createUnavailableStatefullHost(transporter.hosts[2])
    );
    await expect(
      getAvailableHosts(transporter.hostsCache, transporter.hosts)
    ).resolves.toHaveLength(3);

    await transporter.hostsCache.set(
      transporter.hosts[0],
      createUnavailableStatefullHost(transporter.hosts[0])
    );

    await transporter.hostsCache.set(transporter.hosts[0], {
      ...createUnavailableStatefullHost(transporter.hosts[0]),
      downDate: Date.now() - 60 * 5 * 1000 - 20,
    });

    await expect(
      getAvailableHosts(transporter.hostsCache, transporter.hosts)
    ).resolves.toHaveLength(1);
  });
});
