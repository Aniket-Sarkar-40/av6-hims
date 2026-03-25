import { toConsumptionDTO } from "@/mapper/consumption/consumption.mapper";
import {
  approveConsumptionInDb,
  createConsumptionInDb,
  deleteConsumptionByIdFromDb,
  getAllConsumptionsFromDb,
  getConsumptionByIdFromDb,
  getConsumptionByUserIdFromDb,
  rejectConsumptionByIdFromDb,
  updateConsumptionInDb,
} from "@/repository/consumption/consumption.repository";
import {
  CommonConsumptionInput,
  ConsumptionApproveInput,
  ConsumptionCreateInput,
  ConsumptionDTO,
  ConsumptionUpdateInput,
} from "@/types/consumption/consumption";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import {
  approveConsumptionServiceValidation,
  createConsumptionServiceValidation,
  deleteConsumptionServiceValidation,
  getConsumptionByUserIdServiceValidation,
  rejectConsumptionServiceValidation,
  updateConsumptionServiceValidation,
} from "@/validations/service/consumption/consumption.service.validation";

export const consumptionService = {
  async createConsumption(input: ConsumptionCreateInput): Promise<ConsumptionDTO> {
    logger.info("entering::createConsumption::service");
    await createConsumptionServiceValidation(input);
    const consumption = await createConsumptionInDb(input);
    logger.info("exiting::createConsumption::service");
    return await toConsumptionDTO(consumption);
  },
  async updateConsumption(input: ConsumptionUpdateInput): Promise<ConsumptionDTO> {
    logger.info("entering::updateConsumption::service");
    await updateConsumptionServiceValidation(input);
    const consumption = await updateConsumptionInDb(input);
    logger.info("exiting::updateConsumption::service");
    return await toConsumptionDTO(consumption);
  },
  async getConsumptionById(id: number, canNullReturnable = false): Promise<ConsumptionDTO | null> {
    logger.info("entering::getConsumptionById::service");
    const consumption = await getConsumptionByIdFromDb(id);

    if (!consumption) {
      if (!canNullReturnable) {
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Consumption"));
      } else return null;
    }
    logger.info("exiting::getConsumptionById::service");
    return await toConsumptionDTO(consumption);
  },
  async getAllConsumption(): Promise<ConsumptionDTO[]> {
    logger.info("entering::getAllConsumption::service");
    const consumption = await getAllConsumptionsFromDb();
    logger.info("exiting::getAllConsumption::service");
    return await Promise.all(consumption.map((item) => toConsumptionDTO(item)));
  },
  async deleteConsumptionById(input: CommonConsumptionInput) {
    logger.info("entering::deleteConsumptionById::service");
    await deleteConsumptionServiceValidation(input);
    await deleteConsumptionByIdFromDb(input.id);
    logger.info("exiting::deleteConsumptionById::service");
  },
  async approveConsumption(input: ConsumptionApproveInput): Promise<ConsumptionDTO> {
    logger.info("entering::approveConsumption::service");
    await approveConsumptionServiceValidation(input);
    const consumption = await approveConsumptionInDb(input);
    logger.info("exiting::approveConsumption::service");
    return await toConsumptionDTO(consumption);
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
    return await Promise.all(consumption.map((item) => toConsumptionDTO(item)));
  },
};
