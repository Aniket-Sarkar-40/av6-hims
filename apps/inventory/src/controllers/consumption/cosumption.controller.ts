import { TryCatch } from "@/middlewares/error.middleware";
import { consumptionService } from "@/services/consumption/consumption.service";
import { BaseResponse } from "@/utils/baseResponse.utils";
import { logger } from "@/utils/logger.utils";
import { Request, Response } from "express";

export const createConsumption = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createConsumption::controller");
  const input = req.body;
  const createdConsumption = await consumptionService.createConsumption(input);
  logger.info("exiting::createConsumption::controller");
  const response = BaseResponse.success({ type: "CREATED", data: createdConsumption }, "Consumption");
  return res.status(201).json(response);
});

export const updateConsumption = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateConsumption::controller");
  const input = req.body;
  const updatedConsumption = await consumptionService.updateConsumption(input);
  logger.info("exiting::updateConsumption::controller");
  const response = BaseResponse.success({ type: "UPDATED", data: updatedConsumption }, "Consumption");
  return res.status(200).json(response);
});
export const getAllConsumption = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllConsumption::controller");
  const consumption = await consumptionService.getAllConsumption();
  logger.info("exiting::getAllConsumption::controller");
  const response = BaseResponse.success({ type: "FETCHED", data: consumption }, "Consumption");
  return res.status(200).json(response);
});
export const approveConsumption = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateConsumption::controller");
  const input = req.body;
  const approvedConsumption = await consumptionService.approveConsumption(input);
  logger.info("exiting::updateConsumption::controller");
  const response = BaseResponse.success({ type: "APPROVED", data: approvedConsumption }, "Consumption");
  return res.status(200).json(response);
});
export const rejectConsumption = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::rejectConsumption::controller");
  const input = req.body;
  await consumptionService.rejectConsumptionById(input);
  logger.info("exiting::rejectConsumption::controller");
  const response = BaseResponse.success({ type: "REJECTED" }, "Consumption");
  return res.status(200).json(response);
});
export const getConsumptionById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getConsumptionById::controller");
  const { consumptionId } = req.query as { consumptionId: string };
  if (!consumptionId) {
    return res.status(400).json(BaseResponse.error({ message: "consumptionId is required" }));
  }
  const consumption = await consumptionService.getConsumptionById(Number(consumptionId));
  logger.info("exiting::getConsumptionById::controller");
  const response = BaseResponse.success({ type: "FETCHED", data: consumption }, "Consumption");
  return res.status(200).json(response);
});
export const deleteConsumptionById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteConsumptionById::controller");
  const input = req.body;
  await consumptionService.deleteConsumptionById(input);
  logger.info("exiting::deleteConsumptionById::controller");
  const response = BaseResponse.success({ type: "DELETED" }, "Consumption");
  return res.status(200).json(response);
});

export const getConsumptionByUserId = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getConsumptionByUserId::controller");
  const { userId } = req.query as { userId: string };
  if (!userId) {
    return res.status(400).json(BaseResponse.error({ message: "userId is required" }));
  }
  const consumption = await consumptionService.getConsumptionByUserId(Number(userId));
  logger.info("exiting::getConsumptionByUserId::controller");
  const response = BaseResponse.success({ type: "FETCHED", data: consumption }, "Consumption");
  return res.status(200).json(response);
});
