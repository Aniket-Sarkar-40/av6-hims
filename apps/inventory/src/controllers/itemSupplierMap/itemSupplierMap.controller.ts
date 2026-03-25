import { TryCatch } from "@/middlewares/error.middleware";
import { deleteFileIfExists } from "@/middlewares/imageUpload.middleware";
import { itemSupplierMapService } from "@/services/itemSupplierMap/itemSupplierMap.service";
import { ItemSupplierMapImportExcelInput } from "@/types/itemSupplierMap/itemSupplierMap";
import { BaseResponse } from "@/utils/baseResponse.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { importExcelItemSupplierMapServiceValidation } from "@/validations/service/itemSupplierMap/itemSupplierMapService.validation";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const createItemSupplierMap = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createItemSupplierMap::controller");
  const body = req.body;
  const createdItemSupplierMap = await itemSupplierMapService.createItemSupplierMap(body);
  logger.info("exiting::createItemSupplierMap::controller");
  const response = BaseResponse.success({ type: "CREATED", data: createdItemSupplierMap }, "Item Supplier Mapping");
  return res.status(200).json(response);
});

export const updateItemSupplierMap = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateItemSupplierMap::controller");
  const body = req.body;
  const updatedItemSupplierMap = await itemSupplierMapService.updateItemSupplierMap(body);
  logger.info("exiting::updateItemSupplierMap::controller");
  const response = BaseResponse.success({ type: "UPDATED", data: updatedItemSupplierMap }, "Item Supplier Mapping");
  return res.status(200).json(response);
});

export const getAllItemSupplierMap = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllItemSupplierMap::controller");

  const itemSupplierMap = await itemSupplierMapService.getAllItemSupplierMap();
  logger.info("exiting::getAllItemSupplierMap::controller");
  const response = BaseResponse.success({ type: "FETCHED", data: itemSupplierMap }, "Item Supplier Mapping");
  return res.status(200).json(response);
});

export const getItemSupplierMapById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getItemSupplierMapById::controller");
  const { itemSupplierMapId } = req.query as { itemSupplierMapId: string };
  const itemSupplierMap = await itemSupplierMapService.getItemSupplierMapById(Number(itemSupplierMapId));
  logger.info("exiting::getItemSupplierMapById::controller");
  if (!itemSupplierMap) {
    const response = BaseResponse.error({ message: generateErrorMessage("NOT_FOUND", "Item Supplier Mapping") });
    return res.status(404).json(response);
  }
  logger.info("exiting::getItemSupplierMapById::controller");
  const response = BaseResponse.success({ type: "FETCHED", data: itemSupplierMap }, "Item Supplier Mapping");
  return res.status(200).json(response);
});

export const deleteItemSupplierMapById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteItemSupplierMapById::controller");
  const { itemSupplierMapId } = req.query as { itemSupplierMapId: string };
  await itemSupplierMapService.deleteItemSupplierMapById(Number(itemSupplierMapId));

  logger.info("exiting::deleteItemSupplierMapById::controller");
  const response = BaseResponse.success({ type: "DELETED" }, "Item Supplier Mapping");
  return res.status(200).json(response);
});

export const exportItemSupplierMapExcel = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::exportItemSupplierMapExcel::controller");
  const wb: Workbook = await itemSupplierMapService.itemSupplierMapExportExcel();
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="item_supplier_map.xlsx"`);
  await wb.xlsx.write(res);
  logger.info("exiting::exportItemSupplierMapExcel::controller");
  res.end();
});

export const importItemSupplierMapExcel = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::importItemSupplierMapExcel::controller");
  const input = req.body as ItemSupplierMapImportExcelInput;
  if (!req.file) {
    return res.status(400).json(BaseResponse.error({ message: "No file uploaded" }));
  }
  await importExcelItemSupplierMapServiceValidation(input);
  await itemSupplierMapService.itemSupplierMapImportExcel(req.file.path, input);

  deleteFileIfExists(req.file.path);
  const response = BaseResponse.success({ type: "STARTED" }, "Item Supplier Mapping Import");
  logger.info("exiting::importItemSupplierMapExcel::controller");
  return res.status(200).json(response);
});
