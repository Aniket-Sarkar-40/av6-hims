import {
  toPurchaseOrderDTO,
  toPurchaseOrderPdfDTO,
} from "@/mapper/purchase/purchase.mapper.js";
import {
  createPurchaseOrder,
  deletePurchaseOrderFromDb,
  getAllPurchaseFromDb,
  getPurchaseByIdFromDb,
  updatePurchaseOrderInDb,
  updatePurchaseOrderStatusFromDb,
} from "@/repository/purchase/purchase.repository.js";
import {
  CreatePurchaseOrderInput,
  PurchaseOrderDTO,
  UpdatePurchaseOrder,
} from "@/types/purchase/purchase.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createPOServiceValidation,
  deletePOServiceValidation,
  updatePOServiceValidation,
  updatePurchaseOrderStatusServiceValidation,
} from "@/validations/service/purchase/purchase.service.validation.js";
import { CustomDocDefinition, renderCustomPdfToBuffer } from "av6-pdf-engine";
import { PO_STATUS, RoundFormat } from "@repo/db/generated/prisma/enums.js";
import { pdfTemplateService } from "@apps/core/services/pdf/pdfTemplate.service.js";
import { resolvePdfTemplate } from "@apps/core/utils/applyTemplate.utils.js";
import { settingsService } from "@/services/master/settings.service.js";
import { applyPurchaseOrderReverseRateConversion } from "@/utils/rateConversation.utils.js";

export const purchaseService = {
  async createPurchaseOrder(input: CreatePurchaseOrderInput) {
    logger.info("entering::createPurchaseOrder::service");
    await createPOServiceValidation(input);
    const createPurchase = await createPurchaseOrder(input);

    logger.info("exiting::createPurchaseOrder::service");
    return createPurchase;
  },

  async updatePurchase(input: UpdatePurchaseOrder) {
    logger.info("entering::updatePurchase::service");

    await updatePOServiceValidation(input);

    const updatedPO = await updatePurchaseOrderInDb(input);

    logger.info("exiting::updatePurchase::service");
    return updatedPO;
  },

  async getAllPurchase(): Promise<PurchaseOrderDTO[]> {
    logger.info("entering::getAllPurchase::service");

    const pos = await getAllPurchaseFromDb();
    if (pos.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Purchase Order"),
      );
    }

    const dto = await toPurchaseOrderDTO(pos);

    logger.info("exiting::getAllPurchase::service");
    return dto;
  },

  async getPurchaseById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<PurchaseOrderDTO | null> {
    logger.info("entering::getPurchaseById::service id=" + id);

    validIdCheck(id);

    const po = await getPurchaseByIdFromDb(id);
    if (!po) {
      if (canNullReturnable) {
        return null;
      }
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "PurchaseOrder"),
      );
    }

    const dto = await toPurchaseOrderDTO([po]);

    logger.info("exiting::getPurchaseById::service id=" + id);
    return dto[0];
  },

  async deletePurchase(id: number): Promise<void> {
    logger.info("entering::deletePurchase::service id=" + id);

    await deletePOServiceValidation(id);

    await deletePurchaseOrderFromDb(id);
    logger.info("exiting::deletePurchase::service id=" + id);
  },

  async updatePurchaseOrderStatus(
    id: number,
    status: PO_STATUS,
  ): Promise<void> {
    logger.info(
      "entering::updatePurchaseOrderStatus::service id=" +
        id +
        " status=" +
        status,
    );

    await updatePurchaseOrderStatusServiceValidation(id);

    await updatePurchaseOrderStatusFromDb(id, status);

    logger.info(
      "exiting::updatePurchaseOrderStatus::service id=" +
        id +
        " status=" +
        status,
    );
  },

  async generatePoPdf(id: number): Promise<Buffer> {
    logger.info("entering::generatePayrollPdf::service");
    const purchase = await getPurchaseByIdFromDb(id);
    if (!purchase) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Purchase Order"),
      );
    }
    const [purchaseDto] = await toPurchaseOrderPdfDTO([purchase]);

    const pdfTemplate = await pdfTemplateService.getPdfTemplateByModuleAndType({
      module: "INVENTORY",
      type: "PURCHASE_ORDER",
    });

    if (!pdfTemplate) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "PDF template"),
      );
    }

    const settings = await settingsService.getSettings(true);
    const roundFormat: RoundFormat = settings?.poRoundedFormat || "TO_FIXED";
    const precision: number = settings?.poPrecision || 2;

    const filledDef = await resolvePdfTemplate(
      pdfTemplate.bodyJson as unknown as CustomDocDefinition,
      applyPurchaseOrderReverseRateConversion(purchaseDto, {
        roundFormat,
        precision,
      }),
    );
    const pdfBuffer = await renderCustomPdfToBuffer(filledDef);

    return pdfBuffer;
  },
};
