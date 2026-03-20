import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { getGeneralBillingWithDetailsByIdFromDb } from "@/repository/appointment/generalBilling.repository.js";
import { getPatientProcedureByIdFromDbWithDetails } from "@/repository/appointment/patientProcedure.repository.js";
import { appointmentService } from "@/services/appointment/appointment.service.js";
import {
  GetPaymentDetailsReq,
  PaymentDetailsChildResponse,
  PaymentDetailsResponse,
} from "@/types/payment/payment.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { customOmit, toIdValue } from "av6-utils";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  PatientProcedureDetails,
  ServiceCode,
} from "@repo/db/generated/prisma/client";
import { EmployeeCache } from "../../types/employee.js";
import { toCorporateInternalDto } from "../corporate/corporate.mapper.js";
import { toInsuranceInternalDto } from "../insurance/insurance.mapper.js";
import { toPatientInternalRes } from "../patient/patient.mapper.js";

export const toGetPaymentDetailsByIdModuleWise = async (
  input: GetPaymentDetailsReq,
): Promise<PaymentDetailsResponse> => {
  const { module, id } = input;
  switch (module) {
    case ServiceCode.OPD: {
      const appointment = await appointmentService.getAppointmentByIdWoDto(id);
      if (!appointment) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_VALUE", "Id"),
        );
      }
      let lastUpdatedBy: EmployeeCache | null = null;
      if (appointment.updatedBy) {
        lastUpdatedBy = await employeeService.getEmployeeByIdFrmCacheOrDb(
          appointment.updatedBy,
          true,
        );
      } else {
        lastUpdatedBy = appointment.createdBy
          ? await employeeService.getEmployeeByIdFrmCacheOrDb(
              appointment.createdBy,
              true,
            )
          : null;
      }

      return {
        module: module,
        refId: appointment.id,
        refNo: appointment.appointmentId,
        billNo: appointment.billId,
        refDate: appointment.selectedDate,
        ccId: appointment.ccId,
        visitType: appointment.appointmentType,
        additionalDiscountMode: appointment.additionalDiscountMode,
        additionalDiscountValue: appointment.additionalDiscountValue,
        subtotalAmount: appointment.subtotalAmount,
        otherChargeAmount: appointment.otherChargeAmount,
        discountTotalAmount: appointment.discountTotalAmount,
        taxAmount: appointment.taxAmount,
        grossAmount: appointment.grossAmount,
        netAmount: appointment.netAmount,
        coPaymentAmount: appointment.coPaymentAmount ?? 0,
        paidAmount: appointment.paidAmount,
        refundAmount: appointment.refundAmount,
        refundedAmount: appointment.refundedAmount,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        patient: toPatientInternalRes(appointment.patient),
        doctor: toIdValue(appointment.doctor, "name"),
        client: appointment.client
          ? toCorporateInternalDto(appointment.client)
          : null,
        insurance: appointment.patientInsurance
          ? toInsuranceInternalDto(appointment.patientInsurance)
          : null,
        lastUpdatedBy: lastUpdatedBy ? toIdValue(lastUpdatedBy, "name") : null,
        lastUpdatedAt: appointment.updatedAt,
        collectionCenter: toIdValue(appointment.cc, "colName"),
        details: [],
      };
    }
    case ServiceCode.PROCEDURE: {
      const patientProcedure =
        await getPatientProcedureByIdFromDbWithDetails(id);
      if (!patientProcedure) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("NOT_FOUND", "Patient Procedure"),
        );
      }

      let lastUpdatedBy: EmployeeCache | null = null;
      if (patientProcedure.updatedBy) {
        lastUpdatedBy = await employeeService.getEmployeeByIdFrmCacheOrDb(
          patientProcedure.updatedBy,
          true,
        );
      } else {
        lastUpdatedBy = patientProcedure.createdBy
          ? await employeeService.getEmployeeByIdFrmCacheOrDb(
              patientProcedure.createdBy,
              true,
            )
          : null;
      }
      const { patientProcedureDetails } = patientProcedure;

      const details: PaymentDetailsChildResponse[] =
        patientProcedureDetails.map((d) => {
          const omittedData = customOmit<
            PatientProcedureDetails,
            | "patientProcedureId"
            | "procedureId"
            | "procedureName"
            | "isActive"
            | "createdBy"
            | "updatedBy"
            | "deletedBy"
            | "createdAt"
            | "updatedAt"
            | "deletedAt"
          >(d, [
            "patientProcedureId",
            "procedureId",
            "procedureName",
            "isActive",
            "createdBy",
            "updatedBy",
            "deletedBy",
            "createdAt",
            "updatedAt",
            "deletedAt",
          ]);
          return {
            masterId: d.patientProcedureId,
            itemId: d.procedureId,
            itemName: d.procedureName,
            qty: 1,
            rate: d.subtotalAmount,
            ...omittedData.rest,
          };
        });

      return {
        module: module,
        refId: patientProcedure.id,
        refNo: patientProcedure.patientProcedureRefNo,
        billNo: patientProcedure.billNumber,
        refDate: patientProcedure.createdAt,
        ccId: patientProcedure.ccId,
        visitType: patientProcedure.appointment.appointmentType,
        additionalDiscountMode: patientProcedure.additionalDiscountMode,
        additionalDiscountValue: patientProcedure.additionalDiscountValue,
        subtotalAmount: patientProcedure.subtotalAmount,
        otherChargeAmount: patientProcedure.otherChargeAmount,
        discountTotalAmount: patientProcedure.discountTotalAmount,
        taxAmount: patientProcedure.taxAmount,
        grossAmount: patientProcedure.grossAmount,
        netAmount: patientProcedure.netAmount,
        coPaymentAmount: patientProcedure.coPaymentAmount,
        paidAmount: patientProcedure.paidAmount,
        refundAmount: patientProcedure.refundAmount,
        refundedAmount: patientProcedure.refundedAmount,
        status: patientProcedure.status,
        paymentStatus: patientProcedure.paymentStatus,
        patient: toPatientInternalRes(patientProcedure.patient),
        doctor: toIdValue(patientProcedure.appointment.doctor, "name"),
        client: patientProcedure.client
          ? toCorporateInternalDto(patientProcedure.client)
          : null,
        insurance: patientProcedure.patientInsurance
          ? toInsuranceInternalDto(patientProcedure.patientInsurance)
          : null,
        collectionCenter: toIdValue(
          patientProcedure.collectionCenter,
          "colName",
        ),
        lastUpdatedBy: lastUpdatedBy ? toIdValue(lastUpdatedBy, "name") : null,
        lastUpdatedAt: patientProcedure.updatedAt,
        details,
      };
    }
    case ServiceCode.GENERAL_BILL: {
      const generalBilling = await getGeneralBillingWithDetailsByIdFromDb(id);
      if (!generalBilling) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("NOT_FOUND", "General Billing"),
        );
      }

      let lastUpdatedBy: EmployeeCache | null = null;
      if (generalBilling.updatedBy) {
        lastUpdatedBy = await employeeService.getEmployeeByIdFrmCacheOrDb(
          generalBilling.updatedBy,
          true,
        );
      } else {
        lastUpdatedBy = generalBilling.createdBy
          ? await employeeService.getEmployeeByIdFrmCacheOrDb(
              generalBilling.createdBy,
              true,
            )
          : null;
      }

      const details: PaymentDetailsChildResponse[] =
        generalBilling.generalBillingDetails.map((d) => {
          const omittedData = customOmit(d, [
            "generalBillingId",
            "generalBillItemId",
            "generalBillItem",
            "isActive",
            "createdBy",
            "updatedBy",
            "deletedBy",
            "createdAt",
            "updatedAt",
            "deletedAt",
          ]);
          return {
            masterId: d.generalBillingId,
            itemId: d.generalBillItemId,
            itemName: d.generalBillItem.name,
            qty: 1,
            rate: d.subtotalAmount,
            ...omittedData.rest,
            coPaymentMode: null,
            coPaymentValue: 0,
            coPaymentAmount: 0,
            coPaymentSource: null,
            isReturned: d.isRefunded,
          };
        });

      return {
        module: module,
        refId: generalBilling.id,
        refNo: generalBilling.billNumber,
        billNo: generalBilling.billNumber,
        refDate: generalBilling.createdAt,
        ccId: generalBilling.ccId,
        visitType: null,
        additionalDiscountMode: generalBilling.additionalDiscountMode,
        additionalDiscountValue: generalBilling.additionalDiscountValue,
        subtotalAmount: generalBilling.subtotalAmount,
        otherChargeAmount: generalBilling.otherChargeAmount,
        discountTotalAmount: generalBilling.discountTotalAmount,
        taxAmount: generalBilling.taxAmount,
        grossAmount: generalBilling.grossAmount,
        netAmount: generalBilling.netAmount,
        coPaymentAmount: 0,
        paidAmount: generalBilling.paidAmount,
        refundAmount: generalBilling.refundAmount,
        refundedAmount: generalBilling.refundedAmount,
        status: generalBilling.status,
        paymentStatus: generalBilling.paymentStatus,
        patient: toPatientInternalRes(generalBilling.patient),
        doctor: null,
        client: null,
        insurance: null,
        collectionCenter: toIdValue(generalBilling.collectionCenter, "colName"),
        lastUpdatedBy: lastUpdatedBy ? toIdValue(lastUpdatedBy, "name") : null,
        lastUpdatedAt: generalBilling.updatedAt,
        details,
      };
    }
    default:
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", "Module"),
      );
  }
};
