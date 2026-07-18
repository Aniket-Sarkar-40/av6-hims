import { db } from "@repo/db";
import { InvItemSupplier } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

export async function getInventorySupplierByIdFromDb(
  itemSupplierId: number,
): Promise<InvItemSupplier | null> {
  logger.info("entering::getInventorySupplierByIdFromDb::repository");

  const itemSupplier = await db.invItemSupplier.findFirst({
    where: {
      id: itemSupplierId,
      isActive: true,
    },
  });
  logger.info("exiting::getInventorySupplierByIdFromDb::repository");
  return itemSupplier;
}
