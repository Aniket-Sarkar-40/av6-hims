import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import {
  CreateItemSearch,
  GetItemReq,
  GetItemReqStock,
  getItems,
  ItemMasterReq,
  ItemMasterUpdateReq,
} from "@/types/master/itemMaster.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";

export const createItemMaster = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createItemMaster::controller");
    const input = req.body as ItemMasterReq;
    const itemMaster = await itemMasterService.createItemMaster(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: itemMaster },
      "Item Master"
    );
    logger.info("exiting::createItemMaster::controller");
    return res.status(201).json(response);
  }
);

export const updateItemMaster = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateItemMaster::controller");
    const input = req.body as ItemMasterUpdateReq;
    const updateItemMaster = await itemMasterService.updateItemMaster(input);
    logger.info("exiting::updateItemMaster::controller");
    const response = BaseResponse.success(
      { type: "UPDATED", data: updateItemMaster },
      "Item Master"
    );
    return res.status(200).json(response);
  }
);

export const getAllItemMaster = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllItemMaster::controller");
    const itemMaster = await itemMasterService.getAllItemMaster();
    logger.info("exiting::getAllItemMaster::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: itemMaster },
      "Item Master"
    );
    return res.status(200).json(response);
  }
);

export const getItemMasterById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getItemMasterById::controller");
    const input = req.body as GetItemReq;

    const itemMaster = await itemMasterService.getItemMasterById(input);

    if (!itemMaster) {
      const response = BaseResponse.error({
        message: generateErrorMessage("NOT_FOUND", "Item Master"),
      });
      return res.status(404).json(response);
    }
    logger.info("exiting::getItemMasterById::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: itemMaster },
      "Item Master"
    );
    return res.status(200).json(response);
  }
);

export const itemSearch = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::itemSearch::controller");
  const query = req.body as CreateItemSearch;
  const items = await itemMasterService.itemSearch(query);
  logger.info("exiting::itemSearch::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Items "),
      },
      items
    )
  );
});

export const getItemStocksByItemId = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getItemStocksByItemId::controller");
    const body = req.body as GetItemReqStock;
    const items = await itemMasterService.getItemStocks(body);
    logger.info("exiting::getItemStocksByItemId::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Item stock "),
        },
        items
      )
    );
  }
);
export const getBulkItemSupplierPrices = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getBulkItemSupplierPrices::controller");
    const body = req.body as getItems;
    const data = await itemMasterService.getItemSupplierPricesForSupplier(body);
    logger.info("exiting::getBulkItemSupplierPrices::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data },
      "Item Supplier Prices"
    );
    return res.status(200).json(response);
  }
);

export const ActiveItem = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::ActiveItem::controller");
  const { id } = req.query;
  await itemMasterService.toggleItemActiveService(Number(id));
  logger.info("exiting::ActiveItem::controller");
  return res.status(200).json(
    BaseResponse.success(
      {
        type: "UPDATED",
      },
      "Item Updated"
    )
  );
});

export const itemExcelSampleExport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelStoreReqReport::controller");

    const wb: Workbook = await itemMasterService.itemExcelSampleExport();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="sample_item.xlsx"'
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
  }
);

export const importItemMasterExcel = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::importItemMasterExcel::controller");
    if (!req.file) {
      return res
        .status(400)
        .json(BaseResponse.error({ message: "No file uploaded" }));
    }
    await itemMasterService.itemMasterImportExcel(req.file.path);

    deleteFileIfExists(req.file.path);
    const response = BaseResponse.success(
      { type: "STARTED" },
      "Item Master Import"
    );
    logger.info("exiting::importItemMasterExcel::controller");
    return res.status(200).json(response);
  }
);

export const itemExcelExport = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::itemExcelExport::controller");

  const wb: Workbook = await itemMasterService.itemExcelExport();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", 'attachment; filename="item.xlsx"');

  await wb.xlsx.write(res); // streams the Excel file
  res.end();
});
