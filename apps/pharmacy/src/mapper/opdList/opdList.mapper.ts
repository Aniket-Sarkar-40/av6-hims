import { getItemStocksByItemId } from "@/repository/item/item.repository.js";
import { itemService } from "@/services/item/item.service.js";
import { collectionCenterService } from "@/services/master/collectionCenter.service.js";
import { ItemAppointmentDTO } from "@/types/item/item.js";
import {
  AppointmentDosageDto,
  Medicine,
  MedicineAppointment,
  MedicineDto,
  OpdBill,
  OpdBillDTO,
  OpdBillReq,
} from "@/types/opd/opdList.js";
import { customOmit } from "av6-core-v2";
import { logger } from "@repo/platform/logging/logger.js";

export const toOpdBillDto = async (
  opdBill: OpdBill,
  input: OpdBillReq
): Promise<OpdBillDTO> => {
  const medicines: MedicineDto[] = await Promise.all(
    opdBill.medicines.map(async (medicine) => {
      const totalQty =
        medicine.morningDose + medicine.afternoonDose + medicine.nightDose;
      const duration = isNaN(Number(medicine.duration))
        ? 0
        : Number(medicine.duration);

      const item = await itemService.getItemById(
        {
          id: medicine.medId,
          isCustomPricing: true,
          branchId: input.branchId,
          isZeroQty: false,
          insuranceId: opdBill.insurerId || undefined,
          corporateClientId: opdBill.clientId || undefined,
        },
        true
      );
      // const packSize = isNaN(Number(item?.packSize?.name)) ? 15 : Number(item?.packSize?.name);
      let expectedQty = 1;

      switch (item?.medPackingType) {
        case "Strip":
          expectedQty = totalQty > 0 ? totalQty * duration : 0;
          break;
        case "Sachet":
          expectedQty = totalQty > 0 ? totalQty * duration : 0;
          break;
        case "Packet":
          expectedQty = totalQty > 0 ? totalQty * duration : 0;
          break;
        default:
          break;
      }

      const omittedMedicine = customOmit<Medicine, "medId">(medicine, [
        "medId",
      ]);

      const itemStocks = await getItemStocksByItemId({
        isZeroQty: false,
        branchId: input.branchId,
        id: medicine.medId,
      });
      return {
        id: medicine.medId,
        expectedQty: Math.ceil(expectedQty),
        ...omittedMedicine.rest,
        item,
        stocks: itemStocks,
      };
    })
  );

  return {
    ...opdBill,
    medicines,
  };
};

export const toOpdAppointDto = async (
  result: OpdBill,
  items: ItemAppointmentDTO[]
): Promise<AppointmentDosageDto> => {
  const medicineAppointments: MedicineAppointment[] = result.medicines.map(
    (med): MedicineAppointment => {
      const medItem = items.find((item) => item.id === med.medId);
      if (!medItem) {
        logger.warn(`Item not found for medId: ${med.medId}`);
      }

      return {
        med: medItem ?? null,
        morningDose: med.morningDose,
        afternoonDose: med.afternoonDose,
        nightDose: med.nightDose,
        sos: med.sos,
        duration: med.duration,
        notes: med.notes,
      };
    }
  );

  const collectionCenter =
    await collectionCenterService.getCollectionCenterById(result.ccId, true);
  return {
    ...result,
    collectionCenter: collectionCenter,
    medicine: medicineAppointments,
  };
};
