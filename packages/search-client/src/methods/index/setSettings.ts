import { Method } from '@algolia/requester-types';
import { ConstructorOf, WaitablePromise } from '@algolia/support';
import { RequestOptions } from '@algolia/transporter-types';

import { SearchIndex } from '../../SearchIndex';
import { IndexSettings } from '../types/IndexSettings';
import { SetSettingsResponse } from '../types/SetSettingsResponse';
import { waitTask } from './waitTask';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const setSettings = <TSearchIndex extends ConstructorOf<SearchIndex>>(
  base: TSearchIndex
) => {
  const mixin = waitTask(base);

  return class extends mixin implements HasSetSettings {
    public setSettings(
      settings: IndexSettings,
      requestOptions?: RequestOptions
    ): Readonly<WaitablePromise<SetSettingsResponse>> {
      return WaitablePromise.from<SetSettingsResponse>(
        this.transporter.write(
          {
            method: Method.Put,
            path: `1/indexes/${this.indexName}/settings`,
            data: settings,
          },
          requestOptions
        )
      ).onWait(response => this.waitTask(response.taskID));
    }
  };
};

export type HasSetSettings = SearchIndex & {
  readonly setSettings: (
    settings: IndexSettings,
    requestOptions?: RequestOptions
  ) => Readonly<WaitablePromise<SetSettingsResponse>>;
};
