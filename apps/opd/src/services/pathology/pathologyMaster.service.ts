import { toPathologyMasterDTO } from "@/mapper/pathology/pathologyMaster.mapper.js";
import { getPathologyMasterByIdFromDb } from "@/repository/pathology/pathologyMaster.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const pathologyMasterService = {
  async getPathologyMasterById(id: number, canNullReturnable: boolean = false) {
    logger.info("entering::getPathologyMasterById::service");
    const response = await getPathologyMasterByIdFromDb(id);
    logger.info("exiting::getPathologyMasterById::service");
    if (!response) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Pathology Master"),
        );
      }
      return null;
    }
    return toPathologyMasterDTO(response);
  },
};
