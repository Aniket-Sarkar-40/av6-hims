import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { collectionCenterService } from "@/services/master/collectionCenter.service.js";
import { CollectionCenterReq } from "@/types/master/collectionCenter.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import { validateIdEmployee } from "@/validations/service/staff/employee.service.validation.js";
import { Request, Response } from "express";

export const createCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createCollectionCenter::controller");
    const input = req.body;
    const collectionCenter =
      await collectionCenterService.createCollectionCenter(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: collectionCenter },
      "Collection Center"
    );
    logger.info("exiting::createCollectionCenter::controller");
    return res.status(201).json(response);
  }
);

export const updateCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateCollectionCenter::controller");
    const input = req.body as CollectionCenterReq;
    const updateCollectionCenter =
      await collectionCenterService.updateCollectionCenter(input);
    logger.info("exiting::updateCollectionCenter::controller");
    const response = BaseResponse.success(
      { type: "UPDATED", data: updateCollectionCenter },
      "Collection Center"
    );
    return res.status(200).json(response);
  }
);

export const getAllCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllCollectionCenter::controller");
    const collCenters = await collectionCenterService.getAllCollectionCenter();
    logger.info("exiting::getAllCollectionCenter::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: collCenters },
      "Collection Center"
    );
    return res.status(200).json(response);
  }
);

export const getAvailableCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAvailableCollectionCenter::controller");
    const collCenters =
      await collectionCenterService.getAvailableCollectionCenter();
    logger.info("exiting::getAvailableCollectionCenter::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: collCenters },
      "Collection Center"
    );
    return res.status(200).json(response);
  }
);

export const getCollectionCenterById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getCollectionCenterById::controller");
    const { collectionCenterId } = req.query as { collectionCenterId: string };

    const medCategory = await collectionCenterService.getCollectionCenterById(
      Number(collectionCenterId)
    );

    if (!medCategory) {
      const Response = BaseResponse.error({
        message: generateErrorMessage("NOT_FOUND", "Collection Center"),
      });
      return res.status(404).json(Response);
    }
    logger.info("exiting::getCollectionCenterById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Collection Center"),
        },
        medCategory
      )
    );
  }
);

export const getBranchOrWarehouse = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getCollectionCentersForStaff::controller");
    const { id } = req.query;

    const staffId = Number(id);
    await validateIdEmployee(staffId);

    const collectionCenters =
      await collectionCenterService.getCollectionCentersForStaff(staffId);

    logger.info("exiting::getCollectionCentersForStaff::controller");
    const response = BaseResponse.success(
      { type: "FETCHED", data: collectionCenters },
      "Collection Center"
    );
    return res.status(200).json(response);
  }
);
