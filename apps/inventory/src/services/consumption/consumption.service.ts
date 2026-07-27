import { toConsumptionDTO } from "@/mapper/consumption/consumption.mapper.js";
import {
  approveConsumptionInDb,
  createConsumptionInDb,
  deleteConsumptionByIdFromDb,
  getAllConsumptionsFromDb,
  getConsumptionByIdFromDb,
  getConsumptionByUserIdFromDb,
  rejectConsumptionByIdFromDb,
  updateConsumptionInDb,
} from "@/repository/consumption/consumption.repository.js";
import {
  CommonConsumptionInput,
  ConsumptionApproveInput,
  ConsumptionCreateInput,
  ConsumptionDTO,
  ConsumptionUpdateInput,
} from "@/types/consumption/consumption.js";
import {
  approveConsumptionServiceValidation,
  createConsumptionServiceValidation,
  deleteConsumptionServiceValidation,
  getConsumptionByUserIdServiceValidation,
  rejectConsumptionServiceValidation,
  updateConsumptionServiceValidation,
} from "@/validations/service/consumption/consumption.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const consumptionService = {
  async createConsumption(
    input: ConsumptionCreateInput,
  ): Promise<ConsumptionDTO> {
    logger.info("entering::createConsumption::service");
    await createConsumptionServiceValidation(input);
    const consumption = await createConsumptionInDb(input);
    const createdConsumption = await toConsumptionDTO([consumption]);
    logger.info("exiting::createConsumption::service");
    return createdConsumption[0];
  },
  async updateConsumption(
    input: ConsumptionUpdateInput,
  ): Promise<ConsumptionDTO> {
    logger.info("entering::updateConsumption::service");
    await updateConsumptionServiceValidation(input);
    const consumption = await updateConsumptionInDb(input);
    const updatedConsumption = await toConsumptionDTO([consumption]);
    logger.info("exiting::updateConsumption::service");
    return updatedConsumption[0];
  },

  async getConsumptionById(
    id: number,
    canNullReturnable = false,
  ): Promise<ConsumptionDTO | null> {
    logger.info("entering::getConsumptionById::service");
    const consumption = await getConsumptionByIdFromDb(id);

    if (!consumption) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Consumption"),
        );
      } else return null;
    }
    logger.info("exiting::getConsumptionById::service");
    const consumptionDTO = await toConsumptionDTO([consumption]);
    return consumptionDTO[0];
  },
  async getAllConsumption(): Promise<ConsumptionDTO[]> {
    logger.info("entering::getAllConsumption::service");
    const consumption = await getAllConsumptionsFromDb();
    const consumptionDTO = await toConsumptionDTO(consumption);
    logger.info("exiting::getAllConsumption::service");
    return consumptionDTO;
  },

  async deleteConsumptionById(input: CommonConsumptionInput) {
    logger.info("entering::deleteConsumptionById::service");
    await deleteConsumptionServiceValidation(input);
    await deleteConsumptionByIdFromDb(input.id);
    logger.info("exiting::deleteConsumptionById::service");
  },
  async approveConsumption(
    input: ConsumptionApproveInput,
  ): Promise<ConsumptionDTO> {
    logger.info("entering::approveConsumption::service");
    await approveConsumptionServiceValidation(input);
    const consumption = await approveConsumptionInDb(input);
    const consumptionDTO = await toConsumptionDTO([consumption]);
    logger.info("exiting::approveConsumption::service");
    return consumptionDTO[0];
  },
  async rejectConsumptionById(input: CommonConsumptionInput) {
    logger.info("entering::rejectConsumptionById::service");
    await rejectConsumptionServiceValidation(input);
    await rejectConsumptionByIdFromDb(input);
    logger.info("exiting::rejectConsumptionById::service");
  },

  async getConsumptionByUserId(userId: number): Promise<ConsumptionDTO[]> {
    logger.info("entering::getConsumptionByUserId::service");
    await getConsumptionByUserIdServiceValidation(userId);
    const consumption = await getConsumptionByUserIdFromDb(userId);
    logger.info("exiting::getConsumptionByUserId::service");
    const consumptionDTO = await toConsumptionDTO(consumption);
    return consumptionDTO;
  },
};
