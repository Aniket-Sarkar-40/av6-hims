import { uinServiceFactory } from "@/config/core.config.js";
import {
  ConsumptionCreateInput,
  ConsumptionDetailsCreateInput,
  ConsumptionResponse,
} from "@/types/consumption/consumption.js";
import { db } from "@repo/db/client";
import {
  Consumption,
  Consumption_Status,
  InvOperation,
  InvUinShortCode,
} from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { customOmit } from "av6-utils";
import { subItemStock } from "../stock/stock.repository.js";
export async function createConsumptionInDb(
  data: ConsumptionCreateInput
): Promise<Consumption> {
  logger.info("entering::createConsumptionInDb::repository");

  const store = requestStorage.getStore();
  const userId = store?.user?.id;
  const consumptionNo = await uinServiceFactory.generateUIN(InvUinShortCode.CN);

  const { consumptionDetails, ...consumptionData } = data;

  return await db.$transaction(
    async (tx) => {
      const approvedConsumption = await tx.consumption.create({
        data: {
          ...consumptionData,
          consumptionNo,
          createdBy: userId,
          approvedBy: userId,
          approvedAt: new Date(),
          consumptionDetails: {
            create: consumptionDetails.map((c) => {
              const omitCons = customOmit<
                ConsumptionDetailsCreateInput,
                "isExpiry" | "isBatch"
              >(c, ["isBatch", "isExpiry"]);

              return {
                ...omitCons.rest,
                batchNo: c.isBatch ? c.batchNo : null,
                expiryDate:
                  c.isExpiry && c.expiryDate ? new Date(c.expiryDate) : null,
                consumedQty: c.requestedQty ?? 0,
                createdBy: userId,
              };
            }),
          },
        },
        include: {
          consumptionDetails: {
            where: { isActive: true },
          },
        },
      });

      for (const detail of approvedConsumption.consumptionDetails) {
        await subItemStock(
          tx,
          {
            itemId: detail.itemId,
            batchNo: detail.batchNo,
            userId: approvedConsumption.requestedBy!,
            expiryDate: detail.expiryDate ?? undefined,
            quantity: detail.requestedQty,
          },
          {
            operation: InvOperation.CONSUMPTION,
            refDate: approvedConsumption.date,
            refNo: approvedConsumption.consumptionNo,
            refId: approvedConsumption.id,
            refDetailsId: detail.id,
            refApprovedBy: approvedConsumption.approvedBy,
            refApprovedAt: approvedConsumption.approvedAt,
          },
          { consumeFromAll: true }
        );
      }

      logger.info("exiting::createConsumptionInDb::repository");
      return approvedConsumption;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
}

export async function getConsumptionByIdFromDb(
  id: number
): Promise<ConsumptionResponse | null> {
  logger.info("entering::getConsumptionByIdFromDb::repository");
  return await db.consumption.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      consumptionDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
}

export async function getAllConsumptionsFromDb(): Promise<
  ConsumptionResponse[]
> {
  logger.info("entering::getAllConsumptionsFromDb::repository");
  return await db.consumption.findMany({
    where: {
      isActive: true,
    },
    include: {
      consumptionDetails: {
        where: {
          isActive: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
}

export async function getConsumptionByUserIdFromDb(
  userId: number
): Promise<ConsumptionResponse[]> {
  logger.info("entering::getConsumptionByUserIdFromDb::repository");
  const consumption = await db.consumption.findMany({
    where: {
      requestedBy: userId,
      isActive: true,
    },
    include: {
      consumptionDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  logger.info("exiting::getConsumptionByUserIdFromDb::repository");
  return consumption;
}
