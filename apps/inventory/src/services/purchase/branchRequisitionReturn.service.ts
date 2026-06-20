import { toBranchRequisitionReturnDTO } from "@/mapper/purchase/branchRequisitionReturn.mapper.js";
import {
  createBranchRequisitionReturnInDb,
  deleteBranchRequisitionReturnFromDb,
  getAllBranchRequisitionReturnFromDb,
  getBranchRequisitionReturnByIdFromDb,
  updateBranchRequisitionReturnInDb,
  acknowledgeBranchRequisitionReturn as acknowledgeBranchRequisitionReturnInDb,
  rejectBranchRequisitionReturn as rejectBranchRequisitionReturnInDb,
  approveBranchRequisitionReturn as approveBranchRequisitionReturnInDb,
} from "@/repository/purchase/branchRequisitionReturn.repository.js";
import {
  AcknowledgeBranchRequisitionReturn,
  ApproveBranchReqReturnInput,
  CreateBranchRequisitionReturnInput,
  RejectBranchRequisitionReturnInput,
} from "@/types/purchase/branchRequisitionReturn.js";
import {
  acknowledgeBranchRequisitionReturnServiceValidation,
  approveBranchRequisitionReturnServiceValidation,
  createBranchRequisitionReturnServiceValidation,
  deleteBranchRequisitionReturnServiceValidation,
  rejectBranchRequisitionReturnServiceValidation,
  updateBranchRequisitionReturnServiceValidation,
} from "@/validations/service/purchase/branchRequisitionReturn.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const branchRequisitionReturnService = {
  async createBranchRequisitionReturn(
    input: CreateBranchRequisitionReturnInput
  ) {
    logger.info("entering::createBranchRequisitionReturn::service");

    await createBranchRequisitionReturnServiceValidation(input);

    const created = await createBranchRequisitionReturnInDb(input);

    logger.info("exiting::createBranchRequisitionReturn::service");
    return created;
  },

  async updateBranchRequisitionReturn(
    input: CreateBranchRequisitionReturnInput
  ) {
    logger.info("entering::updateBranchRequisitionReturn::service");

    await updateBranchRequisitionReturnServiceValidation(input);

    const updated = await updateBranchRequisitionReturnInDb(input);

    logger.info("exiting::updateBranchRequisitionReturn::service");
    return updated;
  },

  async getAllBranchRequisitionReturn() {
    logger.info("entering::getAllBranchRequisitionReturn::service");

    const records = await getAllBranchRequisitionReturnFromDb();

    if (records.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Branch Requisition Return")
      );
    }

    const dto = await Promise.all(
      records.map((brr) => toBranchRequisitionReturnDTO(brr))
    );

    logger.info("exiting::getAllBranchRequisitionReturn::service");
    return dto;
  },

  async getBranchRequisitionReturnById(id: number) {
    logger.info(`entering::getBranchRequisitionReturnById::service id=${id}`);

    validIdCheck(id);

    const brr = await getBranchRequisitionReturnByIdFromDb(id);
    if (!brr) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Branch Requisition Return")
      );
    }

    const dto = await toBranchRequisitionReturnDTO(brr);

    logger.info(`exiting::getBranchRequisitionReturnById::service id=${id}`);
    return dto;
  },

  async deleteBranchRequisitionReturn(id: number): Promise<void> {
    logger.info(`entering::deleteBranchRequisitionReturn::service id=${id}`);

    await deleteBranchRequisitionReturnServiceValidation(id);

    await deleteBranchRequisitionReturnFromDb(id);

    logger.info(`exiting::deleteBranchRequisitionReturn::service id=${id}`);
  },

  async rejectBranchRequisitionReturn(
    input: RejectBranchRequisitionReturnInput
  ): Promise<void> {
    logger.info(
      `entering::rejectBranchRequisitionReturn::service id=${input.id}`
    );

    await rejectBranchRequisitionReturnServiceValidation(input);

    await rejectBranchRequisitionReturnInDb(input);

    logger.info(
      `exiting::rejectBranchRequisitionReturn::service id=${input.id}`
    );
  },

  async approveBranchRequisitionReturn(
    input: ApproveBranchReqReturnInput
  ): Promise<void> {
    logger.info(
      `entering::approveBranchRequisitionReturn::service id=${input.id}`
    );

    await approveBranchRequisitionReturnServiceValidation(input);

    await approveBranchRequisitionReturnInDb(input);

    logger.info(
      `exiting::approveBranchRequisitionReturn::service id=${input.id}`
    );
  },

  async acknowledgeBranchRequisitionReturn(
    input: AcknowledgeBranchRequisitionReturn
  ): Promise<void> {
    logger.info(
      `entering::acknowledgeBranchRequisitionReturn::service id=${input.id}`
    );

    await acknowledgeBranchRequisitionReturnServiceValidation(input);

    await acknowledgeBranchRequisitionReturnInDb(input);

    logger.info(
      `exiting::acknowledgeBranchRequisitionReturn::service id=${input.id}`
    );
  },
};
