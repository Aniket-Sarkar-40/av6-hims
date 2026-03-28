import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { ToggleActive } from "@/types/common.js";
import { WarehouseReq } from "@/types/master/warehouse.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
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
    warehouse,
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
      updatedWarehouse,
    ),
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
      cities,
    ),
  );
});

export const getWarehouseById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getWarehouseById::controller");
    const { warehouseId } = req.query as { warehouseId: string };

    const medCategory = await warehouseService.getWarehouseById(
      Number(warehouseId),
    );

    if (!medCategory) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
        }),
      );
    }
    logger.info("exiting::getWarehouseById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Warehouse"),
        },
        medCategory,
      ),
    );
  },
);

export const toggleActiveWarehouse = TryCatch(
  async (req: Request, res: Response) => {
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
        warehouse,
      ),
    );
  },
);
