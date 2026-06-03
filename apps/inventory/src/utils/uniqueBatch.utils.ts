import { getExistingBatchItemConflictsFromDb } from "@/repository/grn/grn.repository.js";
import { CreateGrnInput } from "@/types/grn/grn.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

const normalizeBatchNo = (batchNo?: string | null): string | null => {
  const value = batchNo?.trim();
  return value ? value.toUpperCase() : null;
};

const throwBatchItemConflict = (
  batchNo: string,
  existingItemId: number,
  requestedItemId: number
) => {
  throw new ErrorHandler(
    400,
    generateErrorMessage(
      "INVALID_VALUE",
      `Batch No ${batchNo} is already used for Item ID ${existingItemId}. It cannot be used for Item ID ${requestedItemId}`
    )
  );
};

export const validateBatchNoBelongsToSameItem = async (
  body: CreateGrnInput
): Promise<void> => {
  logger.info(
    "entering::validateBatchNoBelongsToSameItem::service::validation"
  );

  const batchMap = new Map<string, number>();

  for (const detail of body.goodReceiveDetails) {
    const batchNo = normalizeBatchNo(detail.batchNo);
    if (!batchNo) continue;

    const existingItemId = batchMap.get(batchNo);
    if (existingItemId && existingItemId !== detail.itemId) {
      throwBatchItemConflict(batchNo, existingItemId, detail.itemId);
    }

    batchMap.set(batchNo, detail.itemId);
  }

  if (!batchMap.size) {
    logger.info(
      "exiting::validateBatchNoBelongsToSameItem::service::validation"
    );
    return;
  }

  const excludeDetailIds = body.goodReceiveDetails
    .map((d) => d.id)
    .filter((id): id is number => id != null);

  const existingBatchRows = await getExistingBatchItemConflictsFromDb(
    Array.from(batchMap.entries()).map(([batchNo, itemId]) => ({
      batchNo,
      itemId,
    })),
    excludeDetailIds
  );

  for (const row of existingBatchRows) {
    const batchNo = normalizeBatchNo(row.batchNo);
    if (!batchNo) continue;

    const requestedItemId = batchMap.get(batchNo);
    if (requestedItemId && requestedItemId !== row.itemId) {
      throwBatchItemConflict(batchNo, row.itemId, requestedItemId);
    }
  }

  logger.info("exiting::validateBatchNoBelongsToSameItem::service::validation");
};
