import { ICDTen } from "@repo/db/generated/prisma/client";

export type ICDTenDTO = Omit<ICDTen, "consultationICDTenList">;

export type ICDTenDropdownDTO = {
  id: number;
  value: string;
  icdSpecificCode: string;
};
