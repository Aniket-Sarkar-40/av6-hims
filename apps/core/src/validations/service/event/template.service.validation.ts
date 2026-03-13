import { getByUnique } from "@/repository/common.repository.js";
import { templateService } from "@/services/event/template.service.js";
import { CreateOrUpdateTemplate } from "@/types/event/template.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { Prisma, Template } from "@repo/db/generated/prisma/client";
import { validIdEventConfig } from "./eventConfig.service.validation.js";

export const validIdTemplate = async (id: number): Promise<Template> => {
  logger.info("entering::validIdTemplate::service::validation");

  validIdCheck(id);

  const row = await templateService.getTemplateById(id, true);
  if (!row) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Template"));
  }
  logger.info("exiting::validIdTemplate::service::validation");

  return row;
};

export const templateServiceValidation = async (
  body: CreateOrUpdateTemplate
) => {
  logger.info("entering::templateServiceValidation::service::validation");

  await validIdEventConfig(body.eventConfigId);

  const orConditions: Prisma.TemplateWhereInput[] = [
    {
      templateName: body.templateName,
    },
    {
      templateType: body.templateType,
      eventConfigId: body.eventConfigId,
    },
  ];
  if (body.templateCode) {
    orConditions.push({
      templateCode: body.templateCode,
    });
  }

  const existingTemplate = await getByUnique({
    model: "Template",
    where: {
      OR: orConditions,
      ...(body.id ? { id: { not: body.id } } : {}),
    },
  });

  if (existingTemplate) {
    if (existingTemplate.templateName === body.templateName) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          `Template with name: ${body.templateName} and type: ${body.templateType} `
        )
      );
    } else if (existingTemplate.templateCode === body.templateCode) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          `Template Code: ${body.templateCode} `
        )
      );
    } else {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          `${body.templateType} Template with Given Notification Config`
        )
      );
    }
  }

  // const eventConfig =

  logger.info("exiting::templateServiceValidation::service::validation");
};
