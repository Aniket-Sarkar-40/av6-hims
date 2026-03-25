import { TryCatch } from "@repo/platform";
import { storeRequisitionReturnService } from "@/services/purchase/storeRequisitionReturn.service.js";
import {
  AcknowledgeRequisitionReturn,
  ApproveStoreReqReturnInput,
  CreateStoreRequisitionReturnInput,
  RejectStoreRequisitionReturnInput,
} from "@/types/purchase/requisitionReturn.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createStoreRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createStoreRequisitionReturn::controller");
    const input = req.body;
    const storeRequisitionReturn =
      await storeRequisitionReturnService.createStoreRequisitionReturn(input);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Store Requisition return"),
      },
      storeRequisitionReturn,
    );
    logger.info("exiting::createStoreRequisitionReturn::controller");
    return res.status(201).json(response);
  },
);

export const updateStoreRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateStoreRequisitionReturn::controller");

    const input = req.body as CreateStoreRequisitionReturnInput;

    const updated =
      await storeRequisitionReturnService.updateStoreRequisitionReturn(input);

    logger.info("exiting::updateStoreRequisitionReturn::controller");

    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage(
            "UPDATED",
            "Store Requisition return",
          ),
        },
        updated,
      ),
    );
  },
);

export const getAllStoreRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllStoreRequisitionReturn::controller");
    const reqReturns =
      await storeRequisitionReturnService.getAllStoreRequisitionReturn();
    logger.info("exiting::getAllStoreRequisitionReturn::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage(
            "FETCHED",
            "Store Requisition Returns",
          ),
        },
        reqReturns,
      ),
    );
  },
);

export const getStoreRequisitionReturnById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getStoreRequisitionReturnById::controller");
    const { id } = req.query as { id: string };

    const storeRequisitionReturn =
      await storeRequisitionReturnService.getStoreRequisitionReturnById(
        Number(id),
      );

    logger.info("exiting::getStoreRequisitionReturnById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage(
            "FETCHED",
            "Store Requisition Return",
          ),
        },
        storeRequisitionReturn,
      ),
    );
  },
);

export const deleteStoreRequisitionReturn = TryCatch(async (req, res) => {
  logger.info("entering::deleteStoreRequisition::controller");
  const id = Number(req.query.id);

  await storeRequisitionReturnService.deleteStoreRequisitionReturn(id);

  logger.info("exiting::deleteStoreRequisitionReturn::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("DELETED", "Store Requisition Return"),
  });
});

export const rejectStoreRequisitionReturn = TryCatch(async (req, res) => {
  logger.info("entering::rejectStoreRequisitionReturn::controller");
  const body = req.body as RejectStoreRequisitionReturnInput;

  await storeRequisitionReturnService.rejectStoreRequisitionReturn(body);

  logger.info("exiting::rejectStoreRequisitionReturn::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("UPDATED", "Store Requisition Return"),
  });
});

export const approveStoreRequisitionReturn = TryCatch(async (req, res) => {
  logger.info("entering::approveStoreRequisitionReturn::controller");
  const body = req.body as ApproveStoreReqReturnInput;

  await storeRequisitionReturnService.approveStoreRequisitionReturn(body);

  logger.info("exiting::approveStoreRequisitionReturn::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("UPDATED", "Store Requisition return"),
  });
});

export const acknowledgeStoreRequisitionReturn = TryCatch(async (req, res) => {
  logger.info("entering::acknowledgeStoreRequisitionReturn::controller");
  const body = req.body as AcknowledgeRequisitionReturn;

  await storeRequisitionReturnService.acknowledgeStoreRequisitionReturn(body);

  logger.info("exiting::acknowledgeStoreRequisitionReturn::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("UPDATED", "Store Requisition Return"),
  });
});
