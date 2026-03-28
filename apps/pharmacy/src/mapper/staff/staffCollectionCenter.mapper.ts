import { StaffCollectionCenterDTO } from "@/types/staff/staffCollectionCenter.js";

import { StaffCollectionCenter } from "@repo/db/generated/prisma/client";
import dayjs from "dayjs";

export const toStaffCollectionCenterDTO = async (
  staffCollectionCenter: StaffCollectionCenter,
): Promise<StaffCollectionCenterDTO> => {
  return {
    id: staffCollectionCenter.id,
    staffId: staffCollectionCenter.staffId,
    collectionCenterId: staffCollectionCenter.collectionCenterId,
    isMainLab: staffCollectionCenter.isMainLab,
    addedOn: dayjs(staffCollectionCenter.addedOn).toDate(),
    modifiedOn: dayjs(staffCollectionCenter.modifiedOn).toDate(),
    isActive: staffCollectionCenter.isActive,
  };
};
