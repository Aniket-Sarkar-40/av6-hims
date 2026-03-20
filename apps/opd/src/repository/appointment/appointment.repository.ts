import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { uinServiceFactory } from "@/config/core.config.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  AppointmentChargesResponse,
  AppointmentFeesResponse,
  AppointmentResponse,
  AppointmentStats,
  AppointmentStatus,
  BookingType,
  CancelAppointmentReq,
  CreateAppointmentsTableInput,
  GetAppointmentChargesInput,
  GetAppointmentFeesInput,
  RescheduleAppointmentInput,
  UpgradeAppointmentReq,
} from "@/types/appointment/appointment.js";
// import { applyRound } from "@/utils/commonCalculation.utils.js";
import { ISO_DATE_FORMAT } from "@repo/shared/utils/constants.utils.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  Appointment,
  DoctorSchedule,
  OpdClientMasterSetting,
  OpdInsurerPaymentSetting,
  PercentageOrAmount,
  Prisma,
  ReferredBy,
  OpdUinShortCode,
} from "@repo/db/generated/prisma/client";
import { calculateSingleChild } from "av6-utils";
import dayjs from "dayjs";
import { getClientPaymentSettingsByFilterFromDb } from "../corporate/opdClientMasterSettings.repository.js";
import { getInsurancePaymentSettingsByFilterFromDb } from "../insurance/opdInsurancePaymentSettings.repository.js";
import {
  createTimeSlotInDb,
  deleteTimeSlotFromDb,
} from "../timeSlot/timeSlot.repository.js";

export async function createOrUpdateInsurerInvoice(
  tx: Prisma.TransactionClient,
  params: {
    caseId: string;
    insurerId: number;
    grossTotal: number;
    discountAmount: number;
    coPayment: number;
    netTotal: number;
  },
) {
  // Check if invoice already exists
  const existingInvoices = await tx.$queryRawUnsafe<
    { id: number; invoice_no: string }[]
  >(
    `SELECT id, invoice_no FROM insurer_invoice_details 
             WHERE case_id = ? AND insurer_id = ? AND lower(type) = 'opd'`,
    params.caseId,
    params.insurerId,
  );

  const today = new Date();

  if (existingInvoices && existingInvoices.length > 0) {
    // Update existing invoice
    await tx.$executeRawUnsafe(
      `UPDATE insurer_invoice_details 
               SET gross_total = ?, 
                   discount_amount = ?, 
                   co_payment = ?, 
                   net_total = ?, 
                   updated_at = NOW() 
               WHERE id = ?`,
      params.grossTotal,
      params.discountAmount,
      params.coPayment,
      params.netTotal,
      existingInvoices[0].id,
    );
    console.log(`Updated insurer invoice: ${existingInvoices[0].invoice_no}`);
  } else {
    // Generate invoice number
    const invoiceNo = `INVC-${dayjs().format("YYYYMM")}${params.insurerId}`;

    // Create new invoice
    await tx.$executeRawUnsafe(
      `INSERT INTO insurer_invoice_details 
               (case_id, insurer_id, invoice_no, date, gross_total, discount_amount, co_payment, net_total, type, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?,'OPD', NOW(), NOW())`,
      params.caseId,
      params.insurerId,
      invoiceNo,
      today,
      params.grossTotal,
      params.discountAmount,
      params.coPayment,
      params.netTotal,
    );
    console.log(`Created new insurer invoice: ${invoiceNo}`);
  }
}

export const insertIntoClientInvMapping = async (
  tx: Prisma.TransactionClient,
  clientId: number,
  appointmentId: string,
  amount: number,
): Promise<void> => {
  const existingClientInvMapping = await tx.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM client_inv_map_path 
             WHERE path_invoice = ? AND client_id = ? AND lower(service_type) = 'opd'`,
    appointmentId,
    clientId,
  );

  if (existingClientInvMapping && existingClientInvMapping.length > 0) {
    await tx.$executeRaw`
    UPDATE client_inv_map_path SET amount = ${amount} WHERE id = ${existingClientInvMapping[0].id}`;
  } else {
    const today = dayjs().format(ISO_DATE_FORMAT);
    const invoiceId = `INVC-${dayjs().format("YYYYMM")}${clientId}`;

    await tx.$executeRaw`
    INSERT INTO client_inv_map_path (client_id, date, invoice_no, path_invoice, service_type, amount)
    VALUES (${clientId}, ${today}, ${invoiceId}, ${appointmentId}, "OPD", ${amount})
  `;
  }
};

export const handleClientPlanInvoiceForOpd = async (
  tx: Prisma.TransactionClient,
  params: {
    clientPlan: string | undefined;
    appointmentId: string;
    clientId: number;
    totalAmount: number;
    coPayAmount: number;
  },
) => {
  const plan = (params.clientPlan || "").toLowerCase();
  if (plan !== "postpaid" && plan !== "prepaid") return;
  // Check if invoice already exists
  const existingInvoices = await tx.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM pathology_b2b_invoice_amount_summary 
             WHERE case_id = ? AND b2b_client_id = ? AND lower(service_type) = 'opd'`,
    params.appointmentId,
    params.clientId,
  );

  if (existingInvoices && existingInvoices.length > 0) {
    await tx.$executeRawUnsafe(
      `UPDATE pathology_b2b_invoice_amount_summary 
               SET total_amount = ?, 
                   mrp_rate = ? 
               WHERE id = ?`,
      params.coPayAmount,
      params.totalAmount,
      existingInvoices[0].id,
    );
  } else {
    const creationDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const today = dayjs().format(ISO_DATE_FORMAT);
    const invoiceId = `INVC-${dayjs().format("YYYYMM")}${params.clientId}`;

    // 3) Find last payment detail for client
    const lastPayRows = await tx.$queryRawUnsafe<{ id: number }[]>(
      `SELECT id FROM b2b_invoice_payment_detail WHERE b2b_client_id = ${params.clientId} ORDER BY date DESC LIMIT 1`,
    );
    const invoicePaymentId = lastPayRows?.length
      ? Number(lastPayRows[0].id)
      : 1;

    // 4) Insert invoice data (assumes a table named b2b_invoice with matching columns)

    await tx.$executeRawUnsafe(
      `INSERT INTO pathology_b2b_invoice_amount_summary
      (case_id, invoice_id, b2b_client_id, total_amount, status, creation_date, invoice_payment_id, service_type, paid_date, mrp_rate)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'OPD', ?, ?)`,
      params.appointmentId,
      invoiceId,
      params.clientId,
      params.coPayAmount,
      plan === "prepaid" ? "paid" : "unpaid",
      creationDate,
      invoicePaymentId,
      today,
      params.totalAmount,
    );
  }
  await insertIntoClientInvMapping(
    tx,
    params.clientId,
    params.appointmentId,
    params.coPayAmount,
  );
};

export const deleteClientPlanInvoice = async (
  tx: Prisma.TransactionClient,
  appointmentId: string,
) => {
  // Delete from pathology_b2b_invoice_amount_summary
  await tx.$executeRawUnsafe(
    `DELETE FROM pathology_b2b_invoice_amount_summary 
   WHERE case_id = ?
   AND lower(service_type) = 'opd'`,
    appointmentId,
  );

  // Delete from client_inv_map_path
  await tx.$executeRawUnsafe(
    `DELETE FROM client_inv_map_path 
   WHERE path_invoice = ?
   AND lower(service_type) = 'opd'`,
    appointmentId,
  );

  await tx.$executeRawUnsafe(
    `DELETE FROM insurer_invoice_details 
   WHERE case_id = ? 
     AND lower(type) = 'opd'`,
    appointmentId,
  );
};

export const createAppointmentInDb = async (
  input: CreateAppointmentsTableInput,
) => {
  logger.info("entering::createAppointmentInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const appointmentId = await uinServiceFactory.generateUIN(
    OpdUinShortCode.AID,
  );

  return await db.$transaction(
    async (tx) => {
      const createdAppointment = await tx.appointment.create({
        data: {
          ...input,
          appointmentId: appointmentId,
          selectedDate: new Date(input.selectedDate),
          createdBy: currentUser,
        },
        include: {
          patient: true,
          doctor: true,
          client: true,
          patientInsurance: {
            include: {
              insurance: true,
            },
          },
          cc: true,
        },
      });

      if (input.insuranceId && input.patientInsuranceId) {
        await createOrUpdateInsurerInvoice(tx, {
          caseId: createdAppointment.appointmentId,
          coPayment: createdAppointment.coPaymentAmount ?? 0,
          grossTotal: createdAppointment.grossAmount,
          discountAmount: createdAppointment.discountTotalAmount,
          netTotal: createdAppointment.netAmount,
          insurerId: input.insuranceId,
        });
      }

      if (input.clientId) {
        await handleClientPlanInvoiceForOpd(tx, {
          clientId: input.clientId,
          clientPlan: input.status,
          coPayAmount: Number(input.coPaymentAmount),
          appointmentId: appointmentId,
          totalAmount: input.netAmount ?? 0,
        });
      }

      await createTimeSlotInDb(tx, {
        docId: input.doctorId,
        bookedTime: input.selectedTime,
        bookedDate: new Date(input.selectedDate),
        isBooked: true,
        appointmentId: createdAppointment.id,
      });

      return createdAppointment;
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const updateAppointmentInDb = async (
  input: CreateAppointmentsTableInput,
) => {
  logger.info("entering::updateAppointmentInDb::repository");

  if (!input.id) {
    throw new Error("Cannot update an Appointment without an id");
  }

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(
    async (tx) => {
      const updated = await tx.appointment.update({
        where: { id: input.id },
        data: {
          ...input,
          updatedBy: currentUser,
        },
        include: {
          patient: true,
          doctor: true,
          client: true,
          patientInsurance: {
            include: {
              insurance: true,
            },
          },
          cc: true,
        },
      });

      if (input.clientId) {
        await handleClientPlanInvoiceForOpd(tx, {
          clientId: input.clientId,
          clientPlan: input.status,
          coPayAmount: Number(input.coPaymentAmount ?? 0),
          appointmentId: updated.appointmentId,
          totalAmount: input.netAmount ?? 0,
        });
      }
      if (input.insuranceId && input.patientInsuranceId) {
        await createOrUpdateInsurerInvoice(tx, {
          caseId: updated.appointmentId,
          coPayment: updated.coPaymentAmount ?? 0,
          grossTotal: updated.grossAmount,
          discountAmount: updated.discountTotalAmount,
          netTotal: updated.netAmount,
          insurerId: input.insuranceId,
        });
      }

      await deleteTimeSlotFromDb(tx, {
        docId: input.doctorId,
        bookedTime: input.selectedTime,
        bookedDate: new Date(input.selectedDate),
      });

      await createTimeSlotInDb(tx, {
        docId: input.doctorId,
        bookedTime: input.selectedTime,
        bookedDate: new Date(input.selectedDate),
        isBooked: true,
        appointmentId: updated.id,
      });

      return updated;
    },
    { timeout: API_TIMEOUT },
  );
};

export const getAllAppointmentsFromDb = async (): Promise<
  AppointmentResponse[]
> => {
  logger.info("entering::getAllAppointmentsFromDb::repository");

  const allAppointments = await db.appointment.findMany({
    where: { isActive: true },
    include: {
      patient: true,
      doctor: true,
      client: true,
      patientInsurance: {
        include: {
          insurance: true,
        },
      },
      cc: true,
    },
  });

  logger.info("exiting::getAllAppointmentsFromDb::repository");
  return allAppointments;
};

export const getAppointmentsByIdFromDb = async (
  id: number,
): Promise<AppointmentResponse | null> => {
  logger.info(`entering::getAppointmentsByIdFromDb::repository id=${id}`);

  const appointments = await db.appointment.findFirst({
    where: { id, isActive: true },
    include: {
      patient: true,
      doctor: true,
      client: true,
      patientInsurance: {
        include: {
          insurance: true,
        },
      },
      cc: true,
    },
  });

  logger.info(`exiting::getAppointmentsByIdFromDb::repository id=${id}`);
  return appointments;
};

export const valAppointmentsByIdFromDb = async (
  id: number,
): Promise<Appointment | null> => {
  logger.info(`entering::getAppointmentsByIdFromDb::repository id=${id}`);

  const appointments = await db.appointment.findFirst({
    where: { id, isActive: true },
  });

  logger.info(`exiting::getAppointmentsByIdFromDb::repository id=${id}`);
  return appointments;
};

export const getAppointmentByAptIdFromDb = async (
  aptId: string,
): Promise<Appointment | null> => {
  logger.info(`entering::getAppointmentsByIdFromDb::repository id=${aptId}`);

  const appointments = await db.appointment.findFirst({
    where: { appointmentId: aptId, isActive: true },
  });

  logger.info(`exiting::getAppointmentsByIdFromDb::repository id=${aptId}`);
  return appointments;
};

export const getAppointmentStatusFromDb = async ({
  ccId,
  docId,
  selectedDate,
  weekId,
}: {
  ccId: number;
  docId: number;
  weekId: number;
  selectedDate: Date;
}): Promise<AppointmentStatus[]> => {
  logger.info(`entering::getAppointmentStatusFromDb::repository`);

  const appointments = await db.appointment.findMany({
    where: {
      ccId: ccId,
      doctorId: docId,
      weekId: weekId,
      selectedDate: new Date(selectedDate),
      isActive: true,
    },
  });

  logger.info(`exiting::getAppointmentStatusFromDb::repository`);
  return appointments;
};

export const cancelAppointmentFromDb = async (input: CancelAppointmentReq) => {
  logger.info(`entering::cancelAppointmentFromDb::repository id=${input.id}`);

  await db.$transaction(async (tx) => {
    const apt = input.appointment;
    if (!apt) {
      return;
    }

    const bookedDate = new Date(apt.selectedDate);

    await deleteTimeSlotFromDb(tx, {
      docId: apt.doctorId,
      bookedDate,
      bookedTime: apt.selectedTime,
    });

    await tx.appointment.update({
      where: { id: apt.id },
      data: {
        status: "CANCELLED",
        paymentStatus: input.newPaymentStatus,
        refundAmount: input.appointment?.paidAmount,
      },
    });

    await deleteClientPlanInvoice(tx, apt.appointmentId);
  });

  logger.info(`exiting::cancelAppointmentFromDb::repository id=${input.id}`);
};

export const getAppointmentCountByPatientIdFromDb = async (
  patientId: number,
): Promise<number> => {
  logger.info("entering::getAppointmentCountByPatientIdFromDb::repository");

  const total = await db.appointment.count({
    where: {
      isActive: true,
      patientId: patientId,
    },
  });

  logger.info("exiting::getAppointmentCountByPatientIdFromDb::repository");
  return total;
};

export const getAppointmentStatsByPatientIdFromDb = async (
  patientId: number,
): Promise<AppointmentStats> => {
  logger.info("entering::getAppointmentStatsByPatientIdFromDb::repository");

  const [visitCount, last] = await db.$transaction([
    db.appointment.count({
      where: { isActive: true, patientId: patientId },
    }),
    db.appointment.findFirst({
      where: { isActive: true, patientId: patientId },
      orderBy: { selectedDate: "desc" },
      select: { selectedDate: true },
    }),
  ]);

  logger.info("exiting::getAppointmentStatsByPatientIdFromDb::repository");
  return {
    visitCount,
    lastVisitedDate: last?.selectedDate ?? null,
  };
};

export const rescheduleAppointmentInDb = async (
  input: RescheduleAppointmentInput,
) => {
  logger.info("entering::rescheduleAppointmentInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedInput = customOmit<
    RescheduleAppointmentInput,
    "id" | "existingAppointment"
  >(input, ["id", "existingAppointment"]);
  const existingApt = omittedInput.omitted.existingAppointment;

  return await db.$transaction(
    async (tx) => {
      const updatedAppointment = await tx.appointment.update({
        where: { id: input.id },
        data: {
          ...omittedInput.rest,
          selectedDate: new Date(omittedInput.rest.selectedDate),
          updatedBy: currentUser,
        },
      });

      if (existingApt) {
        await deleteTimeSlotFromDb(tx, {
          docId: existingApt.doctorId,
          bookedTime: existingApt.selectedTime,
          bookedDate: new Date(existingApt.selectedDate),
        });

        if (existingApt.insuranceId && existingApt.patientInsuranceId) {
          await createOrUpdateInsurerInvoice(tx, {
            caseId: updatedAppointment.appointmentId,
            coPayment: updatedAppointment.coPaymentAmount ?? 0,
            grossTotal: updatedAppointment.grossAmount,
            discountAmount: updatedAppointment.discountTotalAmount,
            netTotal: updatedAppointment.netAmount,
            insurerId: existingApt.insuranceId,
          });
        }

        if (existingApt.clientId) {
          await handleClientPlanInvoiceForOpd(tx, {
            clientId: existingApt.clientId,
            clientPlan: existingApt.status,
            coPayAmount: Number(updatedAppointment.coPaymentAmount),
            appointmentId: existingApt.appointmentId,
            totalAmount: updatedAppointment.netAmount ?? 0,
          });
        }
      }

      await createTimeSlotInDb(tx, {
        docId: input.doctorId,
        bookedTime: input.selectedTime,
        bookedDate: new Date(input.selectedDate),
        isBooked: true,
        appointmentId: updatedAppointment.id,
      });
    },
    { timeout: API_TIMEOUT },
  );
};

export const getAppointmentCharges = async (
  input: GetAppointmentChargesInput,
): Promise<AppointmentChargesResponse> => {
  logger.info("entering::getAppointmentCharges::repository");

  let coPaymentMethod: PercentageOrAmount | null = null;
  let coPaymentValue: number | null = null;

  const settings = requestStorage.getStore()?.settings;

  const roundFormat = settings?.grnRoundedFormat || "TO_FIXED";
  const precision = settings?.defaultPrecision || 2;
  const calculationMethod = settings?.grnCalculationMethod || "STEP_WISE";

  let charges: { regConsultationFee: number; vipSpecialFee: number } = {
    regConsultationFee: 0,
    vipSpecialFee: 0,
  };

  const insuranceSetting = input.insuranceId
    ? await getInsurancePaymentSettingsByFilterFromDb(
        input.insuranceId,
        input.ccId,
        "Doctor",
        input.doctorId,
      )
    : null;

  const clientSettings = input.clientId
    ? await getClientPaymentSettingsByFilterFromDb(
        input.clientId,
        input.ccId,
        "Doctor",
        input.doctorId,
      )
    : null;

  if (insuranceSetting) {
    charges = getChargeByPatientTypeAndBookingType(
      input.patientType,
      input.bookingType,
      input.isFoc,
      insuranceSetting,
    );
    coPaymentMethod =
      insuranceSetting.paymentMode === "co_pay" ? "PERCENTAGE" : "AMOUNT";
    coPaymentValue = insuranceSetting.paymentValue;
  } else if (clientSettings) {
    charges = getChargeByPatientTypeAndBookingType(
      input.patientType,
      input.bookingType,
      input.isFoc,
      clientSettings,
    );
    coPaymentMethod =
      clientSettings.paymentMode === "in_percentage" ? "PERCENTAGE" : "AMOUNT";
    coPaymentValue = clientSettings.paymentValue;
  } else {
    const docSchedule = await db.doctorSchedule.findFirst({
      where: {
        docId: input.doctorId,
        ccId: input.ccId,
        weekId: input.weekId,
        isActive: true,
      },
    });

    if (docSchedule)
      charges = getChargeByPatientTypeAndBookingType(
        input.patientType,
        input.bookingType,
        input.isFoc,
        docSchedule,
      );
  }

  const calculatedRes = calculateSingleChild(
    {
      qty: 1,
      rate: charges.regConsultationFee,
      coPaymentType: coPaymentMethod === "PERCENTAGE" ? "PERCENTAGE" : "AMOUNT",
      coPayValue: coPaymentValue ?? 0,
      discountMode: input.discountMethod,
      discountValue: input.discountValue,
      otherCharge: charges.vipSpecialFee,
      taxMethod: input.taxMethod,
      taxValue: input.taxPercent,
    },
    "PERCENTAGE-AMOUNT",
    {
      calculationMethod:
        calculationMethod === "STEP_WISE" ? "STEP_WISE" : "FINAL_ONLY",
      lineRound: roundFormat,
      precision,
      headerRound: roundFormat,
    },
  );

  logger.info("exiting::getAppointmentCharges::repository");

  return {
    ...calculatedRes,
    coPaymentMethod,
    coPaymentValue,
  };
};

const getChargeByPatientTypeAndBookingType = (
  patientType: ReferredBy,
  bookingType: BookingType,
  isFoc: boolean,
  settingData:
    | DoctorSchedule
    | OpdInsurerPaymentSetting
    | OpdClientMasterSetting,
) => {
  let regConsultationFee =
    patientType === "NEW_PATIENT"
      ? Number(settingData.firstVisitPrice || 0)
      : Number(settingData.followUpPrice || 0);
  let vipSpecialFee = 0;

  if (patientType === "NEW_PATIENT") {
    if (bookingType === "VIP") {
      vipSpecialFee = settingData.vipFirstVisitPrice
        ? Number(settingData.vipFirstVisitPrice)
        : 0;
    } else if (bookingType === "SPECIAL") {
      vipSpecialFee = settingData.specialFirstVisitPrice
        ? Number(settingData.specialFirstVisitPrice)
        : 0;
    }
  } else {
    if (bookingType === "VIP") {
      vipSpecialFee = settingData.vipFollowUpPrice
        ? Number(settingData.vipFollowUpPrice)
        : 0;
    } else if (bookingType === "SPECIAL") {
      vipSpecialFee = settingData.specialFollowUpPrice
        ? Number(settingData.specialFollowUpPrice)
        : 0;
    }
  }

  if (isFoc) {
    regConsultationFee = 0;
  }

  return { regConsultationFee, vipSpecialFee };
};

export const upgradeAppointmentInDb = async (
  input: UpgradeAppointmentReq,
  charges: AppointmentChargesResponse,
) => {
  logger.info("entering::upgradeAppointmentInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.$transaction(
    async (tx) => {
      const upgradedAppointment = await tx.appointment.update({
        where: {
          id: input.appointmentId,
        },
        data: {
          isVipBooking: input.isVipBooking,
          isSpecialBooking: input.isSpecialBooking,
          subtotalAmount: charges.subtotalAmount,
          otherChargeAmount: charges.otherChargeAmount,
          taxMethod:
            charges.taxMethod === "INCLUSIVE" ? "INCLUSIVE" : "EXCLUSIVE",
          taxValue: charges.taxValue,
          taxAmount: charges.taxAmount,
          additionalDiscountMode: charges.discountMode,
          additionalDiscountValue: charges.discountValue,
          discountTotalAmount: charges.discountAmount,
          netAmount: charges.netAmount,
          grossAmount: charges.grossAmount,
          coPaymentType: charges.coPaymentMethod,
          coPaymentValue: charges.coPaymentValue,
          coPaymentAmount: charges.copayAmount,
          updatedBy: currentUser,
        },
      });

      if (
        upgradedAppointment.insuranceId &&
        upgradedAppointment.patientInsuranceId
      ) {
        await createOrUpdateInsurerInvoice(tx, {
          caseId: upgradedAppointment.appointmentId,
          coPayment: upgradedAppointment.coPaymentAmount ?? 0,
          grossTotal: upgradedAppointment.grossAmount,
          discountAmount: upgradedAppointment.discountTotalAmount,
          netTotal: upgradedAppointment.netAmount,
          insurerId: upgradedAppointment.insuranceId,
        });
      }

      if (upgradedAppointment.clientId) {
        await handleClientPlanInvoiceForOpd(tx, {
          clientId: upgradedAppointment.clientId,
          clientPlan: upgradedAppointment.status,
          coPayAmount: Number(upgradedAppointment.coPaymentAmount),
          appointmentId: upgradedAppointment.appointmentId,
          totalAmount: upgradedAppointment.netAmount,
        });
      }
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const getAppointmentFees = async (
  input: GetAppointmentFeesInput,
): Promise<AppointmentFeesResponse> => {
  logger.info("entering::getAppointmentFees::repository");

  let vipCharges: { regConsultationFee: number; vipSpecialFee: number } = {
    regConsultationFee: 0,
    vipSpecialFee: 0,
  };

  let specialCharges: { regConsultationFee: number; vipSpecialFee: number } = {
    regConsultationFee: 0,
    vipSpecialFee: 0,
  };

  const insuranceSetting = input.insuranceId
    ? await getInsurancePaymentSettingsByFilterFromDb(
        input.insuranceId,
        input.ccId,
        "Doctor",
        input.doctorId,
      )
    : null;

  const clientSettings = input.clientId
    ? await getClientPaymentSettingsByFilterFromDb(
        input.clientId,
        input.ccId,
        "Doctor",
        input.doctorId,
      )
    : null;

  // For VIP
  if (insuranceSetting) {
    vipCharges = getChargeByPatientTypeAndBookingType(
      input.patientType,
      "VIP",
      input.isFoc,
      insuranceSetting,
    );
    specialCharges = getChargeByPatientTypeAndBookingType(
      input.patientType,
      "SPECIAL",
      input.isFoc,
      insuranceSetting,
    );
  } else if (clientSettings) {
    vipCharges = getChargeByPatientTypeAndBookingType(
      input.patientType,
      "VIP",
      input.isFoc,
      clientSettings,
    );
    specialCharges = getChargeByPatientTypeAndBookingType(
      input.patientType,
      "SPECIAL",
      input.isFoc,
      clientSettings,
    );
  } else {
    const docSchedule = await db.doctorSchedule.findFirst({
      where: {
        docId: input.doctorId,
        ccId: input.ccId,
        weekId: input.weekId,
        isActive: true,
      },
    });

    if (docSchedule) {
      vipCharges = getChargeByPatientTypeAndBookingType(
        input.patientType,
        "VIP",
        input.isFoc,
        docSchedule,
      );
      specialCharges = getChargeByPatientTypeAndBookingType(
        input.patientType,
        "SPECIAL",
        input.isFoc,
        docSchedule,
      );
    }
  }

  logger.info("exiting::getAppointmentFees::repository");

  return {
    vipCharges,
    specialCharges,
  };
};
