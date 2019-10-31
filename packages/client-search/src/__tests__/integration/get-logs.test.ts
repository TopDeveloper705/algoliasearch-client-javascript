import { TestSuite } from '@algolia/client-common/__tests__/TestSuite';

const testSuite = new TestSuite('get_logs');

afterAll(() => testSuite.cleanUp());

test(testSuite.testName, async () => {
  const client = testSuite.makeSearchClient();

  const indices = await client.listIndices();
  expect(indices.nbPages).toBeGreaterThan(0);
  await client.listIndices();

  const getLogsResponse = await client.getLogs({
    length: 2,
    offset: 0,
    type: 'all',
  });

  await expect(getLogsResponse.logs).toHaveLength(2);
});
