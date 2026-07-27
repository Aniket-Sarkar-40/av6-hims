import { uinServiceFactory } from "@/config/core.config.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreatePaymentInput,
  GetPaymentReq,
  PaymentResponse,
} from "@/types/payment/payment.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  GeneralBillingStatus,
  ServiceCode,
  PaymentStatus,
  Prisma,
  ProcedurePaymentStatus,
  TransactionType,
  OpdUinShortCode,
} from "@repo/db/generated/prisma/client";
import { PaginatedResponse } from "av6-core-v2";
import { customOmit } from "av6-utils";

export const getAllPaymentsFromDb = async (
  input: GetPaymentReq,
): Promise<PaginatedResponse<PaymentResponse>> => {
  logger.info("entering::getAllPaymentsFromDb::repository");
  const {
    ccId,
    pageNo,
    pageSize,
    paymentStatus,
    sortBy,
    searchText,
    startDate,
    endDate,
  } = input;
  const offset = (pageNo - 1) * pageSize;

  const pattern = `%${(searchText ?? "").replace(/[%_]/g, "\\$&")}%`;

  const dateCondition =
    startDate && endDate
      ? Prisma.sql`AND unified.createdAt BETWEEN ${startDate} AND ${endDate}`
      : Prisma.empty;

  const orderDBy =
    sortBy?.toUpperCase() === "ASC" ? Prisma.raw("ASC") : Prisma.raw("DESC");

  const dataQuery = Prisma.sql`
  SELECT unified.*,
   p.patient_name AS patientName,
        p.mobileno AS patientMobileNo
FROM (
    /* ===================== OPD ===================== */
    SELECT
        'OPD' AS module,
        a.id AS id,
        a.appointment_id AS refNo,
        a.id AS refId,
        a.selected_date AS refDate,
        a.bill_id AS billNo,
        a.appointment_type AS visitType,
        a.patient_id AS patientId,
        a.gross_amount AS totalAmount,
        a.discount_total_amount AS discountAmount,
        a.copayment_amount AS coPaymentAmount,
        a.paid_amount AS paidAmount,
        (a.net_amount - a.paid_amount) AS dueAmount,
        a.refund_amount AS refundAmount,
        a.refunded_amount AS refundedAmount,
        CASE 
            WHEN a.payment_status IN ('PENDING','PARTIAL')
            THEN 'PENDING' 
            WHEN a.payment_status ='REFUND'
            THEN 'REFUND' 
            ELSE 'SETTLED' 
        END AS paymentStatus,
        a.created_at AS createdAt
    FROM nopd_appointments a
    
    WHERE a.cc_id = ${ccId}
      AND a.is_active = TRUE

    UNION ALL

    /* ===================== PROCEDURE ===================== */
    SELECT
        'PROCEDURE' AS module,
        pp.id AS id,
        a.appointment_id AS refNo,
        pp.appointment_id AS refId,
        a.selected_date AS refDate,
        pp.bill_number AS billNo,
        a.appointment_type AS visitType,
        pp.patient_id AS patientId,
        pp.gross_amount AS totalAmount,
        pp.discount_total_amount AS discountAmount,
        pp.co_payment_amount AS coPaymentAmount,
        pp.paid_amount AS paidAmount,
        (pp.net_amount - pp.paid_amount )AS dueAmount,
        pp.refund_amount AS refundAmount,
        pp.refunded_amount AS refundedAmount,
        CASE 
             WHEN pp.payment_status IN ('PENDING','PARTIAL')
            THEN 'PENDING' 
            WHEN pp.payment_status ='REFUND'
            THEN 'REFUND' 
            ELSE 'SETTLED' 
        END AS paymentStatus,
        pp.created_at AS createdAt
    FROM nopd_patient_procedure pp
    LEFT join  nopd_appointments a ON a.id = pp.appointment_id
    WHERE pp.cc_id = ${ccId}
      AND pp.is_active = TRUE

    UNION ALL

    /* ===================== GENERAL BILL ===================== */
    SELECT
        'GENERAL_BILL' AS module,
        gb.id AS id,
        gb.bill_number AS refNo,
        NULL AS refId,
        gb.created_at AS refDate,
        gb.bill_number AS billNo,
        NULL AS visitType,
        gb.patient_id AS patientId,
        gb.gross_amount AS totalAmount,
        gb.discount_total_amount AS discountAmount,
        0 AS coPaymentAmount,
        gb.paid_amount AS paidAmount,
        (gb.net_amount - gb.paid_amount )AS dueAmount,
        gb.refund_amount AS refundAmount,
        gb.refunded_amount AS refundedAmount,
        CASE 
             WHEN gb.payment_status IN ('PENDING','PARTIAL')
            THEN 'PENDING' 
            WHEN gb.payment_status ='REFUND'
            THEN 'REFUND' 
            ELSE 'SETTLED' 
        END AS paymentStatus,
        gb.created_at AS createdAt
    FROM nopd_general_billing gb
    WHERE gb.cc_id = ${ccId}
      AND gb.is_active = TRUE
) AS unified
LEFT JOIN patients p ON p.id = unified.patientId
where unified.paymentStatus = ${paymentStatus}
AND(
    unified.module LIKE ${pattern}
    OR unified.refNo LIKE ${pattern}
    OR unified.billNo LIKE ${pattern}
    OR unified.visitType LIKE ${pattern}
    OR p.patient_name LIKE ${pattern}
    OR p.mobileno LIKE ${pattern}
)
 ${dateCondition}
ORDER BY unified.createdAt ${orderDBy}
LIMIT ${pageSize}
OFFSET ${offset};

`;

  const data = await db.$queryRaw<PaymentResponse[]>(dataQuery);

  // ========================= (COUNT QUERY) ========================= //
  const countQuery = Prisma.sql`
  SELECT COUNT(*) AS total
  FROM (
      SELECT
          a.id AS id,
        CASE 
            WHEN a.payment_status IN ('PENDING','PARTIAL')
            THEN 'PENDING' 
            WHEN a.payment_status ='REFUND'
            THEN 'REFUND' 
            ELSE 'SETTLED' 
        END AS paymentStatus,
          a.created_at AS createdAt,
          a.appointment_id AS refNo,
          a.bill_id AS billNo,
          a.appointment_type AS visitType,
          a.patient_id AS patientId,
          'OPD' AS module
      FROM nopd_appointments a
      WHERE a.cc_id = ${ccId}
        AND a.is_active = TRUE

      UNION ALL

      SELECT
          pp.id AS id,
          CASE 
              WHEN pp.payment_status IN ('PENDING','PARTIAL') THEN 'PENDING'
              WHEN pp.payment_status = 'REFUND' THEN 'REFUND'
              ELSE 'SETTLED'
          END AS paymentStatus,
          pp.created_at AS createdAt,
          a.appointment_id AS refNo,
          pp.bill_number AS billNo,
          a.appointment_type AS visitType,
          pp.patient_id AS patientId,
          'PROCEDURE' AS module
      FROM nopd_patient_procedure pp
      LEFT JOIN nopd_appointments a ON a.id = pp.appointment_id
      WHERE pp.cc_id = ${ccId}
        AND pp.is_active = TRUE

        UNION ALL
    SELECT
        gb.id AS id,
        CASE 
             WHEN gb.payment_status IN ('PENDING','PARTIAL')
            THEN 'PENDING' 
            WHEN gb.payment_status ='REFUND'
            THEN 'REFUND' 
            ELSE 'SETTLED' 
        END AS paymentStatus,
        gb.created_at AS createdAt,
        gb.bill_number AS refNo,
        gb.bill_number AS billNo,
        NULL AS visitType,
        gb.patient_id AS patientId,
        'GENERAL_BILL' AS module
    FROM nopd_general_billing gb
    WHERE gb.cc_id = ${ccId}
      AND gb.is_active = TRUE
  ) AS unified

  LEFT JOIN patients p ON p.id = unified.patientId  

  WHERE unified.paymentStatus = ${paymentStatus}


  AND (
      unified.module LIKE ${pattern}
      OR unified.refNo LIKE ${pattern}
      OR unified.billNo LIKE ${pattern}
      OR unified.visitType LIKE ${pattern}
      OR p.patient_name LIKE ${pattern}
      OR p.mobileno LIKE ${pattern}
  )

  ${dateCondition}; 
  `;

  const countResult = await db.$queryRaw<{ total: bigint }[]>(countQuery);
  const total = countResult?.[0]?.total ?? 0n;
  const totalRecords = Number(total);
  const totalPages = Math.ceil(totalRecords / pageSize);

  logger.info("exiting::getAllPaymentsFromDb::repository");

  return {
    data,
    totalRecords,
    currentPageNumber: pageNo,
    pageSize,
    lastPageNumber: totalPages,
  };
};

export const createPaymentInDb = async (input: CreatePaymentInput) => {
  logger.info("entering::createPaymentInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const refNo = await uinServiceFactory.generateUIN(OpdUinShortCode.TRANS);

  return await db.$transaction(async (tx) => {
    const omittedInput = customOmit<
      CreatePaymentInput,
      "totalPaidAmount" | "totalRefundAmount" | "paymentStatus" | "details"
    >(input, [
      "paymentStatus",
      "details",
      "totalPaidAmount",
      "totalRefundAmount",
    ]);
    const { totalPaidAmount, totalRefundAmount, paymentStatus, details } =
      omittedInput.omitted;
    await Promise.all(
      details.map((d) => {
        tx.paymentTransaction.create({
          data: {
            ...omittedInput.rest,
            ...d,
            cardExpiryDate: d.cardExpiryDate
              ? new Date(d.cardExpiryDate)
              : null,
            transactionNo: refNo,
            collectorId: currentUser,
            createdBy: currentUser,
          },
        });
      }),
    );

    // ========================= (UPDATE APPOINTMENT) ========================= //
    if (input.module === ServiceCode.OPD) {
      if (input.transactionType === TransactionType.CREDIT) {
        await tx.appointment.update({
          where: {
            id: input.referenceId,
          },
          data: {
            paidAmount: totalPaidAmount,
            paymentStatus: paymentStatus as PaymentStatus,
            updatedBy: currentUser,
          },
        });
      } else {
        await tx.appointment.update({
          where: {
            id: input.referenceId,
          },
          data: {
            refundAmount: { decrement: totalRefundAmount },
            refundedAmount: totalRefundAmount,
            paymentStatus: paymentStatus as PaymentStatus,
            updatedBy: currentUser,
          },
        });
      }
    }
    // ========================= (UPDATE PROCEDURE) ========================= //
    if (input.module === ServiceCode.PROCEDURE) {
      if (input.transactionType === TransactionType.CREDIT) {
        await tx.patientProcedure.update({
          where: {
            id: input.referenceId,
          },
          data: {
            paidAmount: totalPaidAmount,
            paymentStatus: paymentStatus as ProcedurePaymentStatus,
            updatedBy: currentUser,
          },
        });
      } else {
        await tx.patientProcedure.update({
          where: {
            id: input.referenceId,
          },
          data: {
            refundAmount: { decrement: totalRefundAmount },
            refundedAmount: totalRefundAmount,
            paymentStatus: paymentStatus as ProcedurePaymentStatus,
            updatedBy: currentUser,
          },
        });
      }
    }
    // ========================= (UPDATE GENERAL BILL) ========================= //
    if (input.module === ServiceCode.GENERAL_BILL) {
      if (input.transactionType === TransactionType.CREDIT) {
        await tx.generalBilling.update({
          where: {
            id: input.referenceId,
          },
          data: {
            paidAmount: totalPaidAmount,
            paymentStatus: paymentStatus as PaymentStatus,
            updatedBy: currentUser,
          },
        });
      } else {
        await tx.generalBilling.update({
          where: {
            id: input.referenceId,
          },
          data: {
            refundAmount: { decrement: totalRefundAmount },
            refundedAmount: totalRefundAmount,
            paymentStatus: paymentStatus as PaymentStatus,
            updatedBy: currentUser,
          },
        });
      }
    }
    logger.info("exiting::createPaymentInDb::repository");
  });
};
