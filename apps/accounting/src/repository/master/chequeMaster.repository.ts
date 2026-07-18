import { requestStorage } from "@/config/requestContext.js";
import { db } from "@repo/db/client";
import { Status } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";

export const toggleStatusChequeMasterByIdFromDb = async (
  id: number,
  status: Status
) => {
  logger.info("entering::toggleStatusChequeMasterByIdFromDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.chequeMaster.update({
    where: { id },
    data: { status, updatedBy: currentUser, updatedAt: new Date() },
  });
};

export const checkChequeNumberIsUsed = async (
  chequeMasterId: number,
  chequeNo: number
) => {
  logger.info("entering::checkChequeNumberIsUsed::repository");
  return await db.usedChequeNumber.findFirst({
    where: {
      chequeMasterId,
      chequeNo,
      isActive: true,
      isUsed: true,
    },
  });
};
