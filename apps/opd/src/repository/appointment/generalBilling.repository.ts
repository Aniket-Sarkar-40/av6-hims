import { uinServiceFactory } from "@/config/core.config.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  GeneralBillingCreateInput,
  GeneralBillingDetailsInput,
  GeneralBillingResponse,
  GeneralBillingReturnInput,
  GeneralBillingUpdateInput,
  GeneralBillingWithDetailsResponse,
} from "@/types/appointment/generalBilling.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { OpdUinShortCode } from "@repo/db/generated/prisma/client";

export const createGeneralBillingInDb = async (
  input: GeneralBillingCreateInput,
): Promise<GeneralBillingResponse> => {
  logger.info("entering::createGeneralBillingInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const billNo = await uinServiceFactory.generateUIN(OpdUinShortCode.INV);

  const omittedInput = customOmit<
    GeneralBillingCreateInput,
    "generalBillingDetails"
  >(input, ["generalBillingDetails"]);

  return await db.$transaction(async (tx) => {
    const createdResponse = await tx.generalBilling.create({
      data: {
        ...omittedInput.rest,
        billNumber: billNo,
        createdBy: currentUser,
        generalBillingDetails: {
          create: omittedInput.omitted.generalBillingDetails.map((d) => ({
            ...d,
            createdBy: currentUser,
          })),
        },
      },
      include: {
        generalBillingDetails: {
          where: {
            isActive: true,
            isRefunded: false,
          },
        },
        collectionCenter: true,
        patient: true,
      },
    });

    return createdResponse;
  });
};

export const updateGeneralBillingInDb = async (
  input: GeneralBillingUpdateInput,
): Promise<GeneralBillingResponse> => {
  logger.info("entering::updateGeneralBillingInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedInput = customOmit<
    GeneralBillingUpdateInput,
    "id" | "generalBillingDetails" | "existing"
  >(input, ["id", "generalBillingDetails", "existing"]);

  const { id, generalBillingDetails, existing } = omittedInput.omitted;

  const toUpdate = generalBillingDetails.filter(
    (d) => typeof d.id === "number",
  );
  const toCreate = generalBillingDetails.filter(
    (d) => typeof d.id !== "number",
  );
  const toDelete = existing.generalBillingDetails.filter(
    (d) => !generalBillingDetails.some((item) => item.id === d.id),
  );

  return await db.$transaction(async (tx) => {
    const updatedResponse = await tx.generalBilling.update({
      where: {
        id,
      },
      data: {
        ...omittedInput.rest,
        updatedBy: currentUser,
        generalBillingDetails: {
          create: toCreate.map((d) => {
            return {
              ...d,
              createdBy: currentUser,
            };
          }),
          update: toUpdate.map((d) => {
            const omittedInput = customOmit<GeneralBillingDetailsInput, "id">(
              d,
              ["id"],
            );
            return {
              where: {
                id: d.id,
              },
              data: {
                ...omittedInput.rest,
                updatedBy: currentUser,
              },
            };
          }),
          updateMany: {
            where: {
              id: {
                in: toDelete.map((d) => d.id),
              },
            },
            data: {
              isActive: false,
              deletedBy: currentUser,
              deletedAt: new Date(),
            },
          },
        },
      },
      include: {
        generalBillingDetails: {
          where: {
            isActive: true,
            isRefunded: false,
          },
        },
        collectionCenter: true,
        patient: true,
      },
    });

    return updatedResponse;
  });
};

export const getGeneralBillingByIdFromDb = async (
  id: number,
): Promise<GeneralBillingResponse | null> => {
  logger.info("entering::getGeneralBillingByIdFromDb::repository");
  return await db.generalBilling.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      generalBillingDetails: {
        where: {
          isActive: true,
          isRefunded: false,
        },
      },
      collectionCenter: true,
      patient: true,
    },
  });
};
export const getGeneralBillingWithDetailsByIdFromDb = async (
  id: number,
): Promise<GeneralBillingWithDetailsResponse | null> => {
  logger.info("entering::getGeneralBillingWithDetailsByIdFromDb::repository");
  return await db.generalBilling.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      generalBillingDetails: {
        where: {
          isActive: true,
        },
        include: {
          generalBillItem: true,
        },
      },
      collectionCenter: true,
      patient: true,
    },
  });
};

export const getGeneralBillingDetailsByIdFromDb = async (id: number) => {
  logger.info("entering::getGeneralBillingDetailsByIdFromDb::repository");
  return await db.generalBillingDetails.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};

export const deleteGeneralBillingFromDb = async (id: number): Promise<void> => {
  logger.info(`entering::deleteGeneralBillingFromDb::repository`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id ?? null;

  await db.$transaction(async (tx) => {
    await tx.generalBilling.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: currentUser,
      },
    });

    await tx.generalBillingDetails.updateMany({
      where: { generalBillingId: id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: currentUser,
      },
    });
  });

  logger.info(`exiting::deleteGeneralBillingFromDb::repository`);
};

export const returnGeneralBillingInDb = async (
  input: GeneralBillingReturnInput,
): Promise<GeneralBillingResponse> => {
  logger.info("entering::returnGeneralBillingInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const { id, detailId, existing } = input;
  const omittedInput = customOmit<
    GeneralBillingResponse,
    "generalBillingDetails" | "patient" | "collectionCenter"
  >(existing, ["generalBillingDetails", "patient", "collectionCenter"]);
  return await db.$transaction(async (tx) => {
    const updatedResponse = await tx.generalBilling.update({
      where: {
        id,
      },
      data: {
        ...omittedInput.rest,
        updatedBy: currentUser,
        generalBillingDetails: {
          update: detailId.map((id) => {
            return {
              where: {
                id,
              },
              data: {
                isRefunded: true,
                updatedBy: currentUser,
              },
            };
          }),
        },
      },
      include: {
        generalBillingDetails: {
          where: {
            isActive: true,
            isRefunded: false,
          },
        },
        collectionCenter: true,
        patient: true,
      },
    });

    return updatedResponse;
  });
};
