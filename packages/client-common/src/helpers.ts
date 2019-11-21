// eslint-disable-next-line functional/prefer-readonly-type
export function shuffle<TData>(array: TData[]): TData[] {
  let c = array.length - 1; // eslint-disable-line functional/no-let

  // eslint-disable-next-line functional/no-loop-statement
  for (c; c > 0; c--) {
    const b = Math.floor(Math.random() * (c + 1));
    const a = array[c];
    array[c] = array[b]; // eslint-disable-line functional/immutable-data, no-param-reassign
    array[b] = a; // eslint-disable-line functional/immutable-data, no-param-reassign
  }

  return array;
}

type GenericObject = { readonly [key: string]: any };

export function addMethods<
  TBase,
  TMethods extends GenericObject,
  TKey extends keyof TMethods,
  TValue extends TMethods[TKey]
>(
  base: TBase,
  methods?: TMethods
  // eslint-disable-next-line @typescript-eslint/generic-type-naming
): TBase & { [key in TKey extends string ? TKey : never]: ReturnType<TValue> } {
  Object.keys(methods !== undefined ? methods : {}).forEach(key => {
    // @ts-ignore
    // eslint-disable-next-line functional/immutable-data, no-param-reassign
    base[key] = methods[key](base);
  });

  // @ts-ignore
  return base;
}

export function encode(format: string, ...args: readonly any[]): string {
  // eslint-disable-next-line functional/no-let
  let i = 0;

  return format.replace(/%s/g, () => encodeURIComponent(args[i++]));
}
