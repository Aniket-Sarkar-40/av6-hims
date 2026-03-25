import { getInsurancePricing } from "@/repository/insurance/insurancePaymentSettings.repository.js";
import { getCorporateClientPaymentSettings } from "@/repository/opd/corporate.repository.js";
import { itemService } from "@/services/item/item.service.js";
import { medCategoryService } from "@/services/master/medCategory.service.js";
import { settingsService } from "@/services/master/settings.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import {
  SellReturnDetailDTO,
  SellReturnDTO,
  SellReturnResponse,
} from "@/types/sell/sellReturn.js";
import { applyRound } from "@/utils/commonCalculation.utils.js";
import {
  InsurerPaymentSettings,
  PaymentModePharmacy,
} from "@repo/db/generated/prisma/client";
import { toIdValue } from "av6-utils";

export const toSellReturnDTO = async (
  sellReturnInput: SellReturnResponse,
): Promise<SellReturnDTO> => {
  const settings = await settingsService.getSettings(true);
  const staff = sellReturnInput.staffId
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        sellReturnInput.staffId,
        true,
      )
    : null;

  const createdBy = sellReturnInput.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        sellReturnInput.createdBy,
        true,
      )
    : null;

  const approvedBy = sellReturnInput.approvedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        sellReturnInput.approvedBy,
        true,
      )
    : null;
  const rejectedBy = sellReturnInput.rejectedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        sellReturnInput.rejectedBy,
        true,
      )
    : null;

  const detailDTO: SellReturnDetailDTO[] = await Promise.all(
    sellReturnInput.sellReturnDetails.map(async (detail) => {
      const item = await itemService.getItemByIdWoDTO(detail.itemId, true);
      const itemCategory = await medCategoryService.getMedCategoryByIdWODto(
        detail.itemCategoryId,
        true,
      );

      let insurancePricing: InsurerPaymentSettings | null = null;
      if (sellReturnInput.insuranceId) {
        insurancePricing = await getInsurancePricing(
          sellReturnInput.insuranceId,
          sellReturnInput.ccId,
          detail.itemId,
        );
      }

      const corporateClient = sellReturnInput.corporateClientId
        ? await getCorporateClientPaymentSettings(
            sellReturnInput.corporateClientId,
            sellReturnInput.ccId,
            detail.itemId,
          )
        : null;

      let unitCopayAmount = null;

      if (detail.coPayPaymentValue && detail.coPayPaymentType) {
        unitCopayAmount =
          detail.coPayPaymentType === PaymentModePharmacy.co_pay
            ? applyRound(
                (detail.mrp.toNumber() * Number(detail.coPayPaymentValue)) /
                  100,
                settings?.sellRoundedFormat ?? "TO_FIXED",
                settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
              )
            : Number(detail.coPayPaymentValue);
      } else if (insurancePricing) {
        unitCopayAmount =
          insurancePricing.paymentMode === PaymentModePharmacy.co_pay
            ? applyRound(
                (detail.mrp.toNumber() *
                  Number(insurancePricing.paymentValue)) /
                  100,
                settings?.sellRoundedFormat ?? "TO_FIXED",
                settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
              )
            : Number(insurancePricing.paymentValue);
      }

      return {
        ...detail,
        mrp: detail.mrp.toNumber(),
        discount: detail.discount.toNumber(),
        netDiscount: detail.netDiscount.toNumber(),
        tax: detail.tax.toNumber(),
        netTax: detail.netTax.toNumber(),
        totalAmount: detail.totalAmount.toNumber(),
        coPayAmount: detail.coPayAmount.toNumber(),
        customerPayAmount: detail.customerPayAmount.toNumber(),
        netAmount: detail.netAmount.toNumber(),
        item: item,
        itemCategory: itemCategory,
        insuredCoPay: unitCopayAmount || null,
        insuredPatientPay: unitCopayAmount
          ? applyRound(
              detail.mrp.toNumber() - unitCopayAmount,
              settings?.sellRoundedFormat ?? "TO_FIXED",
              settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
            )
          : null,
        corporatePaymentValue: detail.coPayPaymentValue
          ? Number(detail.coPayPaymentValue)
          : corporateClient?.paymentMode === "Include"
            ? 100
            : null,
        corporatePaymentMode: detail.coPayPaymentType
          ? detail.coPayPaymentType
          : corporateClient?.paymentMode === "Include"
            ? "co_pay"
            : null,
        corporateClientPaymentMode: corporateClient?.paymentMode || null,
      };
    }),
  );
  return {
    ...sellReturnInput,
    tax: sellReturnInput.tax.toNumber(),
    netTax: sellReturnInput.netTax.toNumber(),
    discount: sellReturnInput.discount.toNumber(),
    netDiscount: sellReturnInput.netDiscount.toNumber(),
    paidAmount: sellReturnInput.paidAmount.toNumber(),
    netAmount: sellReturnInput.netAmount.toNumber(),
    totalAmount: sellReturnInput.totalAmount.toNumber(),
    customerPayAmount: sellReturnInput.customerPayAmount.toNumber(),
    coPayAmount: sellReturnInput.coPayAmount.toNumber(),
    staff: staff,
    createdBy: createdBy,
    approvedBy: approvedBy,
    rejectedBy: rejectedBy,
    sellReturnDetails: detailDTO,
    insurance: toIdValue(sellReturnInput.insurance, "customerName"),
    corporateClient: toIdValue(sellReturnInput.corporateClient, "customerName"),
  };
};
