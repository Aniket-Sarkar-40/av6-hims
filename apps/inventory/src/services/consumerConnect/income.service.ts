// src/services/master/incomeHead.service.ts

import { toIncomeDTO } from "@/mapper/consumerConnect/income.mapper.js";
import {
  createIncomeInDb,
  deleteIncomeInDb,
  getAllIncomeFromDb,
  getIncomeByIdFromDb,
  updateIncomeInDb,
} from "@/repository/consumerConnect/income.repository.js";
import { CreateIncomeInput, IncomeDTO } from "@/types/consumerConnect/income.js";
import ErrorHandler from "@/utils/errorHandler.utils.js";
import { logger } from "@/utils/logger.utils.js";
import { generateErrorMessage } from "@/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  createIncomeServiceValidation,
  updateIncomerServiceValidation,
  validateIdIncome,
} from "@/validations/service/consumerConnect/income.service.validation.js";

export const incomeService = {
  async createIncome(input: CreateIncomeInput): Promise<IncomeDTO> {
    logger.info("entering::createIncomeHead::service");
    await createIncomeServiceValidation(input);

    const income = await createIncomeInDb(input);

    const IncomeDTO: IncomeDTO = await toIncomeDTO(income);
    logger.info("exiting::createIncomeHead::service");
    return IncomeDTO;
  },
  async updateIncome(id: number, input: CreateIncomeInput): Promise<IncomeDTO> {
    logger.info("entering::updateIncomeHead::service");

    await updateIncomerServiceValidation(id, input);

    const updatedIncome = await updateIncomeInDb(id, input);

    logger.info("exiting::updateIncomeHead::service");

    // Map to IncomeDTO before returning
    const incomeDTO: IncomeDTO = await toIncomeDTO(updatedIncome);
    return incomeDTO;
  },

  async getAllIncome(): Promise<IncomeDTO[]> {
    logger.info("entering::getAllIncome::service");

    const all = await getAllIncomeFromDb();
    if (all.length === 0) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Income"));
    }

    logger.info("exiting::getAllIncome::service");
    const allDTO: IncomeDTO[] = await Promise.all(all.map(toIncomeDTO));
    return allDTO;
  },

  async getIncomeById(incomeId: number, canNullReturnable: boolean = false): Promise<IncomeDTO | null> {
    logger.info("entering::getIncomeById::service");

    validIdCheck(incomeId);

    const record = await getIncomeByIdFromDb(incomeId);

    if (!record) {
      if (!canNullReturnable) {
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Income"));
      }
      return null;
    }

    logger.info("exiting::getIncomeById::service with record");
    const incomeDTO: IncomeDTO = await toIncomeDTO(record);
    return incomeDTO;
  },
  async deleteIncome(incomeId: number): Promise<void> {
    logger.info("entering::deleteIncome::service");

    await validateIdIncome(incomeId);

    await deleteIncomeInDb(incomeId);

    logger.info("exiting::deleteIncome::service");
  },
};
