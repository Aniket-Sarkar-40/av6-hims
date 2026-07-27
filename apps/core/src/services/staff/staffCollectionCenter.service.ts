import { toStaffCollectionCenterDTO } from "@/mapper/staff/staffCollectionCenter.mapper.js";
import {
  createStaffCollectionCenterInDb,
  getStaffCollectionCenterByIdFromDb,
  getStaffCollectionCenterMappingsFromDb,
  updateStaffCollectionCenterInDb,
  deleteStaffCollectionCenterInDb,
} from "@/repository/staff/staffCollectionCenter.repository.js";
import {
  CreateOrUpdateStaffCollectionCenter,
  StaffCollectionCenterDTO,
} from "@/types/staff/staffCollectionCenter.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  createStaffCollectionCenterServiceValidation,
  updateStaffCollectionCenterServiceValidation,
  validateStaffCollectionCenterById,
} from "@/validations/service/staff/staffCollectionCenter.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import { auditProxy } from "@/config/audit.config.js";

const staffCollectionCenterServiceRaw = {
  async createStaffCollectionCenter(
    input: CreateOrUpdateStaffCollectionCenter,
  ) {
    logger.info("entering::createStaffCollectionCenter::service");

    await createStaffCollectionCenterServiceValidation(input);
    await createStaffCollectionCenterInDb(input);

    logger.info("exiting::createStaffCollectionCenter::service");
  },

  async getStaffCollectionCenterById(
    staffCollectionCenterId: number,
    canNullReturnable: boolean = false,
  ): Promise<StaffCollectionCenterDTO | null> {
    logger.info("entering::getStaffCollectionCenterById::service");

    const staffCollectionCenter = await getStaffCollectionCenterByIdFromDb(
      staffCollectionCenterId,
    );

    if (!staffCollectionCenter) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "staffCollectionCenter"),
        );
      }
      return null;
    }

    const staffDTO = await toStaffCollectionCenterDTO(staffCollectionCenter);
    logger.info("exiting::getStaffCollectionCenterById::service");
    return staffDTO;
  },

  async getStaffCollectionCenterMapById(staffId: number): Promise<number[]> {
    logger.info("entering::getStaffCollectionCenterMapById::service");

    const staffCollectionCenterIds =
      await getStaffCollectionCenterMappingsFromDb(staffId);

    if (!staffCollectionCenterIds || staffCollectionCenterIds.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "staffCollectionCenter"),
      );
    }

    logger.info("exiting::getStaffCollectionCenterMapById::service");
    return staffCollectionCenterIds;
  },

  async updateStaffCollectionCenter(
    staffCollectionCenterId: number,
    input: CreateOrUpdateStaffCollectionCenter,
  ): Promise<void> {
    logger.info("entering::updateStaffCollectionCenter::service");
    await updateStaffCollectionCenterServiceValidation(
      input,
      staffCollectionCenterId,
    );

    await updateStaffCollectionCenterInDb(staffCollectionCenterId, input);

    logger.info("exiting::updateStaffCollectionCenter::service");
  },

  async deleteStaffCollectionCenter(
    staffCollectionCenterId: number,
  ): Promise<void> {
    logger.info("entering::deleteStaffCollectionCenter::service");
    await validateStaffCollectionCenterById(staffCollectionCenterId);

    await deleteStaffCollectionCenterInDb(staffCollectionCenterId);

    logger.info("exiting::deleteStaffCollectionCenter::service");
  },
};

export const staffCollectionCenterService = auditProxy.createAuditedService(
  "staffCollectionCenter",
  staffCollectionCenterServiceRaw,
);
