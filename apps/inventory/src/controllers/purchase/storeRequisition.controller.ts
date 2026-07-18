import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { storeRequisitionService } from "@/services/purchase/storeRequisition.service.js";
import {
  AcknowledgeRequisition,
  ApproveStoreReqInput,
  CreateStoreRequisitionInput,
  RejectStoreRequisitionInput,
} from "@/types/purchase/storeRequisition.js";

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createStoreRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createStoreRequisition::controller");
    const input = req.body;
    const storeRequisition =
      await storeRequisitionService.createStoreRequisition(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: storeRequisition },
      "Store Requisition",
    );
    logger.info("exiting::createStoreRequisition::controller");
    return res.status(201).json(response);
  },
);

export const updateStoreRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateStoreRequisition::controller");

    const input = req.body as CreateStoreRequisitionInput;

    const updated = await storeRequisitionService.updateStoreRequisition(input);

    logger.info("exiting::updateStoreRequisition::controller");

    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Store Requisition",
    );
    return res.status(200).json(response);
  },
);

export const getAllStoreRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllStoreRequisition::controller");
    const storeRequisitions =
      await storeRequisitionService.getAllStoreRequisition();
    const response = BaseResponse.success({
      type: "FETCHED",
      data: storeRequisitions,
    });
    logger.info("exiting::getAllStoreRequisition::controller");
    return res.status(200).json(response);
  },
);

export const getstoreRequisitionById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getstoreRequisitionById::controller");
    const { storeRequisitionId } = req.query as { storeRequisitionId: string };

    const storeRequisition =
      await storeRequisitionService.getStoreRequisitionById(
        Number(storeRequisitionId),
      );

    if (!storeRequisition) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
        }),
      );
    }

    const response = BaseResponse.success({
      type: "FETCHED",
      data: storeRequisition,
    });
    logger.info("exiting::getstoreRequisitionById::controller");
    return res.status(200).json(response);
  },
);

export const deleteStoreRequisition = TryCatch(async (req, res) => {
  logger.info("entering::deleteStoreRequisition::controller");
  const id = Number(req.query.storeRequisitionId);

  await storeRequisitionService.deleteStoreRequisition(id);

  logger.info("exiting::deleteStoreRequisition::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("DELETED", "Store Requisition"),
  });
});

export const rejectStoreRequisition = TryCatch(async (req, res) => {
  logger.info("entering::rejectStoreRequisition::controller");
  const body = req.body as RejectStoreRequisitionInput;

  await storeRequisitionService.rejectStoreRequisition(body);

  logger.info("exiting::rejectStoreRequisition::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("UPDATED", "Store Requisition"),
  });
});

export const approveStoreRequisition = TryCatch(async (req, res) => {
  logger.info("entering::approveStoreRequisition::controller");
  const body = req.body as ApproveStoreReqInput;

  await storeRequisitionService.approveStoreRequisition(body);

  logger.info("exiting::approveStoreRequisition::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("UPDATED", "Store Requisition"),
  });
});

export const acknowledgeStoreRequisition = TryCatch(async (req, res) => {
  logger.info("entering::acknowledgeStoreRequisition::controller");
  const body = req.body as AcknowledgeRequisition;

  await storeRequisitionService.acknowledgeStoreRequisition(body);

  logger.info("exiting::acknowledgeStoreRequisition::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("UPDATED", "Store Requisition"),
  });
});

export const getstoreRequisitionBatchWiseById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getstoreRequisitionBatchWiseById::controller");
    const { storeRequisitionId } = req.query as { storeRequisitionId: string };

    const storeRequisition =
      await storeRequisitionService.getStoreRequisitionBatchWiseById(
        Number(storeRequisitionId),
      );

    logger.info("exiting::getstoreRequisitionBatchWiseById::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "FETCHED", data: storeRequisition },
          "Batch Wise",
        ),
      );
  },
);

export const getAllStoreRequisitionBatchWiseById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllStoreRequisitionBatchWiseById::controller");
    const { storeRequisitionId } = req.query as { storeRequisitionId: string };

    const storeRequisition =
      await storeRequisitionService.getAllStoreRequisitionBatchWiseById(
        Number(storeRequisitionId),
      );

    logger.info("exiting::getAllStoreRequisitionBatchWiseById::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "FETCHED", data: storeRequisition },
          "Batch Wise",
        ),
      );
  },
);
