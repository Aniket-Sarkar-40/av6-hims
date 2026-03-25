import { toPurchaseOrderDTO } from "@/mapper/purchase/purchase.mapper.js";
import {
  createPurchaseOrder,
  deletePurchaseOrderFromDb,
  getAllPurchaseFromDb,
  getPurchaseByIdFromDb,
  updatePurchaseOrderInDb,
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
} from "@/validations/service/purchase/purchase.service.validation.js";

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

    const dto = await Promise.all(pos.map(toPurchaseOrderDTO));

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

    const dto = await toPurchaseOrderDTO(po);

    logger.info("exiting::getPurchaseById::service id=" + id);
    return dto;
  },

  async deletePurchase(id: number): Promise<void> {
    logger.info("entering::deletePurchase::service id=" + id);

    await deletePOServiceValidation(id);

    await deletePurchaseOrderFromDb(id);
    logger.info("exiting::deletePurchase::service id=" + id);
  },
};
