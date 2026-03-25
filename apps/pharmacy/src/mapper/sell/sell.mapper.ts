import { getInsurancePricing } from "@/repository/insurance/insurancePaymentSettings.repository.js";
import { getCorporateClientPaymentSettings } from "@/repository/opd/corporate.repository.js";
import { getNotCompetedOpdBillWithMedicinesDetails } from "@/repository/opd/opdList.repository.js";
import {
  getAppointment,
  getLastPaymentTransaction,
} from "@/repository/sell/sell.repository.js";
import { getSellReturnBySellIdFromDb } from "@/repository/sell/sellReturn.repository.js";

import { itemService } from "@/services/item/item.service.js";
import { medCategoryService } from "@/services/master/medCategory.service.js";
import { settingsService } from "@/services/master/settings.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import {
  SellDetailDTO,
  SellDetailsResponse,
  SellDetailsResponseBase,
  SellDTO,
  SellDtoForReceipt,
  SellResponse,
} from "@/types/sell/sell.js";
import { applyRound } from "@/utils/commonCalculation.utils.js";
import {
  InsurerPaymentSettings,
  PaymentModePharmacy,
  PmsSellReturnDetails,
} from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { toIdValue } from "av6-utils";

export const toSellDTO = async (
  sellInput: SellResponse,
  isAdjusted: boolean = false,
): Promise<SellDTO> => {
  const store = requestStorage.getStore();
  const settings = await settingsService.getSettings(true);
  const staff = sellInput.staffId
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(sellInput.staffId, true)
    : null;

  const sellReturn = isAdjusted
    ? await getSellReturnBySellIdFromDb(sellInput.id)
    : [];

  const createdBy = sellInput.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        sellInput.createdBy,
        true,
      )
    : null;

  const detailsToReturnMap: Map<number, PmsSellReturnDetails[]> = new Map();
  sellReturn.forEach((ret) => {
    ret.sellReturnDetails.forEach((retDetails) => {
      if (!detailsToReturnMap.has(retDetails.sellDetailsId)) {
        detailsToReturnMap.set(retDetails.sellDetailsId, []);
      }
      detailsToReturnMap.get(retDetails.sellDetailsId)?.push(retDetails);
    });
  });

  let isSellCompleted = true;
  if (sellInput.aptId) {
    const notCompletedMedicines =
      await getNotCompetedOpdBillWithMedicinesDetails(sellInput.aptId);
    if (notCompletedMedicines.length > 0) {
      isSellCompleted = false;
    }
  }

  const returnedTotalAmount = sellReturn.reduce(
    (acc, curr) => acc + curr.totalAmount.toNumber(),
    0,
  );
  const returnedNetAmount = sellReturn.reduce(
    (acc, curr) => acc + curr.netAmount.toNumber(),
    0,
  );
  const returnedCustomerPayAmount = sellReturn.reduce(
    (acc, curr) => acc + curr.customerPayAmount.toNumber(),
    0,
  );
  const returnedCoPayAmount = sellReturn.reduce(
    (acc, curr) => acc + curr.coPayAmount.toNumber(),
    0,
  );

  const detailDTO: SellDetailDTO[] = await Promise.all(
    sellInput.sellDetails.map(async (detail) => {
      const item = await itemService.getItemByIdWoDTO(
        detail.itemId,
        true,
        sellInput.ccId,
      );
      const itemCategory = await medCategoryService.getMedCategoryByIdWODto(
        detail.itemCategoryId,
        true,
      );
      let insurancePricing: InsurerPaymentSettings | null = null;

      const sellRetDetailsForCurrSellDetails =
        detailsToReturnMap.get(detail.id) || [];

      const returnedTotalAmount = sellRetDetailsForCurrSellDetails.reduce(
        (acc, curr) => acc + curr.totalAmount.toNumber(),
        0,
      );
      const returnedNetAmount = sellRetDetailsForCurrSellDetails.reduce(
        (acc, curr) => acc + curr.netAmount.toNumber(),
        0,
      );
      const returnedCustomerPayAmount = sellRetDetailsForCurrSellDetails.reduce(
        (acc, curr) => acc + curr.customerPayAmount.toNumber(),
        0,
      );
      const returnedCoPayAmount = sellRetDetailsForCurrSellDetails.reduce(
        (acc, curr) => acc + curr.coPayAmount.toNumber(),
        0,
      );

      if (sellInput.insuranceId) {
        insurancePricing = await getInsurancePricing(
          sellInput.insuranceId,
          sellInput.ccId,
          detail.itemId,
        );
      }

      const corporateClient = sellInput.corporateClientId
        ? await getCorporateClientPaymentSettings(
            sellInput.corporateClientId,
            sellInput.ccId,
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
        coPayAmount: applyRound(
          detail.coPayAmount.toNumber() - returnedCoPayAmount,
          settings?.sellRoundedFormat ?? "TO_FIXED",
          settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
        ),
        customerPayAmount: applyRound(
          detail.customerPayAmount.toNumber() - returnedCustomerPayAmount,
          settings?.sellRoundedFormat ?? "TO_FIXED",
          settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
        ),
        netAmount: applyRound(
          detail.netAmount.toNumber() - returnedNetAmount,
          settings?.sellRoundedFormat ?? "TO_FIXED",
          settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
        ),
        totalAmount: applyRound(
          detail.totalAmount.toNumber() - returnedTotalAmount,
          settings?.sellRoundedFormat ?? "TO_FIXED",
          settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
        ),
        coPayPaymentValue: detail.coPayPaymentValue
          ? Number(detail.coPayPaymentValue)
          : null,
        discount: detail.discount.toNumber(),
        netDiscount: detail.netDiscount.toNumber(),
        tax: detail.tax.toNumber(),
        netTax: detail.netTax.toNumber(),
        mrp: detail.mrp.toNumber(),
      };
    }),
  );
  return {
    ...sellInput,
    staff: staff,
    sellDetails: detailDTO,
    createdBy: createdBy,
    insurance: toIdValue(sellInput.insurance, "customerName"),
    corporateClient: toIdValue(sellInput.corporateClient, "customerName"),
    customerPayAmount: applyRound(
      sellInput.customerPayAmount.toNumber() - returnedCustomerPayAmount,
      settings?.sellRoundedFormat ?? "TO_FIXED",
      settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
    ),
    coPayAmount: applyRound(
      sellInput.coPayAmount.toNumber() - returnedCoPayAmount,
      settings?.sellRoundedFormat ?? "TO_FIXED",
      settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
    ),
    netAmount: applyRound(
      sellInput.netAmount.toNumber() - returnedNetAmount,
      settings?.sellRoundedFormat ?? "TO_FIXED",
      settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
    ),
    totalAmount: applyRound(
      sellInput.totalAmount.toNumber() - returnedTotalAmount,
      settings?.sellRoundedFormat ?? "TO_FIXED",
      settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
    ),
    tax: sellInput.tax.toNumber(),
    netTax: sellInput.netTax.toNumber(),
    discount: sellInput.discount.toNumber(),
    netDiscount: sellInput.netDiscount.toNumber(),
    paidAmount: sellInput.paidAmount.toNumber(),
    returnedAmount: sellInput.returnedAmount.toNumber(),
    refundedAmount: sellInput.refundedAmount.toNumber(),
    isSellCompleted: isSellCompleted,
  };
};

export const toSellDtoForReceipt = async (
  sellInput: SellDTO,
): Promise<SellDtoForReceipt> => {
  const paymentTransaction = await getLastPaymentTransaction(sellInput.id);
  const appointment = sellInput.aptId
    ? await getAppointment(sellInput.aptId)
    : null;
  return {
    ...sellInput,
    paymentTransaction,
    appointment,
  };
};

export const toSellDetailsDTO = async (
  sellDetailsInput: SellDetailsResponseBase[],
): Promise<SellDetailsResponse[]> => {
  const items = await itemService.getAllItemWoDto();
  return Promise.all(
    sellDetailsInput.map(async (sellDetail) => {
      const item = items.find((item) => item.id === sellDetail.itemId);
      return {
        ...sellDetail,
        item: item ?? null,
      };
    }),
  );
};
