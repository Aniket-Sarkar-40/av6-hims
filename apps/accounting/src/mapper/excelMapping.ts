export const mappingExport: {
  [key: string]: (record: unknown) => unknown;
} = {};

export const mappingImport: {
  [key: string]: () => {
    mapper: unknown;
    validation?: unknown;
  };
} = {};
