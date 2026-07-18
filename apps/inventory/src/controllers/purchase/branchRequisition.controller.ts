import { branchRequisitionService } from "@/services/purchase/branchRequisition.service.js";
import {
  AcknowledgeBranchRequisition,
  ApproveBranchReqInput,
  CreateBranchRequisitionInput,
  RejectBranchRequisitionInput,
} from "@/types/purchase/branchRequisition.js";
import { logger } from "@repo/platform/logging/logger.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

import { Request, Response } from "express";

export const createBranchRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createBranchRequisition::controller");

    const input = req.body as CreateBranchRequisitionInput;

    const branchRequisition =
      await branchRequisitionService.createBranchRequisition(input);

    logger.info("exiting::createBranchRequisition::controller");
    return res
      .status(201)
      .json(
        BaseResponse.success(
          { type: "CREATED", data: branchRequisition },
          "Branch Requisition",
        ),
      );
  },
);

export const updateBranchRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateBranchRequisition::controller");

    const input = req.body as CreateBranchRequisitionInput;

    const updated =
      await branchRequisitionService.updateBranchRequisition(input);

    logger.info("exiting::updateBranchRequisition::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "UPDATED", data: updated },
          "Branch Requisition",
        ),
      );
  },
);

export const deleteBranchRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteBranchRequisition::controller");

    const id = Number(req.query.branchRequisitionId);

    await branchRequisitionService.deleteBranchRequisition(id);

    logger.info("exiting::deleteBranchRequisition::controller");

    return res
      .status(200)
      .json(BaseResponse.success({ type: "DELETED" }, "Branch Requisition"));
  },
);

export const rejectBranchRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::rejectBranchRequisition::controller");

    const body = req.body as RejectBranchRequisitionInput;

    await branchRequisitionService.rejectBranchRequisition(body);

    logger.info("exiting::rejectBranchRequisition::controller");

    return res
      .status(200)
      .json(BaseResponse.success({ type: "UPDATED" }, "Branch Requisition"));
  },
);

export const approveBranchRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::approveBranchRequisition::controller");

    const body = req.body as ApproveBranchReqInput;

    await branchRequisitionService.approveBranchRequisition(body);

    logger.info("exiting::approveBranchRequisition::controller");

    return res
      .status(200)
      .json(BaseResponse.success({ type: "UPDATED" }, "Branch Requisition"));
  },
);

export const acknowledgeBranchRequisition = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::acknowledgeBranchRequisition::controller");

    const body = req.body as AcknowledgeBranchRequisition;

    await branchRequisitionService.acknowledgeBranchRequisition(body);

    logger.info("exiting::acknowledgeBranchRequisition::controller");

    return res
      .status(200)
      .json(BaseResponse.success({ type: "UPDATED" }, "Branch Requisition"));
  },
);

export const getBranchRequisitionBatchWiseById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getBranchRequisitionBatchWiseById::controller");
    const { branchRequisitionId } = req.query as {
      branchRequisitionId: string;
    };

    const branchRequisition =
      await branchRequisitionService.getBranchRequisitionBatchWiseById(
        Number(branchRequisitionId),
      );

    logger.info("exiting::getBranchRequisitionBatchWiseById::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "FETCHED", data: branchRequisition },
          "Batch Wise",
        ),
      );
  },
);

export const getAllBranchRequisitionBatchWiseById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllBranchRequisitionBatchWiseById::controller");
    const { branchRequisitionId } = req.query as {
      branchRequisitionId: string;
    };

    const branchRequisition =
      await branchRequisitionService.getAllBranchRequisitionBatchWiseById(
        Number(branchRequisitionId),
      );

    logger.info("exiting::getAllBranchRequisitionBatchWiseById::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "FETCHED", data: branchRequisition },
          "Batch Wise",
        ),
      );
  },
);
