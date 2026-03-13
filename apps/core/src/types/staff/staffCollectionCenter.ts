import { BinaryFlag, MainLab } from "@repo/db/generated/prisma/client";

export interface StaffCollectionCenterDTO {
  id: number;
  staffId: number;
  collectionCenterId: number;
  isMainLab: MainLab;
  addedOn: Date;
  modifiedOn: Date;
  isActive: BinaryFlag;
}

export interface CreateOrUpdateStaffCollectionCenter {
  staffId: number;
  collectionCenterId: number;
  isMainLab: MainLab;
  isActive: BinaryFlag;
}
