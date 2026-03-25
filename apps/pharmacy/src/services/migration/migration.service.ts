import { requestStorage } from "@repo/platform/config/requestContext.js";
import { getInsurancePricing } from "@/repository/insurance/insurancePaymentSettings.repository.js";
import { getCountItemsFromDb } from "@/repository/item/item.repository.js";
import { createMigrationInDb } from "@/repository/migration/migration.repository.js";
import {
  getCorporateClientById,
  getCorporateClientPaymentSettings,
} from "@/repository/opd/corporate.repository.js";
import { updateSellCopay } from "@/repository/sell/sell.repository.js";
import { getSellReturnTotalsBySellId } from "@/repository/sell/sellReturn.repository.js";
import { CalculationInput } from "@repo/platform/types/common.js";
import { CreateMigrationReq } from "@/types/migration/migration.js";
import {
  SellByRefNoResponse,
  UpdateSellCopayInput,
  UpdateSellCopayInputDetail,
} from "@/types/sell/sell.js";
import { applyRound } from "av6-utils";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { customOmit } from "av6-utils";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { createMigrationCopayValidation } from "@/validations/service/migration/migration.service.validation.js";
import {
  CalculationMethod,
  INCLUDE_EXCLUDE,
  Migration,
  SELL_PAYMENT_STATUS,
} from "@repo/db/generated/prisma/client";
import { settingsService } from "../master/settings.service.js";
import { calculation } from "@/utils/commonCalculation.utils.js";

export const migrationService = {
  async createMigrationService(body: CreateMigrationReq): Promise<Migration> {
    let ref = {};
    let refDetails = {};

    if (body.migrationType === "CO_PAY") {
      const sell = await createMigrationCopayValidation(body);

      ref = customOmit<SellByRefNoResponse, "sellDetails">(sell, [
        "sellDetails",
      ]).rest;
      refDetails = { ...sell.sellDetails };

      const sellUpdateInputDetails: UpdateSellCopayInputDetail[] = [];

      const clientId = sell.corporateClientId;
      const insurerId = sell.insuranceId;
      let customerPlan: string | undefined = undefined;

      const settings = await settingsService.getSettings();
      const calculationMethod: CalculationMethod =
        settings?.sellCalculationMethod || "STEP_WISE";
      const roundFormat = settings?.sellRoundedFormat || "TO_FIXED";
      const precision =
        settings?.sellPrecision ?? settings?.defaultPrecision ?? 2;
      const finalRoundFormat =
        settings?.sellFinalRoundedFormat || "SPECIAL_ROUND";

      const itemIds = sell.sellDetails.map((c) => c.itemId);

      const items = await getCountItemsFromDb(itemIds);

      let allItemTotalAmount = 0;
      // let allItemNetAmount = 0;
      let totalInsuredCoPayAmount = 0;

      for (const item of sell.sellDetails) {
        const itemDetails = items.find((it) => it.id === item.itemId);

        if (!itemDetails) {
          throw new ErrorHandler(
            400,
            generateErrorMessage("NOT_FOUND", `Item Id:${item.itemId}`),
          );
        }

        const insurancePricing = sell.insuranceId
          ? await getInsurancePricing(
              sell.insuranceId,
              sell.ccId,
              itemDetails.id,
            )
          : null;

        const corporateClientPricing = sell.corporateClientId
          ? await getCorporateClientPaymentSettings(
              sell.corporateClientId,
              sell.ccId,
              item.itemId,
            )
          : null;

        if (!insurancePricing && !corporateClientPricing) {
          sellUpdateInputDetails.push({
            id: item.id,
            coPay: item.coPayAmount.toNumber(),
            patientPay: item.customerPayAmount.toNumber(),
            netAmount: item.netAmount.toNumber(),
            netDiscount: item.netDiscount.toNumber(),
            netTax: item.netTax.toNumber(),
            totalAmount: item.totalAmount.toNumber(),
            mrp: item.mrp.toNumber(),
          });
          continue;
        }

        let saleAmount = itemDetails.saleAmount.toNumber();
        let insurancePercentage = itemDetails.insurancePercentage.toNumber();
        const corporateClientPaymentMode = corporateClientPricing?.paymentMode;

        if (insurancePricing) {
          saleAmount = Number(insurancePricing.mrp);
          insurancePercentage = Number(insurancePricing.insurancePercentage);
        }

        let calMrp = saleAmount;
        if (sell.insuranceId || sell.corporateClientId) {
          calMrp = saleAmount + (saleAmount * insurancePercentage) / 100;
        }
        calMrp = applyRound(calMrp, roundFormat, precision);

        let itemAmount = calMrp * item.quantity;
        itemAmount = applyRound(itemAmount, roundFormat, precision);

        let itemCoPay = insurancePricing?.coPay
          ? Number(insurancePricing.coPay) * item.quantity
          : 0;

        if (corporateClientPricing) {
          itemCoPay =
            corporateClientPaymentMode === INCLUDE_EXCLUDE.Exclude
              ? 0
              : itemCoPay;
        }

        itemCoPay = applyRound(itemCoPay, roundFormat, precision);

        const calculationInput: CalculationInput = {
          amount: itemAmount,
          discountMethod: item.discountMethod,
          discount: item.discount.toNumber(),
          taxMethod: item.taxMethod,
          tax: item.tax.toNumber(),
          calculationMethod,
          precision,
          roundFormat,
        };

        let result = calculation(calculationInput);
        result = {
          netDiscount: applyRound(result.netDiscount, roundFormat, precision),
          netTax: applyRound(result.netTax, roundFormat, precision),
          totalAmount: applyRound(result.totalAmount, roundFormat, precision),
        };

        let itemPatientPay = result.totalAmount - itemCoPay;
        itemPatientPay = applyRound(itemPatientPay, roundFormat, precision);

        allItemTotalAmount += result.totalAmount;
        // allItemNetAmount += itemAmount;
        totalInsuredCoPayAmount += itemCoPay;

        sellUpdateInputDetails.push({
          id: item.id,
          coPay: itemCoPay,
          patientPay: itemPatientPay,
          netAmount: itemAmount,
          netDiscount: result.netDiscount,
          netTax: result.netTax,
          totalAmount: result.totalAmount,
          mrp: calMrp,
        });
      }

      let sellHeadResult = calculation({
        amount: allItemTotalAmount,
        discountMethod: sell.discountMethod,
        discount: sell.discount.toNumber(),
        taxMethod: sell.taxMethod,
        tax: sell.tax.toNumber(),
        calculationMethod,
        precision,
        roundFormat,
      });

      sellHeadResult = {
        netDiscount: applyRound(
          sellHeadResult.netDiscount,
          roundFormat,
          precision,
        ),
        netTax: applyRound(sellHeadResult.netTax, roundFormat, precision),
        totalAmount: applyRound(
          sellHeadResult.totalAmount,
          finalRoundFormat,
          precision,
        ),
      };

      allItemTotalAmount = applyRound(
        allItemTotalAmount,
        roundFormat,
        precision,
      );

      totalInsuredCoPayAmount = applyRound(
        totalInsuredCoPayAmount,
        finalRoundFormat,
        precision,
      );

      let patientPayAmount = allItemTotalAmount - totalInsuredCoPayAmount;
      patientPayAmount = applyRound(
        patientPayAmount,
        finalRoundFormat,
        precision,
      );

      const { totalCustomerPayAmount: totalReturnCustomerPayAmount } =
        await getSellReturnTotalsBySellId(sell.id);

      const customerAlreadyPaidAmount =
        sell.paidAmount.toNumber() - sell.refundedAmount.toNumber();
      const adjustedCustomerPayAmount =
        patientPayAmount - totalReturnCustomerPayAmount;

      const diffOfCustomerPay =
        customerAlreadyPaidAmount - adjustedCustomerPayAmount;

      const refundAmount = Math.max(0, diffOfCustomerPay);
      let paymentStatus: SELL_PAYMENT_STATUS;

      if (diffOfCustomerPay > 0) {
        paymentStatus = "REFUND";
      } else if (diffOfCustomerPay < 0) {
        paymentStatus =
          sell.paidAmount.toNumber() > 0 ? "PARTIALLY_PAID" : "UNPAID";
      } else {
        paymentStatus = "PAID";
      }

      if (clientId) {
        const client = await getCorporateClientById(clientId);
        customerPlan = client?.customerPlan;

        if (!client) {
          throw new ErrorHandler(
            404,
            generateErrorMessage("NOT_FOUND", "Corporate Client"),
          );
        }

        if (totalInsuredCoPayAmount > 0) {
          const isAllowed = await externalService.validateCorporateAmount(
            clientId,
            totalInsuredCoPayAmount,
          );

          if (!isAllowed) {
            throw new ErrorHandler(
              403,
              generateErrorMessage("ACCESS_FAIL", "Corporate Client"),
            );
          }
        }
      }

      const sellUpdateInput: UpdateSellCopayInput = {
        id: sell.id,
        coPay: totalInsuredCoPayAmount,
        patientPay: patientPayAmount,
        netAmount: allItemTotalAmount,
        netDiscount: sellHeadResult.netDiscount,
        netTax: sellHeadResult.netTax,
        refundAmount,
        sellRefNo: sell.sellRefNo,
        totalAmount: sellHeadResult.totalAmount,
        clientId,
        insurerId,
        paymentStatus,
        details: sellUpdateInputDetails,
        clientPlan: customerPlan,
      };
      await updateSellCopay(sellUpdateInput);
    }

    const migration = await createMigrationInDb({
      ...body,
      ref,
      refDetails,
    });
    return migration;
  },
};
