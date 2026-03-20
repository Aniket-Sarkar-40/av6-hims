import { toGetPaymentDetailsByIdModuleWise } from "@/mapper/payment/payment.mapper.js";
import {
  createPaymentInDb,
  getAllPaymentsFromDb,
} from "@/repository/payment/payment.repository.js";
import {
  CreatePaymentInput,
  GetPaymentDetailsReq,
  GetPaymentReq,
  PaymentDetailsResponse,
} from "@/types/payment/payment.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  createPaymentServiceValidation,
  getPaymentDetailsModuleWiseServiceValidation,
  getPaymentServiceValidation,
} from "@/validations/service/payment/payment.service.validation.js";

export const paymentService = {
  async getpayment(input: GetPaymentReq) {
    logger.info("entering::getpayment::service");
    await getPaymentServiceValidation(input);
    const response = await getAllPaymentsFromDb(input);
    logger.info("exiting::getpayment::service");
    return response;
  },

  async createPayment(input: CreatePaymentInput) {
    logger.info("entering::createPayment::service");
    await createPaymentServiceValidation(input);
    const response = await createPaymentInDb(input);
    logger.info("exiting::createPayment::service");
    return response;
  },
  async getPaymentDetailsModuleWise(
    input: GetPaymentDetailsReq,
  ): Promise<PaymentDetailsResponse> {
    logger.info("entering::getPaymentDetailsModuleWise::service");
    await getPaymentDetailsModuleWiseServiceValidation(input);
    const response = await toGetPaymentDetailsByIdModuleWise(input);
    logger.info("exiting::getPaymentDetailsModuleWise::service");
    return response;
  },
};
