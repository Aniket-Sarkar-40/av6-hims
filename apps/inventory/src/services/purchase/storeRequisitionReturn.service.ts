import { toStoreRequisitionReturnDTO } from "@/mapper/purchase/storeRequisitionReturn.mapper.js";
import {
  acknowledgeStoreRequisitionReturn as acknowledgeStoreRequisitionReturnInDb,
  approveStoreRequisitionReturn as approveStoreRequisitionReturnInDb,
  createStoreRequisitionReturnInDb,
  deleteStoreRequisitionReturnFromDb,
  getAllStoreRequisitionReturnByFromDb,
  getStoreRequisitionReturnByIdFromDb,
  rejectStoreRequisitionReturn as rejectStoreRequisitionReturnInDb,
  updateStoreRequisitionReturnInDb,
} from "@/repository/purchase/storeRequisitionReturn.repository.js";
import {
  AcknowledgeRequisitionReturn,
  ApproveStoreReqReturnInput,
  CreateStoreRequisitionReturnInput,
  RejectStoreRequisitionReturnInput,
} from "@/types/purchase/storeRequisitionReturn.js";
import {
  acknowledgeStoreRequisitionReturnServiceValidation,
  approveStoreRequisitionReturnServiceValidation,
  createStoreRequisitionReturnServiceValidation,
  deleteStoreRequisitionReturnServiceValidation,
  rejectStoreRequisitionReturnServiceValidation,
  updateStoreRequisitionReturnServiceValidation,
} from "@/validations/service/purchase/storeRequisitionReturn.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const storeRequisitionReturnService = {
  async createStoreRequisitionReturn(input: CreateStoreRequisitionReturnInput) {
    logger.info("entering::createStoreRequisitionReturn::service");

    await createStoreRequisitionReturnServiceValidation(input);

    const created = await createStoreRequisitionReturnInDb(input);

    logger.info("exiting::createStoreRequisitionReturn::service");
    return created;
  },

  async updateStoreRequisitionReturn(input: CreateStoreRequisitionReturnInput) {
    logger.info("entering::updateStoreRequisitionReturn::service");

    await updateStoreRequisitionReturnServiceValidation(input);

    const updated = await updateStoreRequisitionReturnInDb(input);

    logger.info("exiting::updateStoreRequisitionReturn::service");
    return updated;
  },

  async getAllStoreRequisitionReturn() {
    logger.info("entering::getAllStoreRequisitionReturn::service");

    const records = await getAllStoreRequisitionReturnByFromDb();

    if (records.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Store Requisition Return"),
      );
    }

    const dto = await Promise.all(
      records.map((srr) => toStoreRequisitionReturnDTO(srr)),
    );

    logger.info("exiting::getAllStoreRequisitionReturn::service");
    return dto;
  },

  async getStoreRequisitionReturnById(id: number) {
    logger.info(`entering::getStoreRequisitionReturnById::service id=${id}`);

    validIdCheck(id);

    const storeReqReturn = await getStoreRequisitionReturnByIdFromDb(id);
    if (!storeReqReturn) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Store Requisition Return"),
      );
    }

    const dto = await toStoreRequisitionReturnDTO(storeReqReturn);

    logger.info(`exiting::getStoreRequisitionReturnById::service id=${id}`);
    return dto;
  },

  async deleteStoreRequisitionReturn(id: number): Promise<void> {
    logger.info(`entering::deleteStoreRequisitionReturn::service id=${id}`);

    await deleteStoreRequisitionReturnServiceValidation(id);

    await deleteStoreRequisitionReturnFromDb(id);

    logger.info(`exiting::deleteStoreRequisitionReturn::service id=${id}`);
  },

  async rejectStoreRequisitionReturn(
    input: RejectStoreRequisitionReturnInput,
  ): Promise<void> {
    logger.info(
      `entering::rejectStoreRequisitionReturn::service id=${input.id}`,
    );

    await rejectStoreRequisitionReturnServiceValidation(input);

    await rejectStoreRequisitionReturnInDb(input);

    logger.info(
      `exiting::rejectStoreRequisitionReturn::service id=${input.id}`,
    );
  },

  async approveStoreRequisitionReturn(
    input: ApproveStoreReqReturnInput,
  ): Promise<void> {
    logger.info(
      `entering::approveStoreRequisitionReturn::service id=${input.id}`,
    );

    await approveStoreRequisitionReturnServiceValidation(input);

    await approveStoreRequisitionReturnInDb(input);

    logger.info(
      `exiting::approveStoreRequisitionReturn::service id=${input.id}`,
    );
  },

  async acknowledgeStoreRequisitionReturn(
    input: AcknowledgeRequisitionReturn,
  ): Promise<void> {
    logger.info(
      `entering::acknowledgeStoreRequisitionReturn::service id=${input.id}`,
    );

    await acknowledgeStoreRequisitionReturnServiceValidation(input);

    await acknowledgeStoreRequisitionReturnInDb(input);

    logger.info(
      `exiting::acknowledgeStoreRequisitionReturn::service id=${input.id}`,
    );
  },
};
