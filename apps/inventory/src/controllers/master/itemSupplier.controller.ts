import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { itemSupplierService } from "@/services/master/itemSupplier.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";
import { Workbook } from "exceljs";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { ItemSupplierLookupInput } from "@/types/master/itemSupplier.js";

export const createItemSupplier = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createItemSupplier::controller");
    const body = req.body;
    const createdItemSupplier = await itemSupplierService.createItemSupplier(
      body
    );
    logger.info("exiting::createItemSupplier::controller");
    const response = BaseResponse.success(
      { type: "CREATED", data: createdItemSupplier },
      "Item Supplier"
    );
    return res.status(200).json(response);
  }
);

export const updateItemSupplier = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateItemSupplier::controller");
    const body = req.body;
    const updatedItemSupplier = await itemSupplierService.updateItemSupplier(
      body
    );
    logger.info("exiting::updateItemSupplier::controller");
    const response = BaseResponse.success(
      { type: "UPDATED", data: updatedItemSupplier },
      "Item Supplier"
    );
    return res.status(200).json(response);
  }
);

export const searchItemSupplier = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::searchItemSupplier::controller");
    const input = req.body as ItemSupplierLookupInput;
    const itemSuppliers = await itemSupplierService.searchItemSupplier(input);
    logger.info("exiting::searchItemSupplier::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: itemSuppliers },
      "Item Supplier"
    );
    return res.status(200).json(response);
  }
);

export const getAllItemSupplier = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllItemSupplier::controller");

    const itemSupplier = await itemSupplierService.getAllItemSupplier();
    logger.info("exiting::getAllItemSupplier::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: itemSupplier },
      "Item Supplier"
    );
    return res.status(200).json(response);
  }
);

export const getItemSupplierById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getItemSupplierById::controller");
    const { itemSupplierId } = req.query as { itemSupplierId: string };
    const itemSupplier = await itemSupplierService.getItemSupplierById(
      Number(itemSupplierId)
    );
    logger.info("exiting::getItemSupplierById::controller");
    if (!itemSupplier) {
      const response = BaseResponse.error({
        message: generateErrorMessage("NOT_FOUND", "Item Supplier"),
      });
      return res.status(404).json(response);
    }
    logger.info("exiting::getItemSupplierById::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: itemSupplier },
      "Item Supplier"
    );
    return res.status(200).json(response);
  }
);

export const deleteItemSupplierById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteItemSupplierById::controller");
    const { itemSupplierId } = req.query as { itemSupplierId: string };
    await itemSupplierService.deleteItemSupplierById(Number(itemSupplierId));

    logger.info("exiting::deleteItemSupplierById::controller");
    const response = BaseResponse.success({ type: "DELETED" }, "Item Supplier");
    return res.status(200).json(response);
  }
);

export const itemSupplierExcelSampleExport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::itemSupplierExcelSampleExport::controller");

    const wb: Workbook =
      await itemSupplierService.itemSupplierExcelSampleExport();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="vendor-sample.xlsx"'
    );

    await wb.xlsx.write(res);
    res.end();

    logger.info("exiting::itemSupplierExcelSampleExport::controller");
  }
);

export const itemSupplierExcelImport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::itemSupplierExcelImport::controller");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const batch = await itemSupplierService.itemSupplierExcelImport({
      path: req.file.path,
    });

    deleteFileIfExists(req.file.path);

    const response = new BaseResponse(
      {
        success: true,
        message: "Vendor Import started.",
      },
      batch
    );

    logger.info("exiting::itemSupplierExcelImport::controller");
    return res.status(200).json(response);
  }
);
