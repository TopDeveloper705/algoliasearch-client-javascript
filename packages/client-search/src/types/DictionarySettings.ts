import { DictionaryName } from './DictionaryName';
import { RequireAtLeastOne } from './RequireAtLeastOne';

export type DictionarySettings = {
  /**
   * Disable the builtin Algolia entries for a type of dictionary per language.
   */
  readonly disableStandardEntries: RequireAtLeastOne<
    Record<DictionaryName, Record<string, boolean>>
  >;
};
