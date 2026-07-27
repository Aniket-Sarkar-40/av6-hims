import { storeRequisitionReturnService } from "@/services/purchase/storeRequisitionReturn.service.js";
import {
  AcknowledgeRequisitionReturn,
  ApproveStoreReqReturnInput,
  CreateStoreRequisitionReturnInput,
  RejectStoreRequisitionReturnInput,
} from "@/types/purchase/storeRequisitionReturn.js";
import { logger } from "@repo/platform/logging/logger.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";

export const createStoreRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createStoreRequisitionReturn::controller");
    const input = req.body as CreateStoreRequisitionReturnInput;
    const created =
      await storeRequisitionReturnService.createStoreRequisitionReturn(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "Store Requisition Return",
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
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Store Requisition Return",
    );
    logger.info("exiting::updateStoreRequisitionReturn::controller");
    return res.status(200).json(response);
  },
);

export const getAllStoreRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllStoreRequisitionReturn::controller");
    const storeRequisitionReturns =
      await storeRequisitionReturnService.getAllStoreRequisitionReturn();
    const response = BaseResponse.success({
      type: "FETCHED",
      data: storeRequisitionReturns,
    });
    logger.info("exiting::getAllStoreRequisitionReturn::controller");
    return res.status(200).json(response);
  },
);

export const getStoreRequisitionReturnById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getStoreRequisitionReturnById::controller");
    const { storeRequisitionReturnId } = req.query as {
      storeRequisitionReturnId: string;
    };

    const storeRequisitionReturn =
      await storeRequisitionReturnService.getStoreRequisitionReturnById(
        Number(storeRequisitionReturnId),
      );

    const response = BaseResponse.success({
      type: "FETCHED",
      data: storeRequisitionReturn,
    });
    logger.info("exiting::getStoreRequisitionReturnById::controller");
    return res.status(200).json(response);
  },
);

export const deleteStoreRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteStoreRequisitionReturn::controller");
    const { id } = req.query as { id: string };

    await storeRequisitionReturnService.deleteStoreRequisitionReturn(
      Number(id),
    );

    logger.info("exiting::deleteStoreRequisitionReturn::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success({ type: "DELETED" }, "Store Requisition Return"),
      );
  },
);

export const rejectStoreRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::rejectStoreRequisitionReturn::controller");
    const body = req.body as RejectStoreRequisitionReturnInput;

    await storeRequisitionReturnService.rejectStoreRequisitionReturn(body);

    logger.info("exiting::rejectStoreRequisitionReturn::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success({ type: "REJECTED" }, "Store Requisition Return"),
      );
  },
);

export const approveStoreRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::approveStoreRequisitionReturn::controller");
    const body = req.body as ApproveStoreReqReturnInput;

    await storeRequisitionReturnService.approveStoreRequisitionReturn(body);

    logger.info("exiting::approveStoreRequisitionReturn::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success({ type: "APPROVED" }, "Store Requisition Return"),
      );
  },
);

export const acknowledgeStoreRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::acknowledgeStoreRequisitionReturn::controller");
    const body = req.body as AcknowledgeRequisitionReturn;

    await storeRequisitionReturnService.acknowledgeStoreRequisitionReturn(body);

    logger.info("exiting::acknowledgeStoreRequisitionReturn::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "ACKNOWLEDGED" },
          "Store Requisition Return",
        ),
      );
  },
);
