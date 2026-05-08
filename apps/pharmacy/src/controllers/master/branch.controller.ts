import { TryCatch } from "@repo/platform";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { branchService } from "@/services/master/branch.service.js";
import { BranchReq } from "@/types/master/branch.js";
import { ToggleActive } from "av6-core-v2";

export const createBranch = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createBranch::controller");
  const input = req.body;
  const branch = await branchService.createBranch(input);
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Branch"),
    },
    branch
  );
  logger.info("exiting::createBranch::controller");
  return res.status(201).json(response);
});

export const updateBranch = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateBranch::controller");
  const input = req.body as BranchReq;
  const updateBranch = await branchService.updateBranch(input);
  logger.info("exiting::updateBranch::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Branch"),
      },
      updateBranch
    )
  );
});

export const getAllBranch = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllBranch::controller");
  const branches = await branchService.getAllBranch();
  logger.info("exiting::getAllBranch::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Branch"),
      },
      branches
    )
  );
});

export const getBranchById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getBranchById::controller");
  const { branchId } = req.query as { branchId: string };

  const branch = await branchService.getBranchById(Number(branchId));

  if (!branch) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      })
    );
  }
  logger.info("exiting::getBranchById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Branch"),
      },
      branch
    )
  );
});

export const toggleActiveBranch = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::toggleActiveBranch::controller");
    const input = req.body as ToggleActive;

    const branch = await branchService.toggleActiveBranch(input);

    logger.info("exiting::toggleActiveBranch::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Branch"),
        },
        branch
      )
    );
  }
);

export const getAllBranchFromItemBanchMap = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllBranchFromItemBanchMap::controller");
    const branch = await branchService.getAllBranchFromItemBranchMap();
    logger.info("exiting::getAllBranchFromItemBanchMap::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Branch"),
        },
        branch
      )
    );
  }
);
