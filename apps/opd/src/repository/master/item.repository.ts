import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";

export const getItemByIdFromDb = async (
  id: number,
): Promise<{ id: number }> => {
  logger.info("entering::getItemByIdFromDb::repository");

  const rows = await db.$queryRaw<{ id: number }[]>`
    SELECT 
      i.id
    FROM pms_item AS i
    WHERE 
      i.id = ${id}
      AND i.is_active = 1
    LIMIT 1;
  `;

  logger.info("exiting::getItemByIdFromDb::repository");

  return rows[0];
};
