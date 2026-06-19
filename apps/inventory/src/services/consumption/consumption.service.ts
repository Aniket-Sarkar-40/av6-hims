import { toConsumptionDTO } from "@/mapper/consumption/consumption.mapper.js";
import {
  createConsumptionInDb,
  getAllConsumptionsFromDb,
  getConsumptionByIdFromDb,
  getConsumptionByUserIdFromDb,
} from "@/repository/consumption/consumption.repository.js";
import {
  ConsumptionCreateInput,
  ConsumptionDTO,
} from "@/types/consumption/consumption.js";
import {
  createConsumptionServiceValidation,
  getConsumptionByUserIdServiceValidation,
} from "@/validations/service/consumption/consumption.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const consumptionService = {
  async createConsumption(input: ConsumptionCreateInput) {
    logger.info("entering::createConsumption::service");
    await createConsumptionServiceValidation(input);
    const consumption = await createConsumptionInDb(input);

    logger.info("exiting::createConsumption::service");

    return consumption;
  },

  async getConsumptionById(
    id: number,
    canNullReturnable = false
  ): Promise<ConsumptionDTO | null> {
    logger.info("entering::getConsumptionById::service");
    const consumption = await getConsumptionByIdFromDb(id);

    if (!consumption) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Consumption")
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

  async getConsumptionByUserId(userId: number): Promise<ConsumptionDTO[]> {
    logger.info("entering::getConsumptionByUserId::service");
    await getConsumptionByUserIdServiceValidation(userId);
    const consumption = await getConsumptionByUserIdFromDb(userId);
    logger.info("exiting::getConsumptionByUserId::service");
    const consumptionDTO = await toConsumptionDTO(consumption);
    return consumptionDTO;
  },
};
