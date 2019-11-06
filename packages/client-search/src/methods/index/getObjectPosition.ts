import { SearchIndex, SearchResponse } from '../..';

export const getObjectPosition = <TSearchIndex extends SearchIndex>(
  base: TSearchIndex
): TSearchIndex & HasGetObjectPosition => {
  return {
    ...base,
    getObjectPosition(searchResponse: SearchResponse, objectID: string): number {
      // eslint-disable-next-line functional/no-loop-statement
      for (const [position, hit] of Object.entries(searchResponse.hits)) {
        if (hit.objectID === objectID) {
          return parseInt(position, 10);
        }
      }

      return -1;
    },
  };
};

export type HasGetObjectPosition = {
  readonly getObjectPosition: (
    searchResponse: SearchResponse,
    objectID: string
  ) => Readonly<number>;
};
