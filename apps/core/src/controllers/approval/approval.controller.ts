import { approvalServiceFactory } from "@/config/core.config.js";
import { toLastApproverDetailsDto } from "@/mapper/approval/approval.mapper.js";
import { approvalService } from "@/services/approval/approval.service.js";
import { ApprovalAction } from "@repo/db/generated/prisma/client";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  CommonApproveReq,
  CommonGetApprovalActionReq,
  GetMyApprovalFlow,
  StartFlowReq,
} from "av6-core-v2";
import { Request, Response } from "express";

export const commonApproval = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::commonApproval::controller");
  const input = req.body as CommonApproveReq;

  await approvalService.approve(input);

  const response = new BaseResponse({
    success: true,
    message: generateSuccessMessage(
      input.approveType === "APPROVE" ? "APPROVED" : "REJECTED",
      `${input.subjectType.replace(/_/g, " ")}`,
    ),
  });
  logger.info("exiting::commonApproval::controller");
  return res.status(200).json(response);
});

export const getApprovalActDetails = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::purchaseApproval::controller");
    const input = req.body as CommonGetApprovalActionReq;

    validIdCheck(input.id);

    const actRecords =
      (await approvalServiceFactory.getApprovalActDetailsBySubjectId(
        input.id,
        input.subjectType,
        input.service,
      )) as unknown as ApprovalAction[];

    const data = await Promise.all(actRecords.map(toLastApproverDetailsDto));

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Data"),
      },
      data,
    );

    logger.info("exiting::commonApproval::controller");
    return res.status(200).json(response);
  },
);

export const getStaffPendingApproval = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getStaffPendingApproval::controller");
    const input = req.body as GetMyApprovalFlow;

    if (input.staffId) validIdCheck(input.staffId);
    if (input.ccId) validIdCheck(input.ccId);

    const pendingApprovalInst =
      await approvalService.getStaffPendingApproval(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Pending Approval"),
      },
      pendingApprovalInst,
    );
    logger.info("exiting::getStaffPendingApproval::controller");
    return res.status(200).json(response);
  },
);

export const startApprovalFlow = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::startApprovalFlow::controller");
    const input = req.body as StartFlowReq;

    await approvalService.startFlow(input);

    const response = new BaseResponse({
      success: true,
      message: generateSuccessMessage("STARTED", "Approval Flow"),
    });
    logger.info("exiting::startApprovalFlow::controller");
    return res.status(200).json(response);
  },
);
