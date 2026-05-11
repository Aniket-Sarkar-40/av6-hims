import { requestStorage } from "@/config/requestContext.js";
import { db } from "@repo/db";
import { logger } from "@repo/platform/logging/logger.js";

export const deleteGroupFromDb = async (id: number) => {
  logger.info("entering::deleteGroupFromDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.group.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
    },
  });
};
