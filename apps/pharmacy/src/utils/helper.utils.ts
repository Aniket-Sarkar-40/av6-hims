import { PrinterSizeToCharSet } from "@/enums/settings.enums.js";

export function getValidCharSet(size: number): number {
  const sizeKey = `Size_${size}`;

  let validChar: number | undefined =
    PrinterSizeToCharSet[sizeKey as keyof typeof PrinterSizeToCharSet];
  if (validChar === undefined) {
    validChar = PrinterSizeToCharSet.default;
  }

  return validChar;
  // if (size === 58) {
  //   return PrinterSizeToCharSet.Size_58;
  // } else if (size === 80) {
  //   return PrinterSizeToCharSet.Size_80;
  // } else {
  //   return PrinterSizeToCharSet.default;
  // }
}
