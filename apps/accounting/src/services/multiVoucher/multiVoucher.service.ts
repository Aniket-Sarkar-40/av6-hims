import { auditProxy } from "@/config/audit.config.js";
import {
  createMultiVoucherInDb,
  deleteMultiVoucherByIdFromDb,
  getMultiVoucherDataForInvoice,
  updateMultiVoucherInDb,
  updatePostedMultiVoucherInDb,
} from "@/repository/multiVoucher/multiVoucher.repository.js";
import { CreateOrUpdateMultiVoucherInput } from "@/types/multiVoucher/multiVoucher.js";
import { CreateOrUpdateVoucherInput } from "@/types/voucher/voucher.js";
import { prepareVoucherInputForMultiVoucher } from "@/utils/multiVoucher.utils.js";
import {
  createOrUpdateMultiVoucherServiceValidation,
  deleteMultiVoucherServiceValidation,
} from "@/validations/service/multiVoucher/multiVoucher.service.validation.js";
import { createOrUpdateVoucherServiceValidation } from "@/validations/service/voucher/voucher.service.validation.js";
import { toMultiVoucherPdfDto } from "@/mapper/multiVoucher/multiVoucher.mapper.js";
import { CustomDocDefinition, renderCustomPdfToBuffer } from "av6-pdf-engine";
import dayjs from "dayjs";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { pdfTemplateService } from "@apps/core/services/pdf/pdfTemplate.service.js";

const multiVoucherServiceRaw = {
  async createMultiVoucher(input: CreateOrUpdateMultiVoucherInput) {
    logger.info("entering::createMultiVoucher::service");
    await createOrUpdateMultiVoucherServiceValidation(input);
    const preparedVoucherInput = await prepareVoucherInputForMultiVoucher(
      input
    );
    if (input.status === MultiVoucherStatus.POSTED) {
      for (const detail of preparedVoucherInput) {
        await createOrUpdateVoucherServiceValidation({
          input: detail as CreateOrUpdateVoucherInput,
          isCurrencyConversionRequired: true,
        });
      }
    }

    await createMultiVoucherInDb({
      input,
      voucherInput: preparedVoucherInput as CreateOrUpdateVoucherInput[],
    });

    logger.info("exiting::createMultiVoucher::service");
  },

  async updateMultiVoucher(input: CreateOrUpdateMultiVoucherInput) {
    logger.info("entering::updateMultiVoucher::service");
    await createOrUpdateMultiVoucherServiceValidation(input);
    const preparedVoucherInput = await prepareVoucherInputForMultiVoucher(
      input
    );
    if (input.status === MultiVoucherStatus.POSTED) {
      for (const detail of preparedVoucherInput) {
        await createOrUpdateVoucherServiceValidation({
          input: detail as CreateOrUpdateVoucherInput,
          isCurrencyConversionRequired: true,
        });
      }
    }
    await updateMultiVoucherInDb({
      input,
      voucherInput: preparedVoucherInput as CreateOrUpdateVoucherInput[],
    });
  },

  async deleteMultiVoucherById(id: number) {
    logger.info("entering::deleteMultiVoucherById::service");
    await deleteMultiVoucherServiceValidation(id);
    await deleteMultiVoucherByIdFromDb(id);
    logger.info("exiting::deleteMultiVoucherById::service");
  },
  async updatePostedMultiVoucher(input: CreateOrUpdateMultiVoucherInput) {
    logger.info("entering::updatePostedMultiVoucher::service");
    await createOrUpdateMultiVoucherServiceValidation(input);
    const preparedVoucherInput = await prepareVoucherInputForMultiVoucher(
      input
    );
    if (input.status === MultiVoucherStatus.POSTED) {
      for (const detail of preparedVoucherInput) {
        await createOrUpdateVoucherServiceValidation({
          input: detail as CreateOrUpdateVoucherInput,
          isCurrencyConversionRequired: true,
        });
      }
    }
    await updatePostedMultiVoucherInDb({
      input,
      voucherInput: preparedVoucherInput as CreateOrUpdateVoucherInput[],
    });
  },

  async buildPdfForMultiVoucherInvoice(multiVoucherId: number): Promise<{
    pdf: Buffer;
    voucherType: string | null;
    voucherDate: string | null;
  }> {
    logger.info("entering::buildPdfForMultiVoucherInvoice::service");
    const data = await getMultiVoucherDataForInvoice(multiVoucherId);
    if (!data) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Multi Voucher")
      );
    }
    const multiVoucherDto = await toMultiVoucherPdfDto(data);

    const pdfTemplate = await pdfTemplateService.getPdfTemplateByModuleAndType({
      module: "ACCOUNTING",
      type: "MULTI_VOUCHER",
    });

    if (!pdfTemplate) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "PDF template")
      );
    }

    const filledDef = await resolvePdfTemplate(
      pdfTemplate.bodyJson as unknown as CustomDocDefinition,
      multiVoucherDto
    );
    const pdfBuffer = await renderCustomPdfToBuffer(filledDef);

    return {
      pdf: pdfBuffer,
      voucherType: multiVoucherDto.voucherType?.value.toUpperCase() || null,
      voucherDate:
        dayjs(multiVoucherDto.voucherDate).format("YYYY-MM-DD") || null,
    };
  },
};

export const multiVoucherService = auditProxy.createAuditedService(
  "multiVoucher",
  multiVoucherServiceRaw
);
