import { CreateOrUpdateBloodCollection } from "@/types/bloodCollection/bloodCollection.js";
import { db } from "@repo/db/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";

export const upsertBloodCollectionInDb = async (
  payload: CreateOrUpdateBloodCollection,
): Promise<void> => {
  logger.info("entering::upsertBloodCollectionInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.$transaction(async (tx) => {
    const {
      id,
      bloodBankCenterId,
      donorId,
      externalCenterId,
      receivedAt,
      receivedByStaffId,
      collectionNo,
      sourceType,
      collectionDate,
      status,
      donationType,
      externalDocumentNo,
      externalReferenceNo,
      physicalExamId,
      remark,
      collectionItems,
    } = payload;

    let collectionId = id;

    if (collectionId) {
      await tx.bloodCollection.update({
        where: { id: collectionId },
        data: {
          bloodBankCenterId,
          donorId,
          externalCenterId,
          collectionNo,
          sourceType,
          collectionDate,
          receivedAt,
          receivedByStaffId,
          status,
          donationType,
          externalDocumentNo,
          externalReferenceNo,
          physicalExamId,
          remark,
          isActive: true,
          deletedBy: null,
          deletedAt: null,
          updatedBy: currentUser,
        },
      });
    } else {
      const createdBloodCollection = await tx.bloodCollection.create({
        data: {
          bloodBankCenterId,
          donorId,
          externalCenterId,
          collectionNo,
          sourceType,
          collectionDate,
          receivedAt,
          receivedByStaffId,
          status,
          donationType,
          externalDocumentNo,
          externalReferenceNo,
          physicalExamId,
          remark,
          isActive: true,
          createdBy: currentUser,
        },
      });
      collectionId = createdBloodCollection.id;
    }

    const collectionItemIds = collectionItems.flatMap((item) =>
      item.id === undefined ? [] : [item.id],
    );
    const existingCollectionItems = await tx.bloodCollectionItem.findMany({
      where: { collectionId, bloodBankCenterId, isActive: true },
      select: { id: true },
    });
    const existingCollectionItemIds = new Set(
      existingCollectionItems.map((item) => item.id),
    );

    await tx.bloodCollectionItem.updateMany({
      where: {
        collectionId,
        bloodBankCenterId,
        isActive: true,
        ...(collectionItemIds.length
          ? { id: { notIn: collectionItemIds } }
          : {}),
      },
      data: {
        isActive: false,
        deletedBy: currentUser,
        deletedAt: new Date(),
      },
    });

    const collectionItemsToCreate = collectionItems.filter(
      (item) =>
        item.id === undefined || !existingCollectionItemIds.has(item.id),
    );
    if (collectionItemsToCreate.length) {
      await tx.bloodCollectionItem.createMany({
        data: collectionItemsToCreate.map(({ id: _id, ...item }) => ({
          bloodBankCenterId,
          collectionId,
          ...item,
          isActive: true,
          createdBy: currentUser,
        })),
      });
    }

    const collectionItemsToUpdate = collectionItems.filter(
      (item) => item.id !== undefined && existingCollectionItemIds.has(item.id),
    );
    if (collectionItemsToUpdate.length) {
      await Promise.all(
        collectionItemsToUpdate.map(({ id: itemId, ...item }) =>
          tx.bloodCollectionItem.update({
            where: {
              id: itemId,
            },
            data: {
              ...item,
              isActive: true,
              deletedBy: null,
              deletedAt: null,
              updatedBy: currentUser,
            },
          }),
        ),
      );
    }
  });

  logger.info("exiting::upsertBloodCollectionInDb::repository");
};
