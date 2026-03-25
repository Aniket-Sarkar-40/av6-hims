import { toInsuranceDto } from "@/mapper/insurance/insurance.mapper.js";
import {
  createInsuranceInDb,
  deleteInsuranceFromDb,
  getAllInsuranceFromDb,
  getInsuranceByIdFromDb,
  updateInsuranceInDb,
} from "@/repository/insurance/insurance.repository.js";
import { InsuranceReq } from "@/types/insurance/insurance.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createInsuranceServiceValidation,
  deleteInsuranceServiceValidation,
  updateInsuranceServiceValidation,
} from "@/validations/service/insurance/insurance.service.validation.js";

export const insuranceService = {
  async createInsurance(input: InsuranceReq) {
    logger.info("entering::createInsurance::service");
    await createInsuranceServiceValidation(input);
    const createInsurance = await createInsuranceInDb(input);

    logger.info("exiting::createInsurance::service");
    return createInsurance;
  },

  async updateInsurance(id: number, input: InsuranceReq) {
    logger.info("entering::updateInsurance::service");

    await updateInsuranceServiceValidation(input);

    const updatedPO = await updateInsuranceInDb(id, input);

    logger.info("exiting::updateInsurance::service");
    return updatedPO;
  },

  async getAllInsurance() {
    logger.info("entering::getAllInsurance::service");

    const records = await getAllInsuranceFromDb();
    if (records.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "insurance"),
      );
    }

    const dto = records.map(toInsuranceDto);

    logger.info("exiting::getAllInsurance::service");
    return dto;
  },

  async getInsuranceById(
    id: number,
    canNullReturnable = false,
  ): Promise<InsuranceReq | null> {
    logger.info(`entering::getInsuranceById::service id=${id}`);

    validIdCheck(id);

    const insurance = await getInsuranceByIdFromDb(id);

    if (!insurance) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "insurance"),
        );
      }
      logger.warn(
        `insurance with id=${id} not found, returning null as requested.`,
      );
      return null;
    }

    const dto: InsuranceReq = toInsuranceDto(insurance);

    logger.info(`exiting::getInsuranceById::service id=${id}`);
    return dto;
  },

  async deleteInsurance(id: number): Promise<void> {
    logger.info("entering::deleteInsurance::service id=" + id);

    await deleteInsuranceServiceValidation(id);

    await deleteInsuranceFromDb(id);
    logger.info("exiting::deleteInsurance::service id=" + id);
  },
};
