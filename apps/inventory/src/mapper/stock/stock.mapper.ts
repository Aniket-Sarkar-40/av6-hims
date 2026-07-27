import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";
import { InvItemStock } from "@repo/db/generated/prisma/client";
import {
  ItemStockBatchDetail,
  ItemStockDTO,
  ItemStockExcelRow,
  ItemStockPaginatedDTO,
  ItemStockPaginatedRes,
  ItemStockReportRawRow,
  ItemStockReportRow,
} from "@/types/stock/stock.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { itemMasterToDto } from "@/utils/commonResponse.utils.js";

export const toStockDTO = async (
  data: InvItemStock[],
): Promise<ItemStockDTO[]> => {
  const items = await itemMasterService.getAllItemMaster(true);

  return Promise.all(
    data.map(async (stock) => {
      const omittedStock = customOmit<
        InvItemStock,
        BaseModelAttrWoCancel | "ccId" | "userId" | "itemId"
      >(stock, [
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "ccId",
        "userId",
        "itemId",
      ]);
      const user = stock.userId
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(stock.userId, true)
        : null;
      const item = items.find((item) => item.id === stock.itemId) ?? null;
      return {
        ...omittedStock.rest,
        item: item ? await itemMasterToDto(item) : null,
        user: toIdValue(user, "name"),
      };
    }),
  );
};

const parseBatchDetails = (value: unknown): ItemStockBatchDetail[] => {
  if (!value) return [];
  const rows =
    typeof value === "string"
      ? (JSON.parse(value) as ItemStockBatchDetail[])
      : (value as ItemStockBatchDetail[]);
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    stockId: Number(row.stockId),
    batchNo: row.batchNo ?? null,
    expiryDate: row.expiryDate ?? null,
    isFoc: Boolean(row.isFoc),
    quantity: Number(row.quantity ?? 0),
  }));
};

export const toItemStockReportRow = (
  row: ItemStockReportRawRow,
): ItemStockReportRow => {
  const { rest } = customOmit(row, ["batchDetailsJson", "totalRecords"]);
  return {
    ...rest,
    batchDetails: parseBatchDetails(row.batchDetailsJson),
  };
};

export const toItemStockDtoPaginated = async (
  repoResult: ItemStockPaginatedRes,
): Promise<ItemStockPaginatedDTO> => {
  const { rows, totalRecords, currentPageNumber, lastPageNumber, pageSize } =
    repoResult;

  return {
    totalRecords,
    currentPageNumber,
    lastPageNumber,
    pageSize,
    data: rows.map(toItemStockReportRow),
  };
};

const itemStockExcelOmitKeys = [
  "batchDetails",
  "batchNoList",
  "expiryDateList",
  "stockIdList",
  "stockRowCount",
  "nearestExpiryDate",
] as const;

export const toItemStockExcelRows = (
  stocks: ItemStockReportRow[],
): ItemStockExcelRow[] => {
  const rows: ItemStockExcelRow[] = [];
  let sNo = 0;

  for (const stock of stocks) {
    const { rest: item } = customOmit(stock, [...itemStockExcelOmitKeys]);
    const batches = stock.batchDetails?.length ? stock.batchDetails : [null];

    for (const batch of batches) {
      sNo += 1;
      rows.push({
        ...item,
        sNo,
        stockId: batch?.stockId ?? null,
        batchNo: batch?.batchNo ?? "",
        expiryDate: batch?.expiryDate ?? "",
        isFoc: batch ? (batch.isFoc ? "Yes" : "No") : "",
        batchQty: batch?.quantity ?? 0,
      });
    }
  }

  return rows;
};
