import { addMethod, createWaitablePromise, WaitablePromise } from '@algolia/client-common';
import { MethodEnum } from '@algolia/requester-common';
import { RequestOptions } from '@algolia/transporter';

import { HasWaitTask, waitTask } from '..';
import { BatchRequest, MultipleBatchResponse, SearchClient } from '../..';
import { initIndex } from '.';

export const multipleBatch = <TClient extends SearchClient>(
  base: TClient
): TClient & HasMultipleBatch => {
  return {
    ...base,
    multipleBatch(
      requests: readonly BatchRequest[],
      requestOptions?: RequestOptions
    ): Readonly<WaitablePromise<MultipleBatchResponse>> {
      return createWaitablePromise<MultipleBatchResponse>(
        base.transporter.write(
          {
            method: MethodEnum.Post,
            path: '1/indexes/*/batch',
            data: {
              requests,
            },
          },
          requestOptions
        )
      ).onWait((response, waitRequestOptions) =>
        Promise.all(
          Object.keys(response.taskID).map(indexName => {
            return addMethod(base, initIndex)
              .initIndex<HasWaitTask>(indexName, {
                methods: [waitTask],
              })
              .waitTask(response.taskID[indexName], waitRequestOptions);
          })
        )
      );
    },
  };
};

export type HasMultipleBatch = {
  readonly multipleBatch: (
    requests: readonly BatchRequest[],
    requestOptions?: RequestOptions
  ) => Readonly<WaitablePromise<MultipleBatchResponse>>;
};
