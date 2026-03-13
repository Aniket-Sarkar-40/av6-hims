import {
  createPdfTemplateInDb,
  deletePdfTemplateByIdFromDb,
  getPdfTemplateByIdFromDb,
  makeDefaultPdfTemplateByIdFromDb,
  updatePdfTemplateImageUrl,
  updatePdfTemplateInDb,
} from "@/repository/pdf/pdfTemplate.repository.js";
import {
  CreatePdfTemplateInput,
  MakeDefaultPdfTemplateInput,
  UpdatePdfTemplateInput,
} from "@/types/pdf/pdfTemplate.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { createPdfThumbnail } from "@repo/shared/utils/pdfToPic.utils.js";
import {
  addToCache,
  deleteCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/core.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createPdfTemplateServiceValidation,
  makeDefaultPdfTemplateServiceValidation,
  updatePdfTemplateServiceValidation,
  validIdPdfTemplate,
} from "@/validations/service/pdf/pdfTemplate.service.validation.js";
import { PdfTemplate } from "@repo/db/generated/prisma/client";
import { CustomDocDefinition, renderCustomPdfToBuffer } from "av6-pdf-engine";
import fs from "fs";
import path from "path";

const cacheKey = getRedisKey("PDF_TEMPLATE", "all");

export const pdfTemplateService = {
  async createPdfTemplate(input: CreatePdfTemplateInput): Promise<PdfTemplate> {
    logger.info("entering::createPdfTemplate::service");
    await createPdfTemplateServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.PDF_TEMPLATE);
    const pdfTemplate = await createPdfTemplateInDb(input);
    if (isCacheable && pdfTemplate) {
      await addToCache(cacheKey, pdfTemplate.id, pdfTemplate);
    }
    logger.info("exiting::createPdfTemplate::service");
    return pdfTemplate;
  },

  async updatePdfTemplate(input: UpdatePdfTemplateInput): Promise<PdfTemplate> {
    logger.info("entering::updatePdfTemplate::service");
    await updatePdfTemplateServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.PDF_TEMPLATE);
    const pdfTemplate = await updatePdfTemplateInDb(input);
    if (isCacheable && pdfTemplate) {
      await updateCache(cacheKey, pdfTemplate.id, pdfTemplate);
    }
    logger.info("exiting::updatePdfTemplate::service");
    return pdfTemplate;
  },

  async getPdfTemplate(
    id: number,
    canNullReturnable: boolean = false
  ): Promise<PdfTemplate | null> {
    logger.info("entering::getPdfTemplate::service");
    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.PDF_TEMPLATE);
    let pdfTemplate: PdfTemplate | null = null;
    if (isCacheable) {
      pdfTemplate = (await getCacheById(cacheKey, id)) as PdfTemplate | null;
    } else {
      pdfTemplate = await getPdfTemplateByIdFromDb(id);
    }
    if (!pdfTemplate) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Pdf Template")
        );
      } else {
        return null;
      }
    }

    logger.info("exiting::getPdfTemplate::service");
    return pdfTemplate;
  },

  async deletePdfTemplate(id: number) {
    logger.info("entering::deletePdfTemplate::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.PDF_TEMPLATE);
    const existing = await validIdPdfTemplate(id);
    // if (existing.sampleImageUrl) deleteFileIfExists(process.cwd() + existing.sampleImageUrl);
    await deletePdfTemplateByIdFromDb(id);
    if (isCacheable) await deleteCache(cacheKey, id);
    logger.info("exiting::deletePdfTemplate::service");
  },

  async makeDefaultPdfTemplate(input: MakeDefaultPdfTemplateInput) {
    logger.info("entering::makeDefaultPdfTemplate::service");
    await makeDefaultPdfTemplateServiceValidation(input);
    await makeDefaultPdfTemplateByIdFromDb(input);
    logger.info("exiting::makeDefaultPdfTemplate::service");
  },

  async createAndUpdatePdfThumbnail(
    doc: CustomDocDefinition,
    id: number,
    previousImageUrl?: string | null
  ) {
    logger.info("entering::createAndUpdatePdfThumbnail::service");
    const baseFolder = path.join(process.cwd(), "uploads");
    const dest = path.join(baseFolder, `pdf-thumbnails`);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
      console.log(`Created folder: ${dest}`);
    }

    const absoluteImagePath = path.join(dest, `${Date.now()}.png`);
    const relativeImagePath = path.relative(process.cwd(), absoluteImagePath);

    const pdfBuffer = await renderCustomPdfToBuffer(doc);
    const imageBuffer = await createPdfThumbnail(pdfBuffer);

    await fs.promises.writeFile(
      absoluteImagePath,
      imageBuffer as Buffer<ArrayBufferLike>
    );

    await updatePdfTemplateImageUrl(relativeImagePath, id);

    // if (previousImageUrl) {
    //   deleteFileIfExists(previousImageUrl);
    // }
    logger.info("exiting::createAndUpdatePdfThumbnail::service");
  },
};
