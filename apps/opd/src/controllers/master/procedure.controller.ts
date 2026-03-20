import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { procedureService } from "@/services/master/procedure.service.js";
import {
  CreateProcedureMasterInput,
  FetchProcedureInput,
  UpdateProcedureMasterInput,
} from "@/types/master/procedure.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createProcedure = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createProcedure::controller");
  const input = req.body as CreateProcedureMasterInput;
  const created = await procedureService.createProcedure(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: created },
    "Procedure",
  );
  logger.info("exiting::createProcedure::controller");
  return res.status(201).json(response);
});
export const updateProcedure = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateProcedure::controller");
  const input = req.body as UpdateProcedureMasterInput;
  const updated = await procedureService.updateProcedure(input);
  const response = BaseResponse.success(
    { type: "UPDATED", data: updated },
    "Procedure",
  );
  logger.info("exiting::updateProcedure::controller");
  return res.status(200).json(response);
});
export const getProcedureById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateProcedure::controller");
    const { procedureId } = req.query as { procedureId: string };
    const fetched = await procedureService.getProcedureById(
      Number(procedureId),
    );
    const response = BaseResponse.success(
      { type: "UPDATED", data: fetched },
      "Procedure",
    );
    logger.info("exiting::updateProcedure::controller");
    return res.status(200).json(response);
  },
);

export const fetchProcedure = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::fetchProcedure::controller");
  const input = req.body as FetchProcedureInput;
  const updated = await procedureService.fetchProcedure(input);
  const response = BaseResponse.success(
    { type: "FETCHED", data: updated },
    "Procedure with co pay",
  );
  logger.info("exiting::fetchProcedure::controller");
  return res.status(200).json(response);
});
