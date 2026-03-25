import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreateOrUpdateTaxDetails } from "@/types/master/taxDetails.js";
import { customOmit } from "av6-utils";

import { logger } from "@repo/platform/logging/logger.js";
import { TaxDetails } from "@repo/db/generated/prisma/client";

export const getTaxDetailsByIdFromDb = async (
  id: number,
): Promise<TaxDetails | null> => {
  logger.info("entering::getTaxDetailsByIdFromDb::repository");
  return db.taxDetails.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllTaxDetailsFromDb = async (): Promise<TaxDetails[]> => {
  logger.info("entering::getAllTaxDetailsFromDb::repository");
  return db.taxDetails.findMany({
    where: { isActive: true },
  });
};

export const getTaxDetailsByNameFromDb = async (
  name: string,
): Promise<TaxDetails | null> => {
  logger.info("entering::getTaxDetailsByNameFromDb::repository");
  return db.taxDetails.findFirst({ where: { name, isActive: true } });
};

export const createTaxDetailsInDb = async (
  taxDetails: CreateOrUpdateTaxDetails,
) => {
  logger.info("entering::createTaxDetailsInDb::repository");
  const store = requestStorage.getStore();
  const taxDetailsOmit = customOmit<CreateOrUpdateTaxDetails, "id">(
    taxDetails,
    ["id"],
  );
  return db.taxDetails.create({
    data: {
      ...taxDetailsOmit.rest,
      createdBy: store?.user?.id,
    },
  });
};

export const updateTaxDetailsInDb = async (
  taxDetails: CreateOrUpdateTaxDetails,
) => {
  logger.info("entering::updateTaxDetailsInDb::repository");
  const store = requestStorage.getStore();
  const taxDetailsOmit = customOmit<CreateOrUpdateTaxDetails, "id">(
    taxDetails,
    ["id"],
  );
  return db.taxDetails.update({
    where: { id: taxDetails.id, isActive: true },
    data: { ...taxDetailsOmit.rest, updatedBy: store?.user?.id },
  });
};
