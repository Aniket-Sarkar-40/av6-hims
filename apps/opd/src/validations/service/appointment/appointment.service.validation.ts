import {
  getAppointmentByAptIdFromDb,
  getAppointmentCharges,
  getAppointmentsByIdFromDb,
  valAppointmentsByIdFromDb,
} from "@/repository/appointment/appointment.repository.js";
import {
  AppointmentChargesResponse,
  CancelAppointmentReq,
  CreateAppointmentsTableInput,
  GetAppointmentFeesInput,
  RescheduleAppointmentInput,
  UpgradeAppointmentReq,
} from "@/types/appointment/appointment.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";

import { getCorporateClientById } from "@/repository/corporate/corporate.repository.js";
import { isTimeSlotAvailableFromDb } from "@/repository/timeSlot/timeSlot.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  AptStatus,
  ClientMaster,
  PaymentStatus,
} from "@repo/db/generated/prisma/client";
import { validateIdCorporateClient } from "../corporate/corporate.service.validation.js";
import { validateIdDoctor } from "../doctor/doctor.service.validation.js";
import { validateIdInsurance } from "../insurance/insurance.service.validation.js";
import { validateIdPatientsInsurance } from "../insurance/patientInsurance.service.validation.js";
import { validateIdCollectionCenter } from "../master/collectionCenter.service.validation.js";
import { validateIdPatients } from "../patient/patient.service.validation.js";

export const validateIdAppointment = async (id: number) => {
  logger.info("entering::validateIdAppointment::service::validation");
  validIdCheck(id);
  const appointment = await valAppointmentsByIdFromDb(id);
  if (!appointment) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Appointment"),
    );
  }
  logger.info("exiting::validateIdAppointments::service::validation");
  return appointment;
};
export const validateIdAppointmentWithIncludes = async (id: number) => {
  logger.info(
    "entering::validateIdAppointmentWithIncludes::service::validation",
  );
  validIdCheck(id);
  const appointment = await getAppointmentsByIdFromDb(id);
  if (!appointment) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Appointment"),
    );
  }
  logger.info(
    "exiting::validateIdAppointmentWithIncludes::service::validation",
  );
  return appointment;
};

export const validateIdAppointmentByAptId = async (aptId: string) => {
  logger.info("entering::validateIdAppointmentByAptId::service::validation");
  const appointment = await getAppointmentByAptIdFromDb(aptId);
  if (!appointment) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "appointments"),
    );
  }
  logger.info("exiting::validateIdAppointmentByAptId::service::validation");
  return appointment;
};

export const commonAppointmentServiceValidation = async (
  body: CreateAppointmentsTableInput,
) => {
  logger.info(
    "entering::commonAppointmentServiceValidation::service::validation",
  );

  const isVipBooking = !!body.isVipBooking;
  const isSpecialBooking = !!body.isSpecialBooking;

  if (isVipBooking && isSpecialBooking)
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Booking type"),
    );

  const patient = await validateIdPatients(body.patientId);

  if (patient.patientUniqueId != body.patientUniqueId) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("VALUE_MISMATCH", "Patient Unique Id"),
    );
  }
  await validateIdDoctor(body.doctorId);

  const isAvailable = await isTimeSlotAvailableFromDb(
    body.doctorId,
    new Date(body.selectedDate),
    body.selectedTime,
  );

  if (!isAvailable) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_AVAILABLE", "Selected Date & Time"),
    );
  }
  let client: ClientMaster | null = null;

  if (body.appointmentType === "CORPORATE") {
    if (!body.clientId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", "Client Id"),
      );
    }
    client = await validateIdCorporateClient(body.clientId);
  } else if (body.appointmentType === "INSURANCE") {
    if (!body.insuranceId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", "Insurance Id"),
      );
    }
    await validateIdInsurance(body.insuranceId);

    if (body.patientInsuranceId) {
      const patIns = await validateIdPatientsInsurance(body.patientInsuranceId);
      if (body.insuranceId && patIns.insurerId !== body.insuranceId) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_ID", "Patient Insurance"),
        );
      }
    }
  }

  const appointmentCharges = await getAppointmentCharges({
    bookingType: isVipBooking
      ? "VIP"
      : isSpecialBooking
        ? "SPECIAL"
        : "REGULAR",
    ccId: body.ccId,
    doctorId: body.doctorId,
    weekId: body.weekId,
    patientType: body.referredBy || "NEW_PATIENT",
    insuranceId: body.insuranceId ?? undefined,
    isFoc: body.isFoc || false,
    client: client,
    clientId: body.clientId ?? undefined,
    discountMethod: body.additionalDiscountMode || "PERCENTAGE",
    discountValue: body.additionalDiscountValue ?? 0,
    taxMethod: body.taxMethod ?? "EXCLUSIVE",
    taxPercent: body.taxValue || 0,
  });

  body.coPaymentType = appointmentCharges.coPaymentMethod;
  body.coPaymentValue = appointmentCharges.coPaymentValue;

  compareResponse(appointmentCharges, body);

  if (body.netAmount === 0) {
    body.paymentStatus = "SETTLED";
  }

  logger.info(
    "exiting::commonAppointmentServiceValidation::service::validation",
  );
};

export const createAppointmentServiceValidation = async (
  body: CreateAppointmentsTableInput,
) => {
  logger.info(
    "entering::createAppointmentServiceValidation::service::validation",
  );

  await commonAppointmentServiceValidation(body);

  logger.info(
    "exiting::createAppointmentServiceValidation::service::validation",
  );
};

export const updateAppointmentServiceValidation = async (
  body: CreateAppointmentsTableInput,
) => {
  logger.info(
    "entering::updateAppointmentServiceValidation::service::validation",
  );

  if (!body.id) {
    logger.error("missing appointment id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Appointment id"),
    );
  }
  logger.info(`validating existence of appointments id=${body.id}`);
  await validateIdAppointment(body.id);
  await commonAppointmentServiceValidation(body);

  logger.info(
    "exiting::updateAppointmentServiceValidation::service::validation",
  );
};

export const cancelAppointmentServiceValidation = async (
  input: CancelAppointmentReq,
) => {
  logger.info(
    "entering::cancelAppointmentServiceValidation::service::validation",
  );

  const appointment = await validateIdAppointment(input.id);

  if (appointment.status === "COMPLETE" || appointment.status === "CANCELLED")
    throw new ErrorHandler(
      404,
      generateErrorMessage("INVALID_STATUS", "Appointment"),
    );

  if (
    appointment.pharmacyStatus === "BOOKED" ||
    appointment.procedureStatus === "BOOKED"
  ) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("INVALID_STATUS", "Appointment"),
    );
  }

  if (appointment.paidAmount - appointment.refundedAmount > 0)
    input.newPaymentStatus = "REFUND";
  else input.newPaymentStatus = "SETTLED";

  input.appointment = appointment;

  logger.info(
    "exiting::cancelAppointmentServiceValidation::service::validation",
  );
};

export const rescheduleServiceValidation = async (
  body: RescheduleAppointmentInput,
) => {
  logger.info("entering::rescheduleServiceValidation::service::validation");

  if (!body.id) {
    logger.error("Missing appointment id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Appointment id"),
    );
  }

  const existingApt = await validateIdAppointment(body.id);
  body.existingAppointment = existingApt;

  if (existingApt.status === "COMPLETE" || existingApt.status === "CANCELLED") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Appointment"),
    );
  }

  const isAvailable = await isTimeSlotAvailableFromDb(
    body.doctorId,
    new Date(body.selectedDate),
    body.selectedTime,
  );

  if (!isAvailable) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_AVAILABLE", "Selected Date & Time"),
    );
  }

  // let isMigrated = false;

  // if (existingApt.doctorId != body.doctorId) {
  //   isMigrated = true;
  // }

  const client = existingApt.clientId
    ? await getCorporateClientById(existingApt.clientId)
    : null;

  const appointmentCharges = await getAppointmentCharges({
    bookingType: existingApt.isVipBooking
      ? "VIP"
      : existingApt.isSpecialBooking
        ? "SPECIAL"
        : "REGULAR",
    ccId: body.ccId,
    doctorId: body.doctorId,
    weekId: body.weekId,
    patientType: existingApt.referredBy || "NEW_PATIENT",
    insuranceId: existingApt.insuranceId ?? undefined,
    isFoc: existingApt.isFoc || false,
    client: client,
    clientId: existingApt.clientId ?? undefined,
    discountMethod: existingApt.additionalDiscountMode || "PERCENTAGE",
    discountValue: existingApt.additionalDiscountValue ?? 0,
    taxMethod: existingApt.taxMethod,
    taxPercent: existingApt.taxValue || 0,
  });

  compareResponse(appointmentCharges, body);
};

const compareResponse = (
  appointmentCharges: AppointmentChargesResponse,
  body: RescheduleAppointmentInput | CreateAppointmentsTableInput,
) => {
  if (appointmentCharges.grossAmount !== (body.grossAmount ?? 0)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Gross Amount (${body.grossAmount}) does not match calculated gross amount (${appointmentCharges.grossAmount}).`,
      ),
    );
  }

  if (appointmentCharges.discountAmount !== (body.discountTotalAmount ?? 0)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Discount (${body.discountTotalAmount}) does not match calculated net discount (${appointmentCharges.discountAmount ?? 0}).`,
      ),
    );
  }

  if (appointmentCharges.taxAmount !== (body.taxAmount ?? 0)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Tax (${body.taxAmount}) does not match calculated net amount (${appointmentCharges.taxAmount ?? 0}).`,
      ),
    );
  }

  if (appointmentCharges.netAmount !== body.netAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Amount (${body.netAmount}) does not match calculated net amount (${appointmentCharges.netAmount}).`,
      ),
    );
  }

  if (appointmentCharges.copayAmount !== body.coPaymentAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Co-pay amount (${body.coPaymentAmount}) does not match calculated Co-pay amount (${appointmentCharges.copayAmount}).`,
      ),
    );
  }

  if (appointmentCharges.subtotalAmount !== body.subtotalAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Consultation fee (${body.subtotalAmount}) does not match calculated consultation fee (${appointmentCharges.subtotalAmount}).`,
      ),
    );
  }

  if (appointmentCharges.otherChargeAmount !== body.otherChargeAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Vip special fee (${body.otherChargeAmount}) does not match calculated Vip special fee (${appointmentCharges.otherChargeAmount}).`,
      ),
    );
  }
};

// export const convertToVipOrSpecialServiceValidation = async (
//   body: ConvertAppointmentToVipOrSpecial
// ): Promise<ConvertAppointmentToVipOrSpecialValidatedPayload> => {
//   logger.info("entering::convertToVipOrSpecialServiceValidation::service::validation");

//   const existingApt = await validateIdAppointment(body.aptId);

//   if (body.isVipBooking && body.isSpecialBooking) {
//     throw new ErrorHandler(400, generateErrorMessage("INVALID_VALUE", "Booking type"));
//   }

//   if (!body.isVipBooking && !body.isSpecialBooking) {
//     throw new ErrorHandler(400, generateErrorMessage("INVALID_VALUE", "Booking type"));
//   }

//   const baseFee = Number(existingApt.netAmount) || 0;
//   const vipFee = Number(existingApt.vipSpecialFee) || 0;

//   let paidAmount = Number(existingApt.paidAmount) || 0;
//   let dueAmount = existingApt.dueAmount != null ? Number(existingApt.dueAmount) : 0;

//   if (existingApt.appointmentType === "CORPORATE") {
//     const client = await validateIdCorporateClient(Number(existingApt.clientId));
//     if (!client) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Client"));

//     type CashFlag = { isCashClient?: string | boolean | number };
//     const raw = (client as CashFlag).isCashClient;

//     let isCashClient = true;
//     if (typeof raw === "string") {
//       isCashClient = raw.toLowerCase() === "yes" || raw === "1" || raw.toLowerCase() === "true";
//     } else if (typeof raw === "boolean") {
//       isCashClient = raw;
//     } else if (typeof raw === "number") {
//       isCashClient = raw === 1;
//     }

//     if (existingApt.corporatePaymentType === "POST_PAID") {
//       if (!isCashClient) {
//         paidAmount = Math.max(0, baseFee - vipFee);
//         dueAmount = vipFee;
//       }
//     } else {
//       if (!isCashClient) paidAmount = baseFee;
//     }
//   }

//   if (existingApt.appointmentType === "INSURANCE") {
//     let coPayType = existingApt.coPaymentType ?? null;
//     let coPayValue = Number(existingApt.coPaymentValue) || 0;
//     let coPayAmount = existingApt.coPaymentAmount ? Number(existingApt.coPaymentAmount) : 0;

//     if (coPayType === "PERCENTAGE" && coPayValue > 0) {
//       coPayAmount = Math.max(0, applyRound((baseFee * coPayValue) / 100, RoundFormat.ROUND));
//     }
//     if (coPayType !== "PERCENTAGE" && coPayType !== "AMOUNT") {
//       coPayType = null;
//       coPayValue = 0;
//     }

//     if (!existingApt.isFoc) {
//       if (paidAmount < coPayAmount) paidAmount = coPayAmount;
//       const targetDue = Math.max(0, baseFee - coPayAmount);
//       if (!dueAmount || dueAmount < targetDue) dueAmount = targetDue;
//     }
//   }

//   let finalFee = baseFee + Math.trunc(coPayAmount);

//   if (existingApt.isFoc) {
//     paidAmount = 0;
//     dueAmount = vipFee;
//     coPayType = null;
//     coPayValue = 0;
//     coPayAmount = 0;
//     finalFee = baseFee;
//   }

//   const normalized: ConvertAppointmentToVipOrSpecialValidatedPayload = {
//     aptDbId: existingApt.id,
//     isVipBooking: body.isVipBooking,
//     isSpecialBooking: body.isSpecialBooking,
//     netAmount: finalFee,
//     vipSpecialFee: vipFee || 0,
//     coPaymentType: coPayType,
//     coPaymentValue: coPayValue || null,
//     coPaymentAmount: coPayAmount || null,
//     paidAmount: paidAmount,
//     dueAmount: dueAmount ? dueAmount : null,
//     paymentStatus: existingApt.paymentStatus ?? (dueAmount === 0 ? "SETTLED" : "PENDING"),
//     isFoc: existingApt.isFoc,
//     coPaymentSource: existingApt.coPaymentSource ?? "MANUAL",
//   };

//   logger.info("exiting::convertToVipOrSpecialServiceValidation::service::validation");
//   return normalized;
// };

export const upgradeAppointmentServiceValidation = async (
  input: UpgradeAppointmentReq,
) => {
  logger.info("entering::upgradeAppointment::service::validation");
  const { appointmentId, isVipBooking, isSpecialBooking } = input;
  const appointment = await validateIdAppointmentWithIncludes(appointmentId);

  if (isVipBooking && isSpecialBooking)
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Booking type"),
    );

  if (!isVipBooking && !isSpecialBooking)
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Booking type"),
    );

  if (
    appointment.paymentStatus !== PaymentStatus.PENDING &&
    appointment.status !== AptStatus.BOOKED
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Appointment"),
    );
  }

  const appointmentCharges = await getAppointmentCharges({
    bookingType: isVipBooking
      ? "VIP"
      : isSpecialBooking
        ? "SPECIAL"
        : "REGULAR",
    ccId: appointment.ccId,
    doctorId: appointment.doctorId,
    weekId: appointment.weekId,
    patientType: appointment.referredBy || "NEW_PATIENT",
    insuranceId: appointment.insuranceId ?? undefined,
    isFoc: appointment.isFoc || false,
    client: appointment.client ?? null,
    clientId: appointment.clientId ?? undefined,
    discountMethod: appointment.additionalDiscountMode || "PERCENTAGE",
    discountValue: appointment.additionalDiscountValue ?? 0,
    taxMethod: appointment.taxMethod ?? "EXCLUSIVE",
    taxPercent: appointment.taxValue || 0,
  });

  logger.info("exiting::upgradeAppointment::service::validation");
  return appointmentCharges;
};

export const getAppointmentFeesServiceValidation = async (
  input: GetAppointmentFeesInput,
) => {
  logger.info("entering::getAppointmentFees::service::validation");
  const { ccId, doctorId, insuranceId, clientId } = input;

  await validateIdCollectionCenter(ccId);
  await validateIdDoctor(doctorId);
  if (insuranceId) await validateIdInsurance(insuranceId);
  if (clientId) await validateIdCorporateClient(clientId);

  logger.info("exiting::getAppointmentFees::service::validation");
};
