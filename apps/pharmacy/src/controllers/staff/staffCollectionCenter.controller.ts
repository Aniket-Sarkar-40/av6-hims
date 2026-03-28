import { TryCatch } from "@repo/platform";
import { staffCollectionCenterService } from "@/services/staff/staffCollectionCenter.service.js";
import { CreateOrUpdateStaffCollectionCenter } from "@/types/staff/staffCollectionCenter.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createStaffCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createStaffCollectionCenter::controller");
    const body = req.body as CreateOrUpdateStaffCollectionCenter;

    await staffCollectionCenterService.createStaffCollectionCenter(body);

    logger.info("exiting::createStaffCollectionCenter::controller");
    return res.status(201).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("CREATED", "staff Collection Center"),
      }),
    );
  },
);

export const getStaffCollectionCenterById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getStaffCollectionCenterById::controller");
    const { staffCollectionCenterId } = req.params;
    const staffCollectionCenter =
      await staffCollectionCenterService.getStaffCollectionCenterById(
        Number(staffCollectionCenterId),
      );

    logger.info("exiting::getStaffCollectionCenterById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "staff Collection Center"),
        },
        staffCollectionCenter,
      ),
    );
  },
);

export const getStaffCollectionCenterMapById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getStaffCollectionCenterMapById::controller");
    const { staffId } = req.params;
    const staffCollectionCenter =
      await staffCollectionCenterService.getStaffCollectionCenterMapById(
        Number(staffId),
      );

    logger.info("exiting::getStaffCollectionCenterMapById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "staff Collection Center"),
        },
        staffCollectionCenter,
      ),
    );
  },
);

export const updateStaffCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateStaffCollectionCenter::controller");
    const { staffCollectionCenterId } = req.params;
    const body = req.body as CreateOrUpdateStaffCollectionCenter;

    await staffCollectionCenterService.updateStaffCollectionCenter(
      Number(staffCollectionCenterId),
      body,
    );
    logger.info("exiting::updateStaffCollectionCenter::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("UPDATED", "staff Collection Center"),
      }),
    );
  },
);

export const deleteStaffCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteStaffCollectionCenter::controller");
    const { staffCollectionCenterId } = req.params;
    await staffCollectionCenterService.deleteStaffCollectionCenter(
      Number(staffCollectionCenterId),
    );
    logger.info("exiting::deleteStaffCollectionCenter::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("DELETED", "staff Collection Center"),
      }),
    );
  },
);
