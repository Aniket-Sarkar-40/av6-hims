import {
  createTemplateInDb,
  getAllTemplateFromDb,
  getTemplateByIdFromDb,
  updateTemplateInDb,
} from "@/repository/event/template.repository.js";
import { CreateOrUpdateTemplate } from "@/types/event/template.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/core.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { templateServiceValidation } from "@/validations/service/event/template.service.validation.js";
import { Template } from "@repo/db/generated/prisma/client";
import { checkIsCacheable } from "@/config/cache.config.js";

const cacheKey = getRedisKey("TEMPLATE", "all");

export const templateService = {
  async createTemplate(input: CreateOrUpdateTemplate): Promise<Template> {
    logger.info("entering::createTemplate::service");
    await templateServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.TEMPLATE);

    const template = await createTemplateInDb(input);

    if (isCacheable) {
      await addToCache(cacheKey, template.id, template);
    }
    logger.info("exiting::createTemplate::service");
    return template;
  },

  async getAllTemplates(
    canNullReturnable: boolean = false
  ): Promise<Template[]> {
    logger.info("entering::getAllTemplates::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.TEMPLATE);
    let rows: Template[] = [];

    if (isCacheable) {
      rows = (await getAllCache(cacheKey)) as Template[];
    } else {
      rows = await getAllTemplateFromDb();
    }

    logger.info("exiting::getAllTemplates::service");
    if (!rows) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Service Event")
        );
      }
    }
    return rows;
  },

  async getTemplateById(
    id: number,
    canNullReturnable: boolean = false
  ): Promise<Template | null> {
    logger.info("entering::getTemplateById::service");
    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.TEMPLATE);
    let row: Template | null = null;

    if (isCacheable) {
      row = (await getCacheById(cacheKey, id)) as Template | null;
    } else {
      row = await getTemplateByIdFromDb(id);
    }

    if (!row) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Service Event")
        );
      }
    }

    logger.info("exiting::getTemplateById::service");
    return row;
  },
  async updateTemplate(input: CreateOrUpdateTemplate): Promise<Template> {
    logger.info("entering::updateTemplate::service");

    await templateServiceValidation(input);

    const isCacheable = await checkIsCacheable(SHORT_CODE.TEMPLATE);

    const updatedTemplate = await updateTemplateInDb(input);

    if (isCacheable) {
      await updateCache(cacheKey, updatedTemplate.id, updatedTemplate);
    }

    logger.info("exiting::updateTemplate::service");
    return updatedTemplate;
  },
};
