import { TryCatch } from "@repo/platform";
import { medInstructionService } from "@/services/master/medInstruction.service.js";
import { InstructionName } from "@/types/master/dropDownName.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const instructionCreate = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::instructionCreate::controller");
    const name = req.body as InstructionName;
    const createMedInstruction =
      await medInstructionService.createMedInstruction(name);
    logger.info("exiting::instructionCreate::controller");
    return res.status(201).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("CREATED", "Medicine Instruction"),
        },
        createMedInstruction,
      ),
    );
  },
);

export const medInstructionGet = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::medInstructionGet::controller");
    const medInstruction = await medInstructionService.getAllMedInstruction();
    logger.info("exiting::medInstructionGet::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Medicine Instruction"),
        },
        medInstruction,
      ),
    );
  },
);

export const getMedInstructionById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getMedInstructionById::controller");
    const { medInstructionId } = req.query as { medInstructionId: string };
    const medInstruction = await medInstructionService.getMedInstructionById(
      Number(medInstructionId),
    );

    if (!medInstruction) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
        }),
      );
    }
    logger.info("exiting::getMedInstructionById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Medicine Instruction"),
        },
        medInstruction,
      ),
    );
  },
);

export const updateMedInstruction = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateMedInstruction::controller");
    const medInstruction = req.body as InstructionName;
    const updatedMedInstruction =
      await medInstructionService.updateMedInstruction(medInstruction);
    logger.info("exiting::updateMedInstruction::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Medicine Instruction"),
        },
        updatedMedInstruction,
      ),
    );
  },
);
