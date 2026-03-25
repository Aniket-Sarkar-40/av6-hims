import { toStoreRequisitionReturnDTO } from "@/mapper/purchase/storeRequisitionReturn.mapper.js";
import {
  acknowledgeStoreRequisitionReturn,
  approveStoreRequisitionReturn,
  createStoreRequisitionReturnInDb,
  deleteStoreRequisitionReturnFromDb,
  getAllStoreRequisitionReturnByFromDb,
  getStoreRequisitionReturnByIdFromDb,
  rejectStoreRequisitionReturn,
  updateStoreRequisitionReturnInDb,
} from "@/repository/purchase/requisitionReturn.repository.js";
import {
  AcknowledgeRequisitionReturn,
  ApproveStoreReqReturnInput,
  CreateStoreRequisitionReturnInput,
  RejectStoreRequisitionReturnInput,
} from "@/types/purchase/requisitionReturn.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  acknowledgeStoreRequisitionReturnServiceValidation,
  approveStoreRequisitionReturnServiceValidation,
  createStoreRequisitionReturnServiceValidation,
  deleteStoreRequisitionReturnServiceValidation,
  rejectStoreRequisitionReturnServiceValidation,
  updateStoreRequisitionReturnServiceValidation,
} from "@/validations/service/purchase/storeRequisitionReturn.service.validation.js";

export const storeRequisitionReturnService = {
  async createStoreRequisitionReturn(input: CreateStoreRequisitionReturnInput) {
    logger.info("entering::createStore Requisition::service");
    await createStoreRequisitionReturnServiceValidation(input);
    const createStoreRequisition =
      await createStoreRequisitionReturnInDb(input);

    logger.info("exiting::createStore Requisition::service");
    return createStoreRequisition;
  },

  async updateStoreRequisitionReturn(input: CreateStoreRequisitionReturnInput) {
    logger.info("entering::updateStoreRequisition::service");

    await updateStoreRequisitionReturnServiceValidation(input);

    const updatedStoreReq = await updateStoreRequisitionReturnInDb(input);

    logger.info("exiting::updateStoreRequisition::service");
    return updatedStoreReq;
  },

  async getAllStoreRequisitionReturn() {
    logger.info("entering::getAllStoreRequisitionReturn::service");

    const records = await getAllStoreRequisitionReturnByFromDb();
    if (records.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "store Requisition Return"),
      );
    }

    const dto = await Promise.all(
      records.map(async (sr) => {
        return toStoreRequisitionReturnDTO(sr);
      }),
    );

    logger.info("exiting::getAllStoreRequisitionReturn::service");
    return dto;
  },

  async getStoreRequisitionReturnById(id: number) {
    logger.info("entering::getStoreRequisitionReturnById::service id=" + id);

    validIdCheck(id);
    const storeReq = await getStoreRequisitionReturnByIdFromDb(id);
    if (!storeReq) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Store Requisition Return"),
      );
    }

    const dto = await toStoreRequisitionReturnDTO(storeReq);

    logger.info("exiting::getStoreRequisitionReturnById::service id=" + id);
    return dto;
  },

  async deleteStoreRequisitionReturn(id: number): Promise<void> {
    logger.info("entering::deleteStoreRequisition::service id=" + id);

    await deleteStoreRequisitionReturnServiceValidation(id);

    await deleteStoreRequisitionReturnFromDb(id);
    logger.info("exiting::deleteStoreRequisitionReturn::service id=" + id);
  },

  async rejectStoreRequisitionReturn(
    input: RejectStoreRequisitionReturnInput,
  ): Promise<void> {
    logger.info(
      "entering::rejectStoreRequisitionReturn::service id=" + input.id,
    );

    await rejectStoreRequisitionReturnServiceValidation(input);

    await rejectStoreRequisitionReturn(input);
    logger.info(
      "exiting::rejectStoreRequisitionReturn::service id=" + input.id,
    );
  },

  async approveStoreRequisitionReturn(
    input: ApproveStoreReqReturnInput,
  ): Promise<void> {
    logger.info("entering::approveStoreRequisitionReturn::service");

    await approveStoreRequisitionReturnServiceValidation(input);

    await approveStoreRequisitionReturn(input);
    logger.info("exiting::approveStoreRequisitionReturn::service");
  },

  async acknowledgeStoreRequisitionReturn(
    input: AcknowledgeRequisitionReturn,
  ): Promise<void> {
    logger.info("entering::acknowledgeStoreRequisition::service");

    await acknowledgeStoreRequisitionReturnServiceValidation(input);

    await acknowledgeStoreRequisitionReturn(input);
    logger.info("exiting::acknowledgeStoreRequisition::service");
  },
};
