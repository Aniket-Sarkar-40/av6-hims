import { pharmacyRequests } from "@/client/pharmacy/request.js";
import { getSellDetailsFromDb } from "@/repository/master/sell.repository.js";
import {
  PatientMedicineDetailDto,
  PatientMedicineDto,
  PatientMedicineResponse,
} from "@/types/appointment/patientMedicine.js";
import { customOmit, toIdValue } from "av6-utils";
import { toAppointmentDetailsDto } from "./appointment.mapper.js";

export const toPatientMedicineDto = async (
  master: PatientMedicineResponse,
): Promise<PatientMedicineDto> => {
  const masterData = customOmit<
    PatientMedicineResponse,
    | "appointmentId"
    | "patientId"
    | "details"
    | "appointment"
    | "isActive"
    | "createdBy"
    | "updatedBy"
    | "deletedBy"
    | "createdAt"
    | "updatedAt"
    | "deletedAt"
    | "doctorId"
  >(master, [
    "appointmentId",
    "patientId",
    "isActive",
    "createdBy",
    "updatedBy",
    "deletedBy",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "doctorId",
  ]);

  const appointment = master.appointment
    ? toAppointmentDetailsDto(master.appointment)
    : null;

  const details: PatientMedicineDetailDto[] = [];

  for (const detailData of master.details) {
    const detailInfo = customOmit(detailData, [
      "isActive",
      "deletedBy",
      "deletedAt",
      "createdBy",
      "updatedBy",
      "sellId",
      "sellRefNo",
      "medId",
    ]);

    const med = await pharmacyRequests.getItemById({
      id: detailData.medId,
      branchId: master.appointment.ccId,
      insuranceId: master.appointment.insuranceId ?? undefined,
      corporateClientId: master.appointment.clientId ?? undefined,
      isZeroQty: false,
      isCustomPricing: true,
      isItemBranchMap: true,
    });

    const sell =
      detailData.sellId && detailData.sellRefNo && master.appointment?.ccId
        ? await getSellDetailsFromDb({
            sellId: detailData.sellId,
            sellRefNo: detailData.sellRefNo,
            ccId: master.appointment.ccId,
          })
        : null;

    details.push({
      ...detailInfo.rest,
      med,
      sell,
    });
  }

  return {
    ...masterData.rest,
    doctor: toIdValue(master.doctor, "name"),
    appointment,
    details,
  };
};
