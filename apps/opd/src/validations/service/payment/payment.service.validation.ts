import { getBankHeadByIdFromDb } from "@/repository/master/bankHead.repository.js";
import { getMobileMoneyMethodByIdFromDb } from "@/repository/master/mobileMoney.repository.js";
import {
  CreatePaymentInput,
  GetPaymentDetailsReq,
  GetPaymentReq,
} from "@/types/payment/payment.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  PaymentStatus,
  ServiceCode,
  ProcedurePaymentStatus,
  TransactionType,
} from "@repo/db/generated/prisma/client";
import { validateIdAppointment } from "../appointment/appointment.service.validation.js";
import { validateIdGeneralBilling } from "../appointment/generalBilling.service.validation.js";
import { validateIdPatientProcedure } from "../appointment/patientProcedure.service.validation.js";
import { validateIdCollectionCenter } from "../master/collectionCenter.service.validation.js";

export const getPaymentServiceValidation = async (input: GetPaymentReq) => {
  logger.info("entering::getPayment::service::validation");
  validateIdCollectionCenter(input.ccId);
  logger.info("exiting::getPayment::service::validation");
};
export const getPaymentDetailsModuleWiseServiceValidation = async (
  input: GetPaymentDetailsReq,
) => {
  logger.info("entering::getPaymentDetailsModuleWise::service::validation");
  const { module, id } = input;

  switch (module) {
    case ServiceCode.OPD:
      await validateIdAppointment(id);
      break;
    case ServiceCode.PROCEDURE:
      await validateIdPatientProcedure(id);
      break;
    case ServiceCode.GENERAL_BILL:
      await validateIdGeneralBilling(id);
      break;
    default:
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", "Module"),
      );
  }
  logger.info("exiting::getPaymentDetailsModuleWise::service::validation");
};

export const createPaymentServiceValidation = async (
  input: CreatePaymentInput,
) => {
  logger.info("entering::createPayment::service::validation");
  await validateIdCollectionCenter(input.ccId);

  if (input.module === ServiceCode.OPD) {
    /*=============== Validation for OPD =================*/
    const appointment = await validateIdAppointment(input.referenceId);
    if (appointment.ccId !== input.ccId) {
      throw new ErrorHandler(400, generateErrorMessage("ACCESS_FAIL"));
    }
    input.referenceNumber = appointment.appointmentId;
    input.patientId = appointment.patientId;

    if (input.transactionType === TransactionType.CREDIT) {
      // validation for taking payment
      const allowedStatus: PaymentStatus[] = [
        PaymentStatus.PENDING,
        PaymentStatus.PARTIAL,
      ];
      if (!allowedStatus.includes(appointment.paymentStatus)) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_STATUS", "Appointment"),
        );
      }
      const apptCustomerPayAmt = appointment.netAmount - appointment.paidAmount;
      if (input.totalPaidAmount && input.totalPaidAmount > apptCustomerPayAmt) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_VALUE", "Total Paid Amount"),
        );
      }
      const totalSplitAmount = input.details.reduce(
        (acc, curr) => acc + (curr.paidAmount ?? 0),
        0,
      );

      if (totalSplitAmount !== input.totalPaidAmount) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "MISMATCH",
            `Total split amount (${totalSplitAmount}) does not match total paid amount (${input.totalPaidAmount})`,
          ),
        );
      }
      input.paymentStatus =
        input.totalPaidAmount === apptCustomerPayAmt ? "SETTLED" : "PARTIAL";

      for (const detail of input.details) {
        if (detail.bankHeadId) {
          const bank = await getBankHeadByIdFromDb(detail.bankHeadId);
          if (!bank) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Bank Head"),
            );
          }
        }
        if (detail.mobileMoneyMethodId) {
          const mobileMoneyMethod = await getMobileMoneyMethodByIdFromDb(
            detail.mobileMoneyMethodId,
          );
          if (!mobileMoneyMethod) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Mobile Money Method"),
            );
          }
        }
        detail.netAmount = appointment.netAmount;
        detail.dueAmount = apptCustomerPayAmt - (detail.paidAmount ?? 0);
        detail.refundAmount = 0;
      }
    } else {
      //validation for refund payment
      if (appointment.paymentStatus !== PaymentStatus.REFUND) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_STATUS", "Appointment"),
        );
      }
      const appRefundAmt = appointment.refundAmount;
      if (input.totalRefundAmount && input.totalRefundAmount > appRefundAmt) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_VALUE", "Total Refund Amount"),
        );
      }

      const totalSplitAmount = input.details.reduce(
        (acc, curr) => acc + (curr.refundAmount ?? 0),
        0,
      );

      if (totalSplitAmount !== input.totalRefundAmount) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "MISMATCH",
            `Total split amount (${totalSplitAmount}) does not match total refund amount (${input.totalRefundAmount})`,
          ),
        );
      }

      input.paymentStatus =
        input.totalRefundAmount === appRefundAmt ? "SETTLED" : "REFUND";

      for (const detail of input.details) {
        if (detail.bankHeadId) {
          const bank = await getBankHeadByIdFromDb(detail.bankHeadId);
          if (!bank) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Bank Head"),
            );
          }
        }
        if (detail.mobileMoneyMethodId) {
          const mobileMoneyMethod = await getMobileMoneyMethodByIdFromDb(
            detail.mobileMoneyMethodId,
          );
          if (!mobileMoneyMethod) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Mobile Money Method"),
            );
          }
        }

        detail.netAmount = appointment.netAmount;
        detail.paidAmount = 0;
        detail.dueAmount = appRefundAmt - (detail.refundAmount ?? 0);
      }
    }
  } else if (input.module === ServiceCode.PROCEDURE) {
    /*=============== Validation for PROCCEDURE =================*/
    const patientProcedure = await validateIdPatientProcedure(
      input.referenceId,
    );
    if (patientProcedure.ccId !== input.ccId) {
      throw new ErrorHandler(400, generateErrorMessage("ACCESS_FAIL"));
    }
    input.referenceNumber = patientProcedure.patientProcedureRefNo;
    input.patientId = patientProcedure.patientId;

    //validation for taking payment
    if (input.transactionType === TransactionType.CREDIT) {
      // valid only when status is UNPAID or PARTIAL
      const allowedStatus: ProcedurePaymentStatus[] = [
        ProcedurePaymentStatus.PENDING,
        ProcedurePaymentStatus.PARTIAL,
      ];
      if (!allowedStatus.includes(patientProcedure.paymentStatus)) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_STATUS", "Patient Procedure"),
        );
      }

      const ppCustomerPayAmt =
        patientProcedure.netAmount - patientProcedure.paidAmount;
      if (input.totalPaidAmount && input.totalPaidAmount > ppCustomerPayAmt) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_VALUE", "Total Paid Amount"),
        );
      }
      const totalSplitAmount = input.details.reduce(
        (acc, curr) => acc + (curr.paidAmount ?? 0),
        0,
      );

      if (totalSplitAmount !== input.totalPaidAmount) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "MISMATCH",
            `Total split amount (${totalSplitAmount}) does not match total paid amount (${input.totalPaidAmount})`,
          ),
        );
      }

      input.paymentStatus =
        input.totalPaidAmount === ppCustomerPayAmt ? "PAID" : "PARTIAL";

      for (const detail of input.details) {
        if (detail.bankHeadId) {
          const bank = await getBankHeadByIdFromDb(detail.bankHeadId);
          if (!bank) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Bank Head"),
            );
          }
        }
        if (detail.mobileMoneyMethodId) {
          const mobileMoneyMethod = await getMobileMoneyMethodByIdFromDb(
            detail.mobileMoneyMethodId,
          );
          if (!mobileMoneyMethod) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Mobile Money Method"),
            );
          }
        }

        detail.netAmount = patientProcedure.netAmount;
        detail.dueAmount = ppCustomerPayAmt - (detail.paidAmount ?? 0);
        detail.refundAmount = 0;
      }
    } else {
      //validation for refund payment
      if (patientProcedure.paymentStatus !== ProcedurePaymentStatus.REFUND) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_STATUS", "Patient Procedure"),
        );
      }
      const ppRefundAmt = patientProcedure.refundAmount;
      if (input.totalRefundAmount && input.totalRefundAmount > ppRefundAmt) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_VALUE", "Total Refund Amount"),
        );
      }
      const totalSplitAmount = input.details.reduce(
        (acc, curr) => acc + (curr.refundAmount ?? 0),
        0,
      );

      if (totalSplitAmount !== input.totalRefundAmount) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "MISMATCH",
            `Total split amount (${totalSplitAmount}) does not match total refund amount (${input.totalRefundAmount})`,
          ),
        );
      }

      input.paymentStatus =
        input.totalRefundAmount === ppRefundAmt ? "REFUNDED" : "PARTIAL";

      for (const detail of input.details) {
        if (detail.bankHeadId) {
          const bank = await getBankHeadByIdFromDb(detail.bankHeadId);
          if (!bank) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Bank Head"),
            );
          }
        }
        if (detail.mobileMoneyMethodId) {
          const mobileMoneyMethod = await getMobileMoneyMethodByIdFromDb(
            detail.mobileMoneyMethodId,
          );
          if (!mobileMoneyMethod) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Mobile Money Method"),
            );
          }
        }

        detail.netAmount = patientProcedure.netAmount;
        detail.paidAmount = 0;
        detail.dueAmount = ppRefundAmt - (detail.refundAmount ?? 0);
      }
    }
  } else if (input.module === ServiceCode.GENERAL_BILL) {
    /*=============== Validation for General Bill =================*/
    const generalBilling = await validateIdGeneralBilling(input.referenceId);
    if (generalBilling.ccId !== input.ccId) {
      throw new ErrorHandler(400, generateErrorMessage("ACCESS_FAIL"));
    }
    input.referenceNumber = generalBilling.billNumber;
    input.patientId = generalBilling.patientId;

    //validation for taking payment
    if (input.transactionType === TransactionType.CREDIT) {
      // valid only when status is UNPAID or PARTIAL
      const allowedStatus: PaymentStatus[] = [
        PaymentStatus.PENDING,
        PaymentStatus.PARTIAL,
      ];
      if (!allowedStatus.includes(generalBilling.paymentStatus)) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_STATUS", "General Billing"),
        );
      }

      const gbCustomerPayAmt =
        generalBilling.netAmount - generalBilling.paidAmount;
      if (input.totalPaidAmount && input.totalPaidAmount > gbCustomerPayAmt) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_VALUE", "Total Paid Amount"),
        );
      }
      const totalSplitAmount = input.details.reduce(
        (acc, curr) => acc + (curr.paidAmount ?? 0),
        0,
      );

      if (totalSplitAmount !== input.totalPaidAmount) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "MISMATCH",
            `Total split amount (${totalSplitAmount}) does not match total paid amount (${input.totalPaidAmount})`,
          ),
        );
      }

      input.paymentStatus =
        input.totalPaidAmount === gbCustomerPayAmt ? "PAID" : "PARTIAL";

      for (const detail of input.details) {
        if (detail.bankHeadId) {
          const bank = await getBankHeadByIdFromDb(detail.bankHeadId);
          if (!bank) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Bank Head"),
            );
          }
        }
        if (detail.mobileMoneyMethodId) {
          const mobileMoneyMethod = await getMobileMoneyMethodByIdFromDb(
            detail.mobileMoneyMethodId,
          );
          if (!mobileMoneyMethod) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Mobile Money Method"),
            );
          }
        }

        detail.netAmount = generalBilling.netAmount;
        detail.dueAmount = gbCustomerPayAmt - (detail.paidAmount ?? 0);
        detail.refundAmount = 0;
      }
    } else {
      //validation for refund payment
      if (generalBilling.paymentStatus !== ProcedurePaymentStatus.REFUND) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_STATUS", "General Billing"),
        );
      }
      const gbRefundAmt = generalBilling.refundAmount;
      if (input.totalRefundAmount && input.totalRefundAmount > gbRefundAmt) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_VALUE", "Total Refund Amount"),
        );
      }
      const totalSplitAmount = input.details.reduce(
        (acc, curr) => acc + (curr.refundAmount ?? 0),
        0,
      );

      if (totalSplitAmount !== input.totalRefundAmount) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "MISMATCH",
            `Total split amount (${totalSplitAmount}) does not match total refund amount (${input.totalRefundAmount})`,
          ),
        );
      }

      input.paymentStatus =
        input.totalRefundAmount === gbRefundAmt ? "REFUNDED" : "PARTIAL";

      for (const detail of input.details) {
        if (detail.bankHeadId) {
          const bank = await getBankHeadByIdFromDb(detail.bankHeadId);
          if (!bank) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Bank Head"),
            );
          }
        }
        if (detail.mobileMoneyMethodId) {
          const mobileMoneyMethod = await getMobileMoneyMethodByIdFromDb(
            detail.mobileMoneyMethodId,
          );
          if (!mobileMoneyMethod) {
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Mobile Money Method"),
            );
          }
        }

        detail.netAmount = generalBilling.netAmount;
        detail.paidAmount = 0;
        detail.dueAmount = gbRefundAmt - (detail.refundAmount ?? 0);
      }
    }
  } else {
    throw new ErrorHandler(400, "Payment for this module is not allowed");
  }

  logger.info("exiting::createPayment::service::validation");
};
