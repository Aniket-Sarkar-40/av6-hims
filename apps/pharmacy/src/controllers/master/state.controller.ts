import { TryCatch } from "@repo/platform";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { stateService } from "@/services/master/state.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { UpdateStateInput } from "@/types/master/state.js";

export const createState = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createState::controller");
  const { name, countryId } = req.body;
  const state = await stateService.createState({ name, countryId });
  const response = new BaseResponse(
    { success: true, message: generateSuccessMessage("CREATED", "State") },
    state,
  );
  logger.info("exiting::createState::controller");
  return res.status(201).json(response);
});

export const getAllStates = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getState::controller");
  const states = await stateService.getAllStates();
  logger.info("exiting::getState::controller");
  return res
    .status(200)
    .json(
      new BaseResponse(
        { success: true, message: generateSuccessMessage("FETCHED", "States") },
        states,
      ),
    );
});

export const getStateById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getStateById::controller");
  const { stateId } = req.params;
  const state = await stateService.getStateById(Number(stateId));

  if (!state) {
    return res.status(404).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  logger.info("exiting::getStateById::controller");
  return res
    .status(200)
    .json(
      new BaseResponse(
        { success: true, message: generateSuccessMessage("FETCHED", "State") },
        state,
      ),
    );
});

export const updateState = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateState::controller");
  const data = req.body as UpdateStateInput;
  const updatedState = await stateService.updateState(data);
  logger.info("exiting::updateState::controller");
  return res
    .status(200)
    .json(
      new BaseResponse(
        { success: true, message: generateSuccessMessage("UPDATED", "State") },
        updatedState,
      ),
    );
});

export const deleteState = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteState::controller");
  const { stateId } = req.params;
  await stateService.deleteState(Number(stateId));
  logger.info("exiting::deleteState::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("DELETED", "State"),
    }),
  );
});
