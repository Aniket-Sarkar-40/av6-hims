import {
  getItemBatchStockByBatchFromDb,
  itemStock,
  itemStockSummary,
} from "@/repository/stock/stock.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ExcelJs from "exceljs";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { validateIdItemMaster } from "@/validations/service/master/itemMaster.service.validation.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";
import { getAllCache } from "@repo/platform/cache/redis.utils.js";
import {
  toAvailableItemBatchStockDTOList,
  toItemBatchStockCacheDTOList,
} from "@/mapper/stock/itemBatchStock.mapper.js";
import {
  ItemBatchStockCacheDTO,
  ItemBatchStockDTO,
  ItemBatchStockLookupInput,
  ItemStockExcelExportFilter,
  ItemStockPaginatedDTO,
  ItemStockSearchFilter,
} from "@/types/stock/stock.js";
import {
  toItemStockDtoPaginated,
  toItemStockExcelRows,
} from "@/mapper/stock/stock.mapper.js";
import { validateItemStockSearch } from "@/validations/service/stock/itemStock.service.validation.js";

export const cacheKeyForItemBatchStock = getRedisKey("ITEM", "Batch");
const ITEM_STOCK_EXCEL_PAGE_SIZE = 1_000_000;

export const itemStockService = {
  async getAllItemBatchStock(
    input: ItemBatchStockLookupInput,
    canNullReturnable: boolean = false
  ): Promise<ItemBatchStockDTO[]> {
    logger.info("entering::getAllItemBatchStock::service");
    await validateIdItemMaster(input.itemId);

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_BATCH_STOCK);
    let itemBatchStock: ItemBatchStockCacheDTO[];
    if (isCacheable) {
      itemBatchStock = (await getAllCache(
        cacheKeyForItemBatchStock
      )) as ItemBatchStockCacheDTO[];
    } else {
      const stocks = await getItemBatchStockByBatchFromDb(input);
      itemBatchStock = await toItemBatchStockCacheDTOList(stocks);
    }

    const itemBatchStockDTO = toAvailableItemBatchStockDTOList(
      itemBatchStock,
      input
    );

    if (itemBatchStockDTO.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Batch Stock")
        );
      else return [];
    }

    logger.info("exiting::getAllItemBatchStock::service");
    return itemBatchStockDTO;
  },

  async getAllItemStockSummary(ccId: number) {
    logger.info("entering::getAllItemStock::service");
    validIdCheck(ccId);

    const stocks = await itemStockSummary(ccId);

    logger.info("exiting::getAllItemStock::service");
    return stocks;
  },
  async getAllItemStock(
    input: ItemStockSearchFilter
  ): Promise<ItemStockPaginatedDTO> {
    logger.info("entering::getAllItemStock::service");

    const pageNo = input.pageNo ?? 1;
    const pageSize = input.pageSize ?? 10;

    await validateItemStockSearch({ ...input, pageNo, pageSize });

    const repoResult = await itemStock({ ...input, pageNo, pageSize });
    const result = await toItemStockDtoPaginated(repoResult);

    logger.info("exiting::getAllItemStock::service");
    return result;
  },

  async itemStockExcelExport(
    input: ItemStockExcelExportFilter
  ): Promise<ExcelJs.Workbook> {
    logger.info("entering::itemStockExcelExport::service");

    const firstPage = await this.getAllItemStock({
      ...input,
      pageNo: 1,
      pageSize: 1,
    });

    if (!firstPage.totalRecords) {
      throw new ErrorHandler(404, generateErrorMessage("EXCEL"));
    }

    const { data: stocks } = await this.getAllItemStock({
      ...input,
      pageNo: 1,
      pageSize: firstPage.totalRecords,
    });

    if (!stocks.length) {
      throw new ErrorHandler(404, generateErrorMessage("EXCEL"));
    }

    const excelRows = toItemStockExcelRows(stocks);

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Item Stock");

    ws.properties.defaultRowHeight = 18;
    ws.views = [{ state: "frozen", ySplit: 1 }];

    ws.columns = [
      { header: "S.No", key: "sNo", width: 8 },
      { header: "Stock Id", key: "stockId", width: 12 },
      { header: "Item Name", key: "itemName", width: 30 },
      { header: "Item Code", key: "itemCode", width: 18 },
      { header: "Description", key: "itemDescription", width: 35 },
      { header: "Base Price", key: "basePrice", width: 14 },
      { header: "Purchase Price", key: "purchasePrice", width: 16 },
      { header: "Category", key: "categoryName", width: 22 },
      { header: "Unit", key: "unitName", width: 16 },
      { header: "Unit Size", key: "unitSize", width: 12 },
      { header: "Location", key: "locationName", width: 22 },
      { header: "Location Type", key: "locationType", width: 14 },
      { header: "User Id", key: "userId", width: 12 },
      { header: "Batch No", key: "batchNo", width: 18 },
      { header: "Expiry Date", key: "expiryDate", width: 14 },
      { header: "FOC", key: "isFoc", width: 8 },
      { header: "Batch Qty", key: "batchQty", width: 12 },
      { header: "In Hand Qty", key: "stockInHandQty", width: 14 },
      { header: "Normal Qty", key: "stockNormalQty", width: 14 },
      { header: "FOC Qty", key: "stockFocQty", width: 12 },

      { header: "SR Req Qty", key: "storeReqQty", width: 14 },
      { header: "SR Assigned Qty", key: "storeAssignedQty", width: 16 },
      { header: "SR Ack Qty", key: "storeAcknowledgedQty", width: 14 },
      {
        header: "SR Pending Qty(RQ-AQ)",
        key: "storePendingAssignQty",
        width: 22,
      },
      { header: "SR Ack Pending Qty", key: "storePendingAckQty", width: 20 },

      {
        header: "SR Return Req Qty",
        key: "storeReturnRequestedQty",
        width: 18,
      },
      {
        header: "SR Return Approved Qty",
        key: "storeReturnApprovedQty",
        width: 22,
      },
      {
        header: "SR Return Ack Pending Qty",
        key: "storeReturnAckPendingQty",
        width: 24,
      },

      { header: "BR Req Qty", key: "branchReqQty", width: 14 },
      { header: "BR Assigned Qty", key: "branchAssignedQty", width: 16 },
      { header: "BR Ack Qty", key: "branchAcknowledgedQty", width: 14 },
      {
        header: "BR Pending Qty(RQ-AQ)",
        key: "branchPendingAssignQty",
        width: 22,
      },
      { header: "BR Ack Pending Qty", key: "branchPendingAckQty", width: 20 },

      {
        header: "BR Return Req Qty",
        key: "branchReturnRequestedQty",
        width: 18,
      },
      {
        header: "BR Return Approved Qty",
        key: "branchReturnApprovedQty",
        width: 22,
      },
      {
        header: "BR Return Ack Pending Qty",
        key: "branchReturnAckPendingQty",
        width: 24,
      },

      { header: "GRN Ordered Qty", key: "grnOrderedQty", width: 18 },
      { header: "GRN Received Qty", key: "grnReceivedQty", width: 18 },
      { header: "GRN Returned Qty", key: "grnDetailReturnQty", width: 18 },
      { header: "GRN Return Req Qty", key: "grnReturnRequestedQty", width: 20 },
      {
        header: "GRN Return Approved Qty",
        key: "grnReturnApprovedQty",
        width: 24,
      },

      { header: "Cons Req Qty", key: "consumptionRequestedQty", width: 16 },
      { header: "Consumed Qty", key: "consumedQty", width: 16 },

      { header: "PO Ordered Qty", key: "poOrderedQty", width: 18 },
      { header: "PO Received Qty", key: "poReceivedQty", width: 18 },
      { header: "PO Pending Qty", key: "poPendingQty", width: 18 },
    ];

    excelRows.forEach((row) => ws.addRow(row));

    ws.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
    });

    ws.columns.forEach((col) => {
      let max = col.header?.toString().length || 10;

      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > max) max = len;
      });

      col.width = Math.min(max + 2, 35);
    });

    logger.info("exiting::itemStockExcelExport::service");

    return wb;
  },
};
