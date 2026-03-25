import { TryCatch } from "@repo/platform";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { staffDesignationService } from "@/services/staff/designation.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

export const createStaffDesignation = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createStaffDesignation::controller");
    const { designation } = req.body;
    const staffDesignation =
      await staffDesignationService.createStaffDesignation({ designation });
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Staff Designation"),
      },
      staffDesignation,
    );
    logger.info("exiting::createStaffDesignation::controller");
    return res.status(201).json(response);
  },
);

export const getAllStaffDesignations = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getStaffDesignation::controller");
    const staffDesignations =
      await staffDesignationService.getAllDesignations();
    logger.info("exiting::getStaffDesignation::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Staff Designation"),
        },
        staffDesignations,
      ),
    );
  },
);

export const getStaffDesignationById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getStaffDesignationById::controller");
    const { staffDesignationId } = req.params;
    const staffDesignation =
      await staffDesignationService.getStaffDesignationById(
        Number(staffDesignationId),
      );

    if (!staffDesignation) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
        }),
      );
    }
    logger.info("exiting::getStaffDesignationById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Staff Designation"),
        },
        staffDesignation,
      ),
    );
  },
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
        },
      );
    logger.info("exiting::updateStaffDesignation::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Staff Designation"),
        },
        updatedStaffDesignation,
      ),
    );
  },
);

export const deleteStaffDesignation = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteStaffDesignation::controller");

    const { staffDesignationId } = req.params;
    await staffDesignationService.deleteStaffDesignation(
      Number(staffDesignationId),
    );
    logger.info("exiting::deleteStaffDesignation::controller");

    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("DELETED", "Staff Designation"),
      }),
    );
  },
);
