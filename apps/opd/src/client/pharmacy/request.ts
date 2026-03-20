import { EXT_PHARMACY_ITEM_URL } from "@repo/shared/config/index.js";
import { interceptor } from "@/config/axiosClient.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { GetItemReq, ItemData } from "@/types/item.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";

export const pharmacyRequests = {
  async getItemById(payload: GetItemReq): Promise<ItemData | null> {
    const { user, perms, token } = requestStorage.getStore() || {};
    if (!user || !perms || !token)
      throw new ErrorHandler(
        401,
        "User not authenticated or permissions not found",
      );

    try {
      const res = await interceptor(token).post(
        `${EXT_PHARMACY_ITEM_URL}`,
        payload,
        {
          validateStatus: (s) => s === 200 || s === 404,
        },
      );

      if (!res.data?.success || res.status === 404) {
        logger.warn("getItemById::service - item not found or error occurred");
        return null;
      }

      const d = res.data.data;
      const ref = (r: { id: number; name: string } | null | undefined) =>
        r ? { id: r.id, name: r.name } : null;

      return {
        id: d.id,
        itemNumber: d.itemNumber,
        medicineName: d.medicineName,
        purchaseAmount: d.purchaseAmount,
        saleAmount: d.saleAmount,
        medPackingType: d.medPackingType,
        insurancePercentage: d.insurancePercentage,
        walkInPercentage: d.walkInPercentage,
        branchInHandStock: d.branchInHandStock,
        warehouseInHandStock: d.warehouseInHandStock,
        insuredCoPay: d.insuredCoPay,
        insuredPatientPay: d.insuredPatientPay,
        corporateClientPaymentMode: d.corporateClientPaymentMode,
        tax: d.tax,
        taxMethod: d.taxMethod,
        medCategory: ref(d.medCategory),
        medType: ref(d.medType),
        medComp: ref(d.medComp),
        medUnit: ref(d.medUnit),
        packSize: ref(d.packSize),
        drugType: ref(d.drugType),
        medManufacturer: ref(d.medManufacturer),
        boxSize: ref(d.boxSize),
        storage: ref(d.storage),
      };
    } catch (error) {
      logger.error("getItemById::service - exception occurred", error);
      return null;
    }
  },
};
