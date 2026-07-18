import { InvSettings } from "@repo/db/generated/prisma/client";

let schemaPrecisionSettings: InvSettings | null | undefined;

export type SchemaPrecisionModule = "default" | "item" | "po" | "grn";

export const getSchemaPrecision = (
  module: SchemaPrecisionModule = "default",
  defaultPrecision: number = 2,
): number => {
  const settings = schemaPrecisionSettings;
  switch (module) {
    case "item":
      return (
        settings?.itemPrecision ??
        settings?.defaultPrecision ??
        defaultPrecision
      );
    case "po":
      return (
        settings?.poPrecision ?? settings?.defaultPrecision ?? defaultPrecision
      );
    case "grn":
      return (
        settings?.grnPrecision ?? settings?.defaultPrecision ?? defaultPrecision
      );
    default:
      return settings?.defaultPrecision ?? defaultPrecision;
  }
};

export const setSchemaPrecisionSettings = (
  settings: InvSettings | null | undefined,
) => {
  schemaPrecisionSettings = settings;
};
