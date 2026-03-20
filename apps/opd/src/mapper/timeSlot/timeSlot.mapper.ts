import { parseTimeToDate } from "@repo/shared/utils/date.utils.js";
import { getAppointmentCharges } from "@/repository/appointment/appointment.repository.js";
import { getDoctorScheduleByDocCCIdFromDb } from "@/repository/doctor/doctor.repository.js";
import { getTimeSlot } from "@/repository/timeSlot/timeSlot.repository.js";
import {
  DoctorChargeRes,
  DoctorConsultationWithTimeSlotInput,
  DoctorConsultationWithTimeSlotResponse,
  PaymentResStatus,
  TimeSlotMapperResponse,
} from "@/types/timeSlot/timeSlot.js";
import { BookedStatus } from "@repo/db/generated/prisma/client";
import dayjs from "dayjs";

export const getConsultationFeeAndSlots = async (
  input: DoctorConsultationWithTimeSlotInput,
): Promise<DoctorConsultationWithTimeSlotResponse> => {
  const charges = await getAppointmentCharges({
    bookingType: input.isVIPBooking
      ? "VIP"
      : input.isSpecialBooking
        ? "SPECIAL"
        : "REGULAR",
    ccId: input.ccId,
    doctorId: input.docId,
    discountMethod: "PERCENTAGE",
    discountValue: 0,
    isFoc: input.isFOCConsultation ?? false,
    patientType: input.patientType,
    taxMethod: input.taxMethod,
    taxPercent: input.taxValue ?? 0,
    weekId: input.weekId,
    client: input.client,
    clientId: input.clientId,
    insuranceId: input.insuranceId,
  });

  const chargesData: DoctorChargeRes = {
    baseFee: charges.subtotalAmount - charges.otherChargeAmount,
    vipSpecialFee: charges.otherChargeAmount,
    coPaymentMethod: charges.coPaymentMethod,
    coPaymentValue: charges.coPaymentValue,
  };

  const schedules = await getDoctorScheduleByDocCCIdFromDb(
    input.docId,
    input.ccId,
    input.weekId,
  );
  if (!schedules?.length) return { charges: chargesData, timeSlots: [] };

  const bookedSlots = await getTimeSlot(input.docId, input.date);
  const bookedTimes =
    bookedSlots?.map((b) => ({
      time: b.bookedTime.substring(0, 5),
      isBookedWithMoney: b.isBookedWithMoney,
    })) ?? [];

  const allSlots: TimeSlotMapperResponse[] = [];

  for (const schedule of schedules) {
    const start = dayjs(parseTimeToDate(schedule.startTime, input.date));
    const end = dayjs(parseTimeToDate(schedule.endTime, input.date));
    const slotMinutes = schedule.timeTaken;

    if (!end.isAfter(start) || slotMinutes <= 0) continue;

    let current = start;
    while (current.isBefore(end)) {
      const slotTime = current.format("HH:mm");

      let status: BookedStatus = BookedStatus.AVAILABLE;
      let paymentStatus: PaymentResStatus | null = null;

      const bookedSlot = bookedTimes.find((b) => b.time === slotTime);

      if (bookedSlot) {
        status = BookedStatus.BOOKED;

        if (bookedSlot.isBookedWithMoney)
          paymentStatus = PaymentResStatus.BOOKED_WITH_MONEY;
        else paymentStatus = PaymentResStatus.BOOKED_WITHOUT_MONEY;
      }

      allSlots.push({
        slotTime,
        status,
        paymentStatus,
      });

      current = current.add(slotMinutes, "minute");
    }
  }

  const sortedSlots = allSlots.sort((a, b) =>
    a.slotTime.localeCompare(b.slotTime),
  );

  return {
    charges: chargesData,
    timeSlots: sortedSlots,
  };
};
