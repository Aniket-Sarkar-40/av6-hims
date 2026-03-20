import { ICDTenDropdownDTO } from "@/types/master/icdTen.js";
import { ICDTen } from "@repo/db/generated/prisma/client";

export const toICDTenDropdownDTO = (icdTen: ICDTen): ICDTenDropdownDTO => {
  return {
    id: icdTen.id,
    value: icdTen.icdName,
    icdSpecificCode: icdTen.icdSpecificCode,
  };
};
