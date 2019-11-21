import { MethodEnum } from '@algolia/requester-common';
import { mapRequestOptions, RequestOptions } from '@algolia/transporter';

import { AssignUserIDResponse, SearchClient } from '../..';

export const assignUserID = (base: SearchClient) => {
  return (
    userID: string,
    clusterName: string,
    requestOptions?: RequestOptions
  ): Readonly<Promise<AssignUserIDResponse>> => {
    const options = mapRequestOptions(requestOptions);

    // eslint-disable-next-line functional/immutable-data
    options.headers['X-Algolia-User-ID'] = userID;

    return base.transporter.write(
      {
        method: MethodEnum.Post,
        path: '1/clusters/mapping',
        data: {
          cluster: clusterName,
        },
      },
      options
    );
  };
};
