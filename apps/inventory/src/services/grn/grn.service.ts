import { toGrnDTO, toGrnPdfDTO } from "@/mapper/grn/grn.mapper.js";
import {
  createGrnInDb,
  deleteGrnFromDb,
  getAllGrnFromDb,
  getGrnByIdFromDb,
  updateGrnInDb,
} from "@/repository/grn/grn.repository.js";
import { CreateGrnInput, GrnDTO } from "@/types/grn/grn.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createGrnServiceValidation,
  deleteGrnServiceValidation,
  updateGrnServiceValidation,
} from "@/validations/service/grn/grn.service.validation.js";
import { notifier } from "@/config/core.config.js";
import { validateIdItemSupplier } from "@/validations/service/master/itemSupplier.service.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import { pdfTemplateService } from "@apps/core/services/pdf/pdfTemplate.service.js";
import { resolvePdfTemplate } from "@apps/core/utils/applyTemplate.utils.js";
import { CustomDocDefinition, renderCustomPdfToBuffer } from "av6-pdf-engine";

export const grnService = {
  async createGrn(input: CreateGrnInput) {
    logger.info("entering::createGrn::service");
    await createGrnServiceValidation(input);
    const createGrn = await createGrnInDb(input);

    const supplier = await validateIdItemSupplier(createGrn.supplierId);

    if (supplier.isGrnEmail) {
      this.getGrnById(createGrn.id)
        .then((grn) => {
          if (grn) {
            notifier.emitEvent("GRN_CREATED", {
              service: ServiceCode.INVENTORY,
              data: grn,
            });
          }
        })
        .catch((err) => {
          logger.error(err);
        });
    }

    logger.info("exiting::createStore Requisition::service");
    return createGrn;
  },

  async updateGrn(input: CreateGrnInput) {
    logger.info("entering::updateGrn::service");

    await updateGrnServiceValidation(input);

    const updatedPO = await updateGrnInDb(input);

    logger.info("exiting::updateGrn::service");
    return updatedPO;
  },

  async getAllGrn() {
    logger.info("entering::getAllGrn::service");

    const records = await getAllGrnFromDb();
    if (records.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "grn Order")
      );
    }

    const dto = await Promise.all(
      records.map(async (sr) => {
        return toGrnDTO([
          {
            ...sr,
            goodReceiveDetails: sr.goodReceiveDetails,
          },
        ]);
      })
    );

    logger.info("exiting::getAllGrn::service");
    return dto;
  },

  async getGrnById(
    id: number,
    canNullReturnable: boolean = false
  ): Promise<GrnDTO | null> {
    logger.info("entering::getGrnById::service id=" + id);

    validIdCheck(id);

    const grn = await getGrnByIdFromDb(id);

    if (!grn) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Good Receive Note")
        );
      } else {
        logger.warn(
          `GRN with id=${id} not found, returning null as requested.`
        );
        return null;
      }
    }

    const dto = await toGrnDTO([grn]);

    logger.info("exiting::getGrnById::service id=" + id);
    return dto[0];
  },

  async deleteGrn(id: number): Promise<void> {
    logger.info("entering::deleteGrn::service id=" + id);

    await deleteGrnServiceValidation(id);

    await deleteGrnFromDb(id);
    logger.info("exiting::deleteGrn::service id=" + id);
  },

  async generateGrnPdf(id: number): Promise<Buffer> {
    logger.info("entering::generateGrnPdf::service");
    const grn = await getGrnByIdFromDb(id);
    if (!grn) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Purchase Order")
      );
    }
    const grnDto = await toGrnPdfDTO(grn);

    if (!grnDto) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Purchase Order")
      );
    }

    const pdfTemplate = await pdfTemplateService.getPdfTemplateByModuleAndType({
      module: "INVENTORY",
      type: "GOOD_RECEIVE_NOTE",
    });

    if (!pdfTemplate) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "PDF template")
      );
    }

    const filledDef = await resolvePdfTemplate(
      pdfTemplate.bodyJson as unknown as CustomDocDefinition,
      grnDto
    );
    const pdfBuffer = await renderCustomPdfToBuffer(filledDef);

    return pdfBuffer;
  },
};
