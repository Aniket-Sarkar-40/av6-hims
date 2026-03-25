import { TryCatch } from "@/middlewares/error.middleware";
import { warehouseService } from "@/services/master/warehouse.service";
import { ToggleActive } from "@/types/common";
import { WarehouseReq } from "@/types/master/warehouse";
import { BaseResponse } from "@/utils/baseResponse.utils";
import { logger } from "@/utils/logger.utils";
import { generateSuccessMessage } from "@/utils/responseMessage.utils";
import { Request, Response } from "express";

export const createWarehouse = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createWarehouse::controller");
  const input = req.body;
  const warehouse = await warehouseService.createWarehouse(input);
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Warehouse"),
    },
    warehouse
  );
  logger.info("exiting::createWarehouse::controller");
  return res.status(201).json(response);
});

export const updateWarehouse = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateWarehouse::controller");
  const input = req.body as WarehouseReq;
  const updatedWarehouse = await warehouseService.updateWarehouse(input);
  logger.info("exiting::updateWarehouse::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Warehouse"),
      },
      updatedWarehouse
    )
  );
});

export const getAllWarehouse = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllWarehouse::controller");
  const cities = await warehouseService.getAllWarehouse();
  logger.info("exiting::getWarehouse::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Warehouse"),
      },
      cities
    )
  );
});

export const getWarehouseById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getWarehouseById::controller");
  const { warehouseId } = req.query as { warehouseId: string };

  const medCategory = await warehouseService.getWarehouseById(Number(warehouseId));

  if (!medCategory) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      })
    );
  }
  logger.info("exiting::getWarehouseById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Warehouse"),
      },
      medCategory
    )
  );
});

export const toggleActiveWarehouse = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::toggleActiveWarehouse::controller");
  const input = req.body as ToggleActive;

  const warehouse = await warehouseService.toggleActiveWarehouse(input);

  logger.info("exiting::toggleActiveWarehouse::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Warehouse"),
      },
      warehouse
    )
  );
});
