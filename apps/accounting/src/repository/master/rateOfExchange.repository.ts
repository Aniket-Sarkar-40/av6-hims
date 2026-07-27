import { requestStorage } from "@/config/requestContext.js";
import { CreateRateOfExchangeInput } from "@/types/master/rateOfExchange.js";
import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";

export const createRateOfExchangeInDb = async (
  input: CreateRateOfExchangeInput,
) => {
  logger.info("entering::createRateOfExchangeInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const createdRateOfExchange = await db.rateOfExchange.create({
    data: {
      ...input,
      date: new Date(input.date),
      createdBy: currentUser,
      updatedBy: currentUser,
    },
  });
  logger.info("exiting::createRateOfExchangeInDb::repository");
  return createdRateOfExchange;
};
