import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";
import {
  AcknowledgeBranchRequisitionReturn,
  ApproveBranchReqReturnInput,
  CreateBranchRequisitionReturnInput,
  RejectBranchRequisitionReturnInput,
} from "@/types/purchase/branchRequisitionReturn.js";
import { branchRequisitionReturnService } from "@/services/purchase/branchRequisitionReturn.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

export const createBranchRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createBranchRequisitionReturn::controller");

    const input = req.body as CreateBranchRequisitionReturnInput;

    const created =
      await branchRequisitionReturnService.createBranchRequisitionReturn(input);

    logger.info("exiting::createBranchRequisitionReturn::controller");
    return res
      .status(201)
      .json(
        BaseResponse.success(
          { type: "CREATED", data: created },
          "Branch Requisition Return",
        ),
      );
  },
);

export const updateBranchRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateBranchRequisitionReturn::controller");

    const input = req.body as CreateBranchRequisitionReturnInput;

    const updated =
      await branchRequisitionReturnService.updateBranchRequisitionReturn(input);

    logger.info("exiting::updateBranchRequisitionReturn::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "UPDATED", data: updated },
          "Branch Requisition Return",
        ),
      );
  },
);

export const getAllBranchRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllBranchRequisitionReturn::controller");

    const data =
      await branchRequisitionReturnService.getAllBranchRequisitionReturn();

    logger.info("exiting::getAllBranchRequisitionReturn::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "FETCHED", data },
          "Branch Requisition Return",
        ),
      );
  },
);

export const getBranchRequisitionReturnById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getBranchRequisitionReturnById::controller");

    const { branchRequisitionReturnId } = req.query as {
      branchRequisitionReturnId: string;
    };

    const data =
      await branchRequisitionReturnService.getBranchRequisitionReturnById(
        Number(branchRequisitionReturnId),
      );

    logger.info("exiting::getBranchRequisitionReturnById::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "FETCHED", data },
          "Branch Requisition Return",
        ),
      );
  },
);

export const deleteBranchRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteBranchRequisitionReturn::controller");

    const { id } = req.query as { id: string };

    await branchRequisitionReturnService.deleteBranchRequisitionReturn(
      Number(id),
    );

    logger.info("exiting::deleteBranchRequisitionReturn::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success({ type: "DELETED" }, "Branch Requisition Return"),
      );
  },
);

export const rejectBranchRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::rejectBranchRequisitionReturn::controller");

    const body = req.body as RejectBranchRequisitionReturnInput;

    await branchRequisitionReturnService.rejectBranchRequisitionReturn(body);

    logger.info("exiting::rejectBranchRequisitionReturn::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success({ type: "REJECTED" }, "Branch Requisition Return"),
      );
  },
);

export const approveBranchRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::approveBranchRequisitionReturn::controller");

    const body = req.body as ApproveBranchReqReturnInput;

    await branchRequisitionReturnService.approveBranchRequisitionReturn(body);

    logger.info("exiting::approveBranchRequisitionReturn::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success({ type: "APPROVED" }, "Branch Requisition Return"),
      );
  },
);

export const acknowledgeBranchRequisitionReturn = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::acknowledgeBranchRequisitionReturn::controller");

    const body = req.body as AcknowledgeBranchRequisitionReturn;

    await branchRequisitionReturnService.acknowledgeBranchRequisitionReturn(
      body,
    );

    logger.info("exiting::acknowledgeBranchRequisitionReturn::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "ACKNOWLEDGED" },
          "Branch Requisition Return",
        ),
      );
  },
);
