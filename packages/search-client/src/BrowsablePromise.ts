import { BrowseOptions } from './types/BrowseOptions';
import { BrowseResponse } from './types/BrowseResponse';

export class BrowsablePromise<TObject> extends Promise<TObject> {
  public static from<TObject>(
    options: {
      readonly shouldStop: (response: BrowseResponse<TObject>) => boolean;
      readonly request: (data: {
        readonly page: number;
      }) => Readonly<Promise<BrowseResponse<TObject>>>;
    } & BrowseOptions<TObject>
  ): BrowsablePromise<TObject> {
    return new BrowsablePromise<TObject>(resolve => {
      const data = { page: 0 };

      const browse = (): Promise<void> => {
        return options.request(data).then(response => {
          if (options.batch !== undefined) {
            options.batch(response.hits);
          }

          if (options.shouldStop(response)) {
            return resolve();
          }

          // eslint-disable-next-line functional/immutable-data
          data.page++;

          return browse();
        });
      };

      return browse();
    });
  }
}
