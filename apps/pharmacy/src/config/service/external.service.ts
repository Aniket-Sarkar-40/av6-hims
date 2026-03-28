import { interceptor } from "@/config/axiosClient.js";
import { EXT_BASE_URL } from "@repo/shared/config/index.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import {
  PaymentMethods,
  SellCoPaySetInput,
  SellPaymentInput,
} from "@/types/sell/sell.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  sellCoPaySetServiceValidation,
  sellPaymentServiceValidation,
} from "@/validations/service/sell/sell.service.validation.js";

export const externalService = {
  async validateCorporateAmount(
    clientId: number,
    amount: number,
  ): Promise<boolean> {
    logger.info("entering::validateCorporateAmount::service");
    const token = requestStorage.getStore()?.token || "";

    const client = interceptor(token);
    try {
      const { data, status } = await client.post<{
        status: boolean;
        allowed: boolean;
      }>(EXT_BASE_URL + "checkCreditlimit", {
        client_id: clientId,
        currentBillAmount: amount,
      });

      logger.info("exiting::validateCorporateAmount::service");
      if (status === 200 && status) {
        return data.allowed;
      } else {
        return false;
      }
    } catch (error) {
      logger.error("error::validateCorporateAmount::service", error);
      return false;
    }
  },

  async createPaymentPayload(input: SellPaymentInput) {
    logger.info("entering::createPaymentPayload::service");

    const payment_methods = input.paymentMethod.map((m: PaymentMethods) => {
      const base: Pick<PaymentMethods, "method" | "paidAmount"> = {
        method: m.method,
        paidAmount: m.paidAmount,
      };

      if (m.method === "Card") {
        return {
          method: base.method,
          paid_amount: base.paidAmount,
          card_holder_name: m.cardHolderName ?? "",
          card_no: m.cardNo ?? "",
          expiry: m.expiry ?? "",
          payment_head_id: m.paymentHeadId ?? null,
        };
      }

      if (m.method === "Online") {
        return {
          method: base.method,
          paid_amount: base.paidAmount,
          transaction_id: m.transactionId ?? "",
          online_method: m.onlineMethod ?? null,
          payment_head_id: m.paymentHeadId ?? null,
        };
      }

      if (m.method === "Cheque") {
        return {
          method: base.method,
          paid_amount: base.paidAmount,
          bank_name: m.bankName ?? "",
          account_number: m.accountNumber ?? "",
          payment_head_id: m.paymentHeadId ?? null,
        };
      }

      return {
        method: base.method,
        paid_amount: base.paidAmount,
      };
    });

    return {
      master_id: input.sellId,
      payment_type: input.paymentType,
      total_paid_amount: input.totalPaidAmount,
      payment_methods,
    };
  },

  async takeSellPayment(input: SellPaymentInput) {
    logger.info("entering::takeSellPayment::service");
    await sellPaymentServiceValidation(input);

    const token = requestStorage.getStore()?.token || "";
    const client = interceptor(token);

    try {
      const payload = await externalService.createPaymentPayload(input);

      const { data, status } = await client.post<{
        status: boolean;
        message: string;
      }>(EXT_BASE_URL + "savePharmacyPayment", payload);

      logger.info("exiting::takeSellPayment::service");
      return status === 200 && data.status ? data : false;
    } catch (error) {
      logger.error("error::takeSellPayment::service", error);
      return false;
    }
  },

  async setSellCoPay(input: SellCoPaySetInput) {
    logger.info("entering::selSellCoPay::service");
    await sellCoPaySetServiceValidation(input);
    const token = requestStorage.getStore()?.token || "";

    const client = interceptor(token);
    try {
      const { data, status } = await client.post<{
        success: boolean;
        message: string;
      }>(EXT_BASE_URL + "setPharmacyCoPayApproval", {
        sale_id: input.sellId,
        sale_ref_no: input.sellRefNo,
        sale_details_id: input.sellDetailsId,
        co_pay_mode: input.coPayMode === "AMOUNT" ? "in_amount" : "co_pay",
        co_pay_value: input.coPayValue,
      });
      logger.info("exiting::selSellCoPay::service");
      if (status === 200 && data.success) {
        return data;
      } else {
        return false;
      }
    } catch (error) {
      logger.error("error::selSellCoPay::service", error);
      return false;
    }
  },
};
