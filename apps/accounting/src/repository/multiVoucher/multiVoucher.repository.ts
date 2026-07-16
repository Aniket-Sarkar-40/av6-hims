import { requestStorage } from "@/config/requestContext.js";
import {
  CreateOrUpdateMultiVoucherInput,
  MultiVoucherResponseForDTO,
} from "@/types/multiVoucher/multiVoucher.js";
import { CreateOrUpdateVoucherInput } from "@/types/voucher/voucher.js";
import { customOmit } from "av6-utils";
import {
  createVoucherFromMultiVoucherInDb,
  updateVoucherFromPostedMultiVoucherInDb,
} from "../voucher/voucher.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import { db } from "@repo/db/client";

export const createMultiVoucherInDb = async (params: {
  input: CreateOrUpdateMultiVoucherInput;
  voucherInput: CreateOrUpdateVoucherInput[];
}) => {
  logger.info("entering::createMultiVoucherInDb::repository");
  const { input, voucherInput } = params;
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedData = customOmit<
    CreateOrUpdateMultiVoucherInput,
    "id" | "multiVoucherDetails" | "existing"
  >(input, ["id", "multiVoucherDetails", "existing"]);

  return await db.$transaction(async (tx) => {
    const createdMultiVoucher = await tx.multiVoucher.create({
      data: {
        ...omittedData.rest,
        createdBy: currentUser,
        approvedBy:
          input.status === MultiVoucherStatus.POSTED ? currentUser : null,
        approvedAt:
          input.status === MultiVoucherStatus.POSTED ? new Date() : null,
        multiVoucherDetails: {
          createMany: {
            data: input.multiVoucherDetails.map((detail) => ({
              ...customOmit(detail, ["id"]).rest,
              createdBy: currentUser,
            })),
          },
        },
      },
      include: {
        multiVoucherDetails: {
          where: {
            isActive: true,
          },
        },
      },
    });

    // voucher entry
    if (input.status === MultiVoucherStatus.POSTED) {
      for (const voucher of voucherInput) {
        const createdVoucher = await createVoucherFromMultiVoucherInDb(
          tx,
          voucher
        );

        await tx.multiVoucherDetails.update({
          where: {
            id: createdMultiVoucher.multiVoucherDetails.find(
              (detail) => detail.lineNo === voucher.lineNo
            )?.id,
          },
          data: {
            voucherId: createdVoucher.id,
            updatedBy: currentUser,
          },
        });
      }
    }
  });
};

export const updateMultiVoucherInDb = async (params: {
  input: CreateOrUpdateMultiVoucherInput;
  voucherInput: CreateOrUpdateVoucherInput[];
}) => {
  logger.info("entering::updateMultiVoucherInDb::repository");
  const { input, voucherInput } = params;
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedData = customOmit<
    CreateOrUpdateMultiVoucherInput,
    "id" | "multiVoucherDetails" | "existing"
  >(input, ["id", "multiVoucherDetails", "existing"]);

  const multiVoucherDetailsToCreate = input.multiVoucherDetails.filter(
    (detail) => !detail.id
  );
  const multiVoucherDetailsToUpdate = input.multiVoucherDetails.filter(
    (detail) => detail.id
  );
  const multiVoucherDetailsToDelete = input.existing.multiVoucherDetails
    .filter(
      (detail) => !input.multiVoucherDetails.some((d) => d.id === detail.id)
    )
    .map((detail) => detail.id);

  return await db.$transaction(async (tx) => {
    const updatedMultiVoucher = await tx.multiVoucher.update({
      where: { id: input.id },
      data: {
        ...omittedData.rest,
        updatedBy: currentUser,
        approvedBy:
          input.status === MultiVoucherStatus.POSTED ? currentUser : null,
        approvedAt:
          input.status === MultiVoucherStatus.POSTED ? new Date() : null,
        multiVoucherDetails: {
          createMany: {
            data: multiVoucherDetailsToCreate.map((detail) => ({
              ...customOmit(detail, ["id"]).rest,
              createdBy: currentUser,
            })),
          },
          update: multiVoucherDetailsToUpdate.map((detail) => ({
            where: { id: detail.id },
            data: {
              ...customOmit(detail, ["id"]).rest,
              updatedBy: currentUser,
            },
          })),
          updateMany: multiVoucherDetailsToDelete.map((id) => ({
            where: { id },
            data: {
              isActive: false,
              deletedBy: currentUser,
              deletedAt: new Date(),
            },
          })),
        },
      },
      include: {
        multiVoucherDetails: {
          where: {
            isActive: true,
          },
        },
      },
    });

    // voucher entry
    if (input.status === MultiVoucherStatus.POSTED) {
      for (const voucher of voucherInput) {
        const createdVoucher = await createVoucherFromMultiVoucherInDb(
          tx,
          voucher
        );
        await tx.multiVoucherDetails.update({
          where: {
            id: updatedMultiVoucher.multiVoucherDetails.find(
              (detail) => detail.lineNo === voucher.lineNo
            )?.id,
          },
          data: {
            voucherId: createdVoucher.id,
            updatedBy: currentUser,
          },
        });
      }
    }
  });
};

export const deleteMultiVoucherByIdFromDb = async (id: number) => {
  logger.info("entering::deleteMultiVoucherByIdFromDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.multiVoucher.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
      multiVoucherDetails: {
        updateMany: {
          where: { isActive: true },
          data: {
            isActive: false,
            deletedBy: currentUser,
            deletedAt: new Date(),
          },
        },
      },
    },
  });
};

export const updatePostedMultiVoucherInDb = async (params: {
  input: CreateOrUpdateMultiVoucherInput;
  voucherInput: CreateOrUpdateVoucherInput[];
}) => {
  logger.info("entering::updatePostedMultiVoucherInDb::repository");
  const { input, voucherInput } = params;
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedData = customOmit<
    CreateOrUpdateMultiVoucherInput,
    "id" | "multiVoucherDetails" | "existing"
  >(input, ["id", "multiVoucherDetails", "existing"]);

  const multiVoucherDetailsToCreate = input.multiVoucherDetails.filter(
    (detail) => !detail.id
  );
  const multiVoucherDetailsToUpdate = input.multiVoucherDetails.filter(
    (detail) => detail.id
  );
  const multiVoucherDetailsToDeleteData =
    input.existing.multiVoucherDetails.filter(
      (detail) => !input.multiVoucherDetails.some((d) => d.id === detail.id)
    );
  const multiVoucherDetailsToDelete = multiVoucherDetailsToDeleteData.map(
    (detail) => detail.id
  );

  return await db.$transaction(async (tx) => {
    await tx.multiVoucher.update({
      where: { id: input.id },
      data: {
        ...omittedData.rest,
        updatedBy: currentUser,
        approvedBy:
          input.status === MultiVoucherStatus.POSTED ? currentUser : null,
        approvedAt:
          input.status === MultiVoucherStatus.POSTED ? new Date() : null,
        multiVoucherDetails: {
          createMany: {
            data: multiVoucherDetailsToCreate.map((detail) => ({
              ...customOmit(detail, ["id"]).rest,
              createdBy: currentUser,
            })),
          },
          update: multiVoucherDetailsToUpdate.map((detail) => ({
            where: { id: detail.id },
            data: {
              ...customOmit(detail, ["id"]).rest,
              updatedBy: currentUser,
            },
          })),
          updateMany: multiVoucherDetailsToDelete.map((id) => ({
            where: { id },
            data: {
              isActive: false,
              deletedBy: currentUser,
              deletedAt: new Date(),
            },
          })),
        },
      },
      include: {
        multiVoucherDetails: {
          where: {
            isActive: true,
          },
        },
      },
    });

    // voucher entry

    for (const voucher of voucherInput) {
      await updateVoucherFromPostedMultiVoucherInDb(tx, voucher);
    }
  });
};

export const getMultiVoucherDataForInvoice = async (
  multiVoucherId: number
): Promise<MultiVoucherResponseForDTO | null> => {
  logger.info("entering::getMultiVoucherDataForInvoice::repository");
  const data = await db.multiVoucher.findUnique({
    where: { id: multiVoucherId },
    include: {
      company: true,
      financialYear: true,
      multiVoucherDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  return data;
};
