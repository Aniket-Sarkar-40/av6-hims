import { notifier } from "@/config/core.config.js";
import {
  toBranchRequisitionBatchWiseDTO,
  toBranchRequisitionDTO,
} from "@/mapper/purchase/branchRequisition.mapper.js";
import {
  acknowledgeBranchRequisition,
  approveBranchRequisition,
  createBranchRequisitionInDb,
  deleteBranchRequisitionFromDb,
  getBranchRequisitionBatchWiseFromDb,
  rejectBranchRequisition,
  updateBranchRequisitionInDb,
} from "@/repository/purchase/branchRequisition.repository.js";
import {
  AcknowledgeBranchRequisition,
  ApproveBranchReqInput,
  CreateBranchRequisitionInput,
  RejectBranchRequisitionInput,
} from "@/types/purchase/branchRequisition.js";
import {
  acknowledgeBranchRequisitionServiceValidation,
  approveBranchRequisitionServiceValidation,
  createBranchRequisitionServiceValidation,
  deleteBranchRequisitionServiceValidation,
  rejectBranchRequisitionServiceValidation,
  updateBranchRequisitionServiceValidation,
} from "@/validations/service/purchase/branchRequisition.service.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const branchRequisitionService = {
  async createBranchRequisition(input: CreateBranchRequisitionInput) {
    logger.info("entering::createBranchRequisition::service");

    await createBranchRequisitionServiceValidation(input);

    const createdBranchRequisition = await createBranchRequisitionInDb(input);

    toBranchRequisitionDTO([createdBranchRequisition])
      .then((notificationData) => {
        notifier.emitEvent("BRANCH_REQUISITION_CREATED", {
          service: ServiceCode.INVENTORY,
          data: notificationData,
        });
      })
      .catch((err) => {
        logger.error(err);
      });

    logger.info("exiting::createBranchRequisition::service");
    return createdBranchRequisition;
  },

  async updateBranchRequisition(input: CreateBranchRequisitionInput) {
    logger.info("entering::updateBranchRequisition::service");

    await updateBranchRequisitionServiceValidation(input);

    const updatedBranchReq = await updateBranchRequisitionInDb(input);

    toBranchRequisitionDTO([updatedBranchReq])
      .then((notificationData) => {
        notifier.emitEvent("BRANCH_REQUISITION_UPDATED", {
          service: ServiceCode.INVENTORY,
          data: notificationData,
        });
      })
      .catch((err) => {
        logger.error(err);
      });

    logger.info("exiting::updateBranchRequisition::service");
    return updatedBranchReq;
  },

  async deleteBranchRequisition(id: number) {
    logger.info("entering::deleteBranchRequisition::service");

    await deleteBranchRequisitionServiceValidation(id);

    await deleteBranchRequisitionFromDb(id);

    logger.info("exiting::deleteBranchRequisition::service");
  },

  async rejectBranchRequisition(input: RejectBranchRequisitionInput) {
    logger.info("entering::rejectBranchRequisition::service");

    await rejectBranchRequisitionServiceValidation(input);

    await rejectBranchRequisition(input);

    logger.info("exiting::rejectBranchRequisition::service");
  },

  async approveBranchRequisition(input: ApproveBranchReqInput) {
    logger.info("entering::approveBranchRequisition::service");

    await approveBranchRequisitionServiceValidation(input);

    await approveBranchRequisition(input);

    logger.info("exiting::approveBranchRequisition::service");
  },

  async acknowledgeBranchRequisition(input: AcknowledgeBranchRequisition) {
    logger.info("entering::acknowledgeBranchRequisition::service");

    await acknowledgeBranchRequisitionServiceValidation(input);

    await acknowledgeBranchRequisition(input);

    logger.info("exiting::acknowledgeBranchRequisition::service");
  },

  async getBranchRequisitionBatchWiseById(id: number) {
    logger.info(
      "entering::getBranchRequisitionBatchWiseById::service id=" + id
    );

    validIdCheck(id);
    const branchReq = await getBranchRequisitionBatchWiseFromDb(id);
    if (!branchReq) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Branch Requisition")
      );
    }

    const dto = await toBranchRequisitionBatchWiseDTO(branchReq);

    logger.info("exiting::getBranchRequisitionBatchWiseById::service id=" + id);
    return dto;
  },
};
