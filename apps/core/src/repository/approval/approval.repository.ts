import { db } from "@repo/db";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";

export async function getInstance(
  poId: number,
  subjectType: string,
  service: string
) {
  const instance = await db.approvalInstance.findFirst({
    where: {
      subjectType,
      subjectId: poId,
      service,
      status: {
        in: ["PENDING", "PARTIALLY_APPROVED"],
      },
      isActive: true,
    },
  });

  if (!instance) {
    throw new ErrorHandler(400, "No active approval instance found");
  }

  return instance;
}
