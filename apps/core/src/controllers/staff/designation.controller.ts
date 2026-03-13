import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { staffDesignationService } from "@/services/staff/designation.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";

export const createStaffDesignation = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createStaffDesignation::controller");
    const { designation } = req.body;
    const staffDesignation =
      await staffDesignationService.createStaffDesignation({ designation });

    const response = BaseResponse.success(
      { type: "CREATED", data: staffDesignation },
      "Staff Designation"
    );

    logger.info("exiting::createStaffDesignation::controller");
    return res.status(201).json(response);
  }
);

export const getAllStaffDesignations = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getStaffDesignation::controller");
    const staffDesignations =
      await staffDesignationService.getAllDesignations();

    const response = BaseResponse.success(
      { type: "FETCHED", data: staffDesignations },
      "Staff Designation"
    );

    logger.info("exiting::getStaffDesignation::controller");
    return res.status(200).json(response);
  }
);

export const getStaffDesignationById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getStaffDesignationById::controller");
    const { staffDesignationId } = req.params;
    const staffDesignation =
      await staffDesignationService.getStaffDesignationById(
        Number(staffDesignationId)
      );

    if (!staffDesignation) {
      return res.status(400).json(
        BaseResponse.error({
          message: generateErrorMessage("NOT_FOUND", "Staff Designation"),
        })
      );
    }

    const response = BaseResponse.success(
      { type: "FETCHED", data: staffDesignation },
      "Staff Designation"
    );

    logger.info("exiting::getStaffDesignationById::controller");
    return res.status(200).json(response);
  }
);

export const updateStaffDesignation = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateStaffDesignation::controller");
    const { staffDesignationId } = req.params;
    const { designation } = req.body;
    const updatedStaffDesignation =
      await staffDesignationService.updateStaffDesignation(
        Number(staffDesignationId),
        {
          designation,
        }
      );

    const response = BaseResponse.success(
      { type: "UPDATED", data: updatedStaffDesignation },
      "Staff Designation"
    );

    logger.info("exiting::updateStaffDesignation::controller");
    return res.status(200).json(response);
  }
);

export const deleteStaffDesignation = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteStaffDesignation::controller");
    const { staffDesignationId } = req.params;
    await staffDesignationService.deleteStaffDesignation(
      Number(staffDesignationId)
    );

    const response = BaseResponse.success(
      { type: "DELETED" },
      "Staff Designation"
    );

    logger.info("exiting::deleteStaffDesignation::controller");
    return res.status(200).json(response);
  }
);
