import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { uinServiceFactory } from "@/config/core.config.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CopyGeneralBillPricingRepoInput,
  CreateGeneralBillPricingInput,
  GeneralBillPricingExcelRes,
  GeneralBillPricingResponse,
  UpdateGeneralBillPricingInput,
} from "@/types/master/generalBillPricing.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  GeneralBillPricing,
  Prisma,
  OpdUinShortCode,
  Opd_Batch_Type,
} from "@repo/db/generated/prisma/client";
import { createBatchJobInDb } from "../appointment/batch/batch.repository.js";

export const createGeneralBillPricingInDb = async (
  input: CreateGeneralBillPricingInput,
): Promise<GeneralBillPricingResponse[]> => {
  logger.info("entering::createGeneralBillPricingInDb::repository");
  const store = requestStorage.getStore();
  const createdBy = store?.user?.id || null;

  const { ccIds, description, generalBillItemId, price } = input;

  return db.$transaction(async (tx) => {
    return Promise.all(
      ccIds.map((singleCcId) =>
        tx.generalBillPricing.create({
          data: {
            ccId: singleCcId,
            generalBillItemId,
            description,
            price,
            createdBy,
          },
          include: {
            collectionCenter: true,
          },
        }),
      ),
    );
  });
};

export const updateGeneralBillPricingInDb = async (
  input: UpdateGeneralBillPricingInput,
): Promise<GeneralBillPricingResponse> => {
  logger.info("entering::updateGeneralBillPricingInDb::repository");
  const store = requestStorage.getStore();
  const omittedInput = customOmit<UpdateGeneralBillPricingInput, "id">(input, [
    "id",
  ]);

  return db.generalBillPricing.update({
    where: {
      id: input.id,
    },
    data: {
      ...omittedInput.rest,
      updatedBy: store?.user?.id,
    },
    include: {
      collectionCenter: true,
    },
  });
};

export const getGeneralBillPricingByIdFromDb = async (
  id: number,
): Promise<GeneralBillPricingResponse | null> => {
  logger.info("entering::getGeneralBillPricingByIdFromDb::repository");
  return db.generalBillPricing.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      collectionCenter: true,
    },
  });
};

export const checkGeneralBillPricingExists = async (
  generalBillItemId: number,
  ccId: number,
): Promise<GeneralBillPricingResponse | null> => {
  logger.info("entering::checkGeneralBillPricingExists::repository");
  return db.generalBillPricing.findFirst({
    where: {
      generalBillItemId,
      ccId,
      isActive: true,
    },
    include: {
      collectionCenter: true,
    },
  });
};

export const getGeneralBillPricingByCcIdFromDb = async (
  ccId: number,
): Promise<GeneralBillPricingExcelRes[] | null> => {
  logger.info("entering::getGeneralBillPricingByCcIdFromDb::repository");
  return db.generalBillPricing.findMany({
    where: {
      ccId,
      isActive: true,
    },
    include: {
      collectionCenter: true,
      generalBillItem: true,
    },
  });
};

export const CreateGeneralBillPricingExcelInDb = async (
  inp: Omit<Prisma.GeneralBillPricingExcelUncheckedCreateInput, "batchJobId">[],
) => {
  logger.info("entering::CreateGeneralBillPricingExcelInDb::repository");
  const batchUin = await uinServiceFactory.generateUIN(
    OpdUinShortCode.BATCH_JOB,
  );

  return db.$transaction(
    async (tx) => {
      const batch = await createBatchJobInDb(tx, {
        totalQty: inp.length,
        type: Opd_Batch_Type.GENERAL_BILL_PRICING,
        processedQty: 0,
        batchJobNo: batchUin,
      });

      const data: Prisma.GeneralBillPricingExcelUncheckedCreateInput[] =
        inp.map((doc) => ({
          ...doc,
          batchJobId: batch.id,
        }));

      await tx.generalBillPricingExcel.createMany({
        data,
      });

      return batch;
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export async function generalBillPricingBatchJob(batchJobId: number) {
  let skip = 0;
  let isDone = false;
  const store = requestStorage.getStore();
  const BATCH_SIZE = store?.settings?.batchSize || 100;

  await db.opdBatchJob.update({
    where: { id: batchJobId },
    data: { status: "IN_PROGRESS" },
  });

  while (!isDone) {
    const batch = await db.generalBillPricingExcel.findMany({
      skip,
      take: BATCH_SIZE,
      where: { batchJobId },
    });

    if (batch.length === 0) {
      isDone = true;
      break;
    }

    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];
      const rowNo = skip + i + 1;

      try {
        await db.$transaction(
          async (tx) => {
            const existing = await tx.generalBillPricing.findFirst({
              where: {
                ccId: item.ccId,
                generalBillItemId: item.generalBillItemId,
                isActive: true,
              },
            });

            let changed: GeneralBillPricing;

            if (existing) {
              changed = await tx.generalBillPricing.update({
                where: { id: existing.id },
                data: {
                  price: item.price,
                  description: item.description,
                  updatedBy: store?.user?.id,
                },
              });
            } else {
              changed = await tx.generalBillPricing.create({
                data: {
                  ccId: item.ccId,
                  generalBillItemId: item.generalBillItemId,
                  price: item.price,
                  description: item.description,
                  isActive: true,
                  createdBy: store?.user?.id,
                },
              });
            }

            await tx.batchJobDetails.create({
              data: {
                batchId: batchJobId,
                refId: changed.id,
                refNo: String(item.generalBillItemId),
                rowTitle: item.generalBillItemName,
                status: "SUCCESS",
                rowNo,
              },
            });

            await tx.opdBatchJob.update({
              where: { id: batchJobId },
              data: {
                processedQty: { increment: 1 },
                successCount: { increment: 1 },
                status: "IN_PROGRESS",
              },
            });
          },
          {
            timeout: API_TIMEOUT,
          },
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Unknown error";

        await db.batchJobDetails.create({
          data: {
            batchId: batchJobId,
            rowTitle: item.generalBillItemName,
            refNo: String(item.generalBillItemId),
            status: "FAILED",
            rowNo,
            errorMsg: `${item.generalBillItemName} ---> ` + errorMessage,
          },
        });

        await db.opdBatchJob.update({
          where: { id: batchJobId },
          data: {
            processedQty: { increment: 1 },
            failureCount: { increment: 1 },
          },
        });
      }
    }

    skip += BATCH_SIZE;
  }

  const batchInfo = await db.opdBatchJob.findUnique({
    where: { id: batchJobId },
  });

  await db.generalBillPricingExcel.deleteMany({
    where: { batchJobId },
  });

  if (batchInfo && batchInfo.totalQty === batchInfo.processedQty) {
    await db.opdBatchJob.update({
      where: { id: batchJobId },
      data: {
        status: "COMPLETED",
      },
    });
  }
}

export const copyGeneralBillPricingInDb = async (
  input: CopyGeneralBillPricingRepoInput,
) => {
  logger.info("entering::copyGeneralBillPricingInDb::repository");

  const { fromItems, toItems, toId } = input;

  const store = requestStorage.getStore();

  const toItemMap = new Map<number, number>(
    toItems.map((item) => [item.generalBillItemId, item.id]),
  );

  const itemsToInsert: Prisma.GeneralBillPricingUncheckedCreateInput[] = [];
  const itemsToUpdate: {
    id: number;
    data: Prisma.GeneralBillPricingUncheckedUpdateInput;
  }[] = [];

  fromItems.forEach((row) => {
    const existingId = toItemMap.get(row.generalBillItemId);

    if (existingId) {
      itemsToUpdate.push({
        id: existingId,
        data: {
          price: row.price,
          description: row.description,
          updatedBy: store?.user?.id,
        },
      });
    } else {
      itemsToInsert.push({
        ccId: toId,
        generalBillItemId: row.generalBillItemId,
        price: row.price,
        description: row.description,
        isActive: true,
        createdBy: store?.user?.id,
      });
    }
  });

  await db.$transaction(async (tx) => {
    if (itemsToInsert.length > 0) {
      await tx.generalBillPricing.createMany({
        data: itemsToInsert,
        skipDuplicates: false,
      });
    }

    for (const item of itemsToUpdate) {
      await tx.generalBillPricing.update({
        where: { id: item.id },
        data: item.data,
      });
    }
  });

  logger.info("exiting::copyGeneralBillPricingInDb::repository");
};

export const searchGeneralBillPricingByCcIdFromDb = async (
  ccId: number,
  searchText?: string,
): Promise<GeneralBillPricing[]> => {
  logger.info("entering::searchGeneralBillPricingByCcIdFromDb::repository");

  return db.generalBillPricing.findMany({
    where: {
      ccId,
      isActive: true,
      ...(searchText?.trim() && {
        generalBillItem: {
          name: { contains: searchText.trim() },
        },
      }),
    },
  });
};
