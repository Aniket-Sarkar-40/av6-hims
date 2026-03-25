import { TryCatch } from "@repo/platform";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { itemService } from "@/services/item/item.service.js";
import {
  CreateItemInput,
  CreateItemSearch,
  GetItemReq,
  ItemFilter,
  ItemSellPricingReq,
  UpdateItemInput,
} from "@/types/item/item.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const itemCreate = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::itemCreate::controller");
  const name = req.body as CreateItemInput;
  const createItem = await itemService.createItem(name);
  logger.info("exiting::itemCreate::controller");
  return res.status(201).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Item "),
      },
      createItem,
    ),
  );
});

export const allItemGet = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::allItemGet::controller");
  const item = await itemService.getAllItem();
  logger.info("exiting::allItemGet::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Item"),
      },
      item,
    ),
  );
});

export const getItemSellPricing = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getItemSellPricing::controller");
    const input = req.body as ItemSellPricingReq;
    const items = await itemService.getItemSellPricing(input);
    logger.info("exiting::getItemSellPricing::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Items"),
        },
        items,
      ),
    );
  },
);

export const getItemById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getItemById::controller");
  const itemReq = req.body as GetItemReq;
  const item = await itemService.getItemById(itemReq);

  if (!item) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  logger.info("exiting::getItemById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Item "),
      },
      item,
    ),
  );
});

export const updateItem = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateItem::controller");
  const item = req.body as UpdateItemInput;
  const updatedItem = await itemService.updateItemService(item);
  logger.info("exiting::updateItem::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Item "),
      },
      updatedItem,
    ),
  );
});

export const deleteItem = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteItem::controller");
  const id = req.params.id;
  await itemService.deleteItemService(Number(id));
  logger.info("exiting::deleteItem::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("DELETED", "Item "),
    }),
  );
});

export const itemSearch = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::itemSearch::controller");
  const query = req.body as CreateItemSearch;
  const items = await itemService.itemSearch(query);
  logger.info("exiting::itemSearch::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Items "),
      },
      items,
    ),
  );
});

export const getItemStocksByItemId = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getItemStocksByItemId::controller");
    const query = req.body as GetItemReq;
    const items = await itemService.getItemStocks(query);
    logger.info("exiting::getItemStocksByItemId::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Item stock "),
        },
        items,
      ),
    );
  },
);

export const getSlowMovingItem = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getSlowMovingItem::controller");
    const items = await itemService.getSlowMovingItem();
    logger.info("exiting::getSlowMovingItem::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Slow Moving Item"),
        },
        items,
      ),
    );
  },
);

export const itemExcelImport = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::itemExcelImport::controller");
  const { ccId, type } = req.body as {
    ccId?: string;
    type?: "Warehouse" | "Branch";
  };

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded.",
    });
  }

  const batch = await itemService.itemExcelImport({
    path: req.file.path,
    ccId: ccId ? Number(ccId) : undefined,
    type,
  });

  deleteFileIfExists(req.file.path);

  const response = new BaseResponse(
    {
      success: true,
      message: "Item Import started.",
    },
    batch,
  );
  logger.info("exiting::itemExcelImport::controller");
  return res.status(200).json(response);
});

export const itemExcelSampleExport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelStoreReqReport::controller");

    const wb: Workbook = await itemService.itemExcelSampleExport();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="sample_item.xlsx"',
    );

    await wb.xlsx.write(res); // streams the Excel file
    res.end();
  },
);

export const excelItemReport = TryCatch(async (req: Request, res: Response) => {
  const input = req.body as ItemFilter;

  const wb: Workbook = await itemService.buildItemReportWorkbook(input);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="item_report.xlsx"`,
  );
  await wb.xlsx.write(res);
  res.end();
});

export const ActiveItem = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::ActiveItem::controller");
  const id = req.params.id;
  await itemService.activeItemService(Number(id));
  logger.info("exiting::ActiveItem::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("UPDATED", "Item "),
    }),
  );
});
