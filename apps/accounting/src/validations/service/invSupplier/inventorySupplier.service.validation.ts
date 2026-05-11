import { getInventorySupplierByIdFromDb } from "@/repository/invSupplier/inventorySupplier.repository.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { InvItemSupplier } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdInventorySupplier = async (
  id: number
): Promise<InvItemSupplier> => {
  logger.info("entering::validateIdInventorySupplier::service");
  validIdCheck(id);
  const inventorySupplier = await getInventorySupplierByIdFromDb(id);
  if (!inventorySupplier) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Inventory Item Supplier")
    );
  }
  logger.info("exiting::validateIdInventorySupplier::service");
  return inventorySupplier;
};
