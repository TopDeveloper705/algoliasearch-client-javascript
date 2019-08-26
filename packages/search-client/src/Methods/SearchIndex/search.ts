import { RequestOptions } from '@algolia/transporter-types';
import { SearchIndex } from '../../SearchIndex';
import { Method } from '@algolia/requester-types';
import { ConstructorOf } from '../../helpers';
import { SearchOptions } from '../Types/SearchOptions';
import { SearchResponse } from '../Types/SearchResponse';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const search = <TSearchIndex extends ConstructorOf<SearchIndex>>(base: TSearchIndex) => {
  return class extends base implements HasSearch {
    public search<THit>(
      query: string,
      requestOptions?: RequestOptions & SearchOptions
    ): Promise<SearchResponse<THit>> {
      return this.transporter.read(
        {
          method: Method.Post,
          path: `1/indexes/${this.indexName}/query`,
          data: {
            query,
          },
        },
        requestOptions
      );
    }
  };
};

export type HasSearch = SearchIndex & {
  readonly search: <THit>(
    query: string,
    requestOptions?: RequestOptions & SearchOptions
  ) => Promise<SearchResponse<THit>>;
};
