import { TryCatch } from "@/middlewares/error.middleware";
import { unitMasterService } from "@/services/master/unitMaster.service";
import { UnitMasterReq, UnitMasterUpdate } from "@/types/master/unitMaster";
import { BaseResponse } from "@/utils/baseResponse.utils";
import { logger } from "@/utils/logger.utils";
import { Request, Response } from "express";

export const createUnitMaster = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createUnitMaster::controller");
  const input = req.body as UnitMasterReq;

  const unitMaster = await unitMasterService.createUnitMaster(input);
  const response = BaseResponse.success({ type: "CREATED", data: unitMaster }, "Unit Master");
  logger.info("exiting::createUnitMaster::controller");
  return res.status(201).json(response);
});

export const updateUnitMaster = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateUnitMaster::controller");
  const input = req.body as UnitMasterUpdate;

  const updateUnitMaster = await unitMasterService.updateUnitMaster(input);
  logger.info("exiting::updateUnitMaster::controller");
  const response = BaseResponse.success({ type: "UPDATED", data: updateUnitMaster }, "Unit Master");
  return res.status(200).json(response);
});

export const getAllUnitMaster = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllUnitMaster::controller");
  const unitMaster = await unitMasterService.getAllUnitMaster();
  logger.info("exiting::getAllUnitMaster::controller");
  const response = BaseResponse.success({ type: "FETCHED", data: unitMaster }, "Unit Master");
  return res.status(200).json(response);
});

export const getUnitMasterById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getUnitMasterById::controller");
  const { itemUnitId } = req.query as { itemUnitId: string };

  const unitMaster = await unitMasterService.getUnitMasterById(Number(itemUnitId));

  logger.info("exiting::getUnitMasterById::controller");
  const response = BaseResponse.success({ type: "FETCHED", data: unitMaster }, "Unit Master");
  return res.status(200).json(response);
});
