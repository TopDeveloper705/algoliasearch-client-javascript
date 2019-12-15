import { addMethods, encode } from '@algolia/client-common';
import { TestSuite } from '@algolia/client-common/src/__tests__/TestSuite';
import { MethodEnum } from '@algolia/requester-common';
import { createMappedRequestOptions, RequestOptions, Transporter } from '@algolia/transporter';
import { anything, deepEqual, spy, verify, when } from 'ts-mockito';

import { BatchActionEnum, SaveObjectsOptions } from '../..';
import { createFaker } from '../../../../client-common/src/__tests__/createFaker';
import { chunk } from '../../methods';

const algoliasearch = new TestSuite().algoliasearch;
let index: any;
let transporterMock: Transporter;

const res: any = {
  objectIDs: ['1'],
  taskID: 1,
};

beforeEach(() => {
  index = addMethods(algoliasearch('appId', 'apiKey').initIndex('foo'), {
    chunk,
  });

  transporterMock = spy(index.transporter);

  when(transporterMock.read(anything(), anything())).thenResolve({
    status: 'published',
    hits: [
      {
        objectID: 1,
        name: 'foo',
      },
    ],
  });
});

describe('save objects', () => {
  it('save object proxies down to save objects', async () => {
    const obj = createFaker().object();
    const requestOptions = {
      autoGenerateObjectIDIfNotExist: true,
      timeout: 1,
    };

    const request = {
      method: MethodEnum.Post,
      path: '1/indexes/foo/batch',
      data: { requests: [{ action: 'addObject', body: obj }] },
    };

    when(transporterMock.write(deepEqual(request), deepEqual({ timeout: 1 }))).thenResolve(res);

    await index.saveObject(obj, requestOptions);

    verify(transporterMock.write(deepEqual(request), deepEqual({ timeout: 1 }))).once();
  });

  it('uses addObject when `autoGenerateObjectIDIfNotExist` is true', async () => {
    const objects = [createFaker().object()];
    const requestOptions: RequestOptions & SaveObjectsOptions = {
      autoGenerateObjectIDIfNotExist: true,
    };

    const request = {
      method: MethodEnum.Post,
      path: '1/indexes/foo/batch',
      data: { requests: [{ action: 'addObject', body: objects[0] }] },
    };

    when(transporterMock.write(deepEqual(request), deepEqual({}))).thenResolve(res);

    await index.saveObjects(objects, requestOptions);

    verify(transporterMock.write(deepEqual(request), deepEqual({}))).once();
  });

  it('uses updateObject when `autoGenerateObjectIDIfNotExist` is not set', async () => {
    const objects = [createFaker().object('myObjectID')];

    const request = {
      method: MethodEnum.Post,
      path: '1/indexes/foo/batch',
      data: { requests: [{ action: 'updateObject', body: objects[0] }] },
    };

    when(transporterMock.write(deepEqual(request), deepEqual({}))).thenResolve(res);

    await expect(index.saveObjects(objects)).resolves.toMatchObject([
      {
        objectIDs: ['1'],
        taskID: 1,
      },
    ]);
    verify(transporterMock.write(deepEqual(request), deepEqual({}))).once();
  });

  it('validates the object id when `autoGenerateObjectIDIfNotExist` is !== true', async () => {
    const objects = [{ noObjectId: true }];

    await expect(index.saveObjects(objects)).rejects.toMatchObject({
      message:
        'All objects must have an unique objectID ' +
        '(like a primary key) to be valid. ' +
        'Algolia is also able to generate objectIDs ' +
        "automatically but *it's not recommended*. " +
        'To do it, use `saveObjects(objects, ' +
        "{'autoGenerateObjectIDIfNotExist': true})`.",
    });

    verify(transporterMock.write(anything(), anything())).never();
  });
});

describe('chunk', () => {
  it("Don't call batch when no objects", async () => {
    await index.chunk([], BatchActionEnum.AddObject);
    await index.chunk([], BatchActionEnum.UpdateObject);

    verify(transporterMock.write(anything(), anything())).never();
  });

  it('call batch when there is objects with default batch size', async () => {
    when(transporterMock.write(anything(), anything())).thenResolve();

    await index.chunk([createFaker().object()], BatchActionEnum.AddObject);
    await index.chunk(createFaker().objects(1001), BatchActionEnum.UpdateObject);

    verify(transporterMock.write(anything(), anything())).times(3);
  });

  it('call batch when there is objects with a given batch size', async () => {
    when(transporterMock.write(anything(), anything())).thenResolve();

    await index.chunk([createFaker().object()], BatchActionEnum.AddObject);
    await index.chunk(createFaker().objects(1001), BatchActionEnum.UpdateObject, {
      batchSize: 100,
    });

    verify(transporterMock.write(anything(), anything())).times(12);
  });

  it('Does not perform one extra call when size of objects is the same as batch size', async () => {
    when(transporterMock.write(anything(), anything())).thenResolve();

    await index.chunk(createFaker().objects(1000), BatchActionEnum.UpdateObject);

    verify(transporterMock.write(anything(), anything())).once();
  });
});

describe('get object', () => {
  it('Passes request options to transporter', async () => {
    const requestOptions = {
      timeout: 2,
    };

    await index.getObject('bar', requestOptions);

    verify(
      transporterMock.read(anything(), deepEqual(createMappedRequestOptions(requestOptions)))
    ).once();
  });
});

describe('get settings', () => {
  it('Passes getVersion=2 queryParameters', async () => {
    const requestOptions = {
      data: {},
      timeout: undefined,
      headers: {},
      queryParameters: { getVersion: '2' },
      cacheable: undefined,
    };

    await index.getSettings();
    await index.getSettings({});

    verify(transporterMock.read(anything(), deepEqual(requestOptions))).twice();
  });

  it('Passes getVersion=2 queryParameters and custom request options', async () => {
    const requestOptions = {
      data: {},
      timeout: undefined,
      headers: {},
      queryParameters: { foo: 'bar', getVersion: '2' },
      cacheable: undefined,
    };

    await index.getSettings({
      queryParameters: {
        foo: 'bar',
      },
    });

    verify(transporterMock.read(anything(), deepEqual(requestOptions))).once();
  });
});

describe('get objects', () => {
  it('Passes request options to transporter', async () => {
    const requestOptions = {
      timeout: 2,
    };

    await index.getObjects(['bar'], requestOptions);

    verify(transporterMock.read(anything(), deepEqual(requestOptions))).once();
  });

  it('Allows to pass `attributesToRetrieve`', async () => {
    const requestOptions = {
      attributesToRetrieve: ['name'],
      timeout: 2,
    };

    await index.getObjects(['bar'], requestOptions);

    verify(
      transporterMock.read(
        deepEqual({
          method: MethodEnum.Post,
          path: `1/indexes/*/objects`,
          data: {
            requests: [
              {
                indexName: 'foo',
                objectID: 'bar',
                attributesToRetrieve: ['name'],
              },
            ],
          },
        }),
        deepEqual({ timeout: 2 })
      )
    ).once();
  });
});

describe('find object', () => {
  it('passes request options to search', async () => {
    const requestOptions = {
      timeout: 10,
      page: 0,
    };

    await index.findObject(() => true, requestOptions);

    verify(transporterMock.read(anything(), deepEqual(requestOptions))).once();
  });
});

describe('exists', () => {
  it('passes request options to getSettings', async () => {
    const requestOptions = {
      data: {},
      timeout: 10,
      headers: {},
      queryParameters: { getVersion: '2' },
      cacheable: undefined,
    };

    await index.exists(requestOptions);

    verify(transporterMock.read(anything(), deepEqual(requestOptions))).once();
  });
});

describe('wait task', () => {
  it('passes request options to get task', async () => {
    const requestOptions = {
      data: {},
      timeout: 10,
      headers: {},
      queryParameters: {},
      cacheable: undefined,
    };

    await index.waitTask(1, requestOptions);

    verify(
      transporterMock.read(
        deepEqual({
          method: MethodEnum.Get,
          path: encode('1/indexes/%s/task/%s', 'foo', '1'),
        }),
        deepEqual(requestOptions)
      )
    ).once();
  });
});
