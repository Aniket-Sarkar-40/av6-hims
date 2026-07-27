import { Service } from "@/types/global.js";
import { CORE_SHORT_CODE_TO_FILE_ATTR } from "./core.shortCode.utils.js";
import { PHARMACY_SHORT_CODE_TO_FILE_ATTR } from "./pharmacy.shortCode.utils.js";
// import { OPD_SHORT_CODE_TO_FILE_ATTR } from "./opd.shortCode.utils.js";
// import { INVENTORY_SHORT_CODE_TO_FILE_ATTR } from "./inventory.shortCode.utils.js";

export const getFileAttrFromShortCode = (
  service: Service,
  shortCode: string,
): string => {
  if (service === "CORE") {
    return (
      CORE_SHORT_CODE_TO_FILE_ATTR[
        shortCode as keyof typeof CORE_SHORT_CODE_TO_FILE_ATTR
      ] ?? "image"
    );
  } else if (service === "PHARMACY") {
    return (
      PHARMACY_SHORT_CODE_TO_FILE_ATTR[
        shortCode as keyof typeof PHARMACY_SHORT_CODE_TO_FILE_ATTR
      ] ?? "image"
    );
  }
  // else if (service === "OPD") {
  //     return OPD_SHORT_CODE_TO_FILE_ATTR[shortCode as keyof typeof OPD_SHORT_CODE_TO_FILE_ATTR] ?? "image";
  // } else if (service === "INVENTORY") {
  //     return INVENTORY_SHORT_CODE_TO_FILE_ATTR[shortCode as keyof typeof INVENTORY_SHORT_CODE_TO_FILE_ATTR] ?? "image";
  // }

  return "image";
};
