import { encode } from '@algolia/client-common';
import { MethodEnum } from '@algolia/requester-common';
import { RequestOptions } from '@algolia/transporter';

import { SearchIndex, SearchOptions, SearchResponse } from '../..';

export const search = <TSearchIndex extends SearchIndex>(
  base: TSearchIndex
): TSearchIndex & HasSearch => {
  return {
    ...base,
    search<TObject>(
      query: string,
      requestOptions?: RequestOptions & SearchOptions
    ): Readonly<Promise<SearchResponse<TObject>>> {
      return base.transporter.read(
        {
          method: MethodEnum.Post,
          path: encode('1/indexes/%s/query', base.indexName),
          data: {
            query,
          },
          cacheable: true,
        },
        requestOptions
      );
    },
  };
};

export type HasSearch = {
  readonly search: <TObject>(
    query: string,
    requestOptions?: RequestOptions & SearchOptions
  ) => Readonly<Promise<SearchResponse<TObject>>>;
};
