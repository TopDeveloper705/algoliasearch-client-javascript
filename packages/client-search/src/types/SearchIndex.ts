import { TransporterAware } from '@algolia/transporter/src/types/TransporterAware';

export type SearchIndex = {
  readonly indexName: string;
} & TransporterAware;
