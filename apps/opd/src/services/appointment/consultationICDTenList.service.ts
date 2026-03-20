import {
  createConsultationICDTenListInDb,
  getConsultationICDTenListByIdFromDb,
  updateConsultationICDTenListInDb,
} from "@/repository/appointment/consultationICDTenList.repository.js";
import { CreateOrUpdateConsultationICDTenList } from "@/types/appointment/consultationICDTenList.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  createConsultationICDTenListServiceValidation,
  updateIdConsultationICDTenListServiceValidation,
} from "@/validations/service/appointment/consultationICDTenList.service.validation.js";

export const consultationICDTenListService = {
  async createConsultationICDTenList(
    input: CreateOrUpdateConsultationICDTenList,
  ) {
    logger.info("entering::createConsultationICDTenList::service");

    await createConsultationICDTenListServiceValidation(input);

    const created = await createConsultationICDTenListInDb(input);

    logger.info("exiting::createConsultationICDTenList::service");
    return created;
  },

  async getConsultationICDTenListById(
    id: number,
    canNullReturnable: boolean = false,
  ) {
    logger.info("entering::getConsultationICDTenListById::service");

    validIdCheck(id);

    const row = await getConsultationICDTenListByIdFromDb(id);

    if (!row) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Consultation ICD Ten List"),
        );
      else return null;
    }

    logger.info("exiting::getConsultationICDTenListById::service");
    return row;
  },

  async updateConsultationICDTenList(
    input: CreateOrUpdateConsultationICDTenList,
  ) {
    logger.info("entering::updateConsultationICDTenList::service");
    await updateIdConsultationICDTenListServiceValidation(input);

    const updated = await updateConsultationICDTenListInDb(input);

    logger.info("exiting::updateConsultationICDTenList::service");

    return updated;
  },
};
