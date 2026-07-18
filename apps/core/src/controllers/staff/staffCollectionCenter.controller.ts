import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { staffCollectionCenterService } from "@/services/staff/staffCollectionCenter.service.js";
import { CreateOrUpdateStaffCollectionCenter } from "@/types/staff/staffCollectionCenter.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";

export const createStaffCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createStaffCollectionCenter::controller");
    const body = req.body as CreateOrUpdateStaffCollectionCenter;
    await staffCollectionCenterService.createStaffCollectionCenter(body);

    const response = BaseResponse.success(
      { type: "CREATED" },
      "Staff Collection Center",
    );

    logger.info("exiting::createStaffCollectionCenter::controller");
    return res.status(201).json(response);
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

    const response = BaseResponse.success(
      { type: "FETCHED", data: staffCollectionCenter },
      "Staff Collection Center",
    );

    logger.info("exiting::getStaffCollectionCenterById::controller");
    return res.status(200).json(response);
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

    const response = BaseResponse.success(
      { type: "FETCHED", data: staffCollectionCenter },
      "Staff Collection Center",
    );

    logger.info("exiting::getStaffCollectionCenterMapById::controller");
    return res.status(200).json(response);
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

    const response = BaseResponse.success(
      { type: "UPDATED" },
      "Staff Collection Center",
    );

    logger.info("exiting::updateStaffCollectionCenter::controller");
    return res.status(200).json(response);
  },
);

export const deleteStaffCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteStaffCollectionCenter::controller");
    const { staffCollectionCenterId } = req.params;
    await staffCollectionCenterService.deleteStaffCollectionCenter(
      Number(staffCollectionCenterId),
    );

    const response = BaseResponse.success(
      { type: "DELETED" },
      "Staff Collection Center",
    );

    logger.info("exiting::deleteStaffCollectionCenter::controller");
    return res.status(200).json(response);
  },
);
