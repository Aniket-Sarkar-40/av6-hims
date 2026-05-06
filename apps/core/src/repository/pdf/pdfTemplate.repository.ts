import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreatePdfTemplateInput,
  GetPdfTemplateByModuleAndTypeInput,
  MakeDefaultPdfTemplateInput,
  UpdatePdfTemplateInput,
} from "@/types/pdf/pdfTemplate.js";
import { logger } from "@repo/platform/logging/logger.js";
import { PdfTemplate } from "@repo/db/generated/prisma/client";
import { omitUndefined } from "@repo/shared/utils/helper.utils.js";

export const createPdfTemplateInDb = async (
  input: CreatePdfTemplateInput
): Promise<PdfTemplate> => {
  logger.info("entering::createPdfTemplateInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.pdfTemplate.updateMany({
        where: {
          module: input.module,
          templateType: input.templateType,
        },
        data: {
          isDefault: false,
          updatedBy: currentUser ?? null,
        },
      });
    }
    const createdTemp = await tx.pdfTemplate.create({
      data: omitUndefined({
        ...input,
        createdBy: currentUser ?? null,
      }),
    });

    return createdTemp;
  });
};

export const updatePdfTemplateInDb = async (
  input: UpdatePdfTemplateInput
): Promise<PdfTemplate> => {
  logger.info("entering::updatePdfTemplateInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id ?? null;
  const { id, ...rest } = input;

  return await db.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.pdfTemplate.updateMany({
        where: {
          module: input.module,
          templateType: input.templateType,
        },
        data: {
          isDefault: false,
          updatedBy: currentUser,
        },
      });
    }
    const updatedTemp = await tx.pdfTemplate.update({
      where: { id },
      data: {
        ...rest,
        updatedBy: currentUser,
      },
    });

    return updatedTemp;
  });
};

export const getPdfTemplateByIdFromDb = async (
  id: number
): Promise<PdfTemplate | null> => {
  logger.info("entering::getPdfTemplateByIdFromDb::repository");
  return db.pdfTemplate.findFirst({
    where: { id, isActive: true },
  });
};

export const getPdfTemplateByNameFromDb = async (
  templateName: string
): Promise<PdfTemplate | null> => {
  logger.info("entering::getPdfTemplateByNameFromDb::repository");
  return db.pdfTemplate.findFirst({
    where: { templateName, isActive: true },
  });
};

export const deletePdfTemplateByIdFromDb = async (id: number) => {
  logger.info("entering::deletePdfTemplateByIdFromDb::repository");
  await db.pdfTemplate.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
};

export const makeDefaultPdfTemplateByIdFromDb = async (
  input: MakeDefaultPdfTemplateInput
) => {
  logger.info("entering::makeDefaultPdfTemplateByIdFromDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id ?? null;

  return await db.$transaction(async (tx) => {
    await tx.pdfTemplate.updateMany({
      where: {
        module: input.module,
        templateType: input.templateType,
      },
      data: {
        isDefault: false,
        updatedBy: currentUser,
      },
    });

    await tx.pdfTemplate.update({
      where: { id: input.id },
      data: {
        isDefault: true,
        updatedBy: currentUser,
      },
    });
  });
};

export const updatePdfTemplateImageUrl = async (url: string, id: number) => {
  logger.info("entering::updatePdfTemplateImageUrl::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id ?? null;
  return await db.pdfTemplate.update({
    where: {
      id,
    },
    data: {
      sampleImageUrl: url,
      updatedBy: currentUser,
    },
  });
};

export const getPdfTemplateByModuleAndTypeFromDb = async (
  input: GetPdfTemplateByModuleAndTypeInput
): Promise<PdfTemplate | null> => {
  logger.info("entering::getPdfTemplateByModuleAndTypeFromDb::repository");
  return db.pdfTemplate.findFirst({
    where: { module: input.module, templateType: input.type, isActive: true },
  });
};
