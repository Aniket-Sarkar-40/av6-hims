import { uinServiceFactory } from "@/config/core.config.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreatePatientMedicineInput,
  SearchMedicineInput,
  UpdatePatientMedicineDetailInput,
  UpdatePatientMedicineInput,
} from "@/types/appointment/patientMedicine.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  PatientMedicine,
  PatientMedicineDetail,
  OpdUinShortCode,
} from "@repo/db/generated/prisma/client";

export const fetchPharmacyItemsForAppointment = async (
  input: SearchMedicineInput,
): Promise<PatientMedicine[]> => {
  const [apt] = await db.$queryRaw<
    { appointment_type: string; insurance_id: number | null }[]
  >`
    SELECT appointment_type, COALESCE(insurance_id, 0) AS insurance_id
    FROM nopd_appointments
    WHERE id = ${input.aptId}
    LIMIT 1
  `;

  const aptType = apt?.appointment_type ?? "WALK_IN";
  const insuranceId = Number(apt?.insurance_id ?? 0);
  const ccId = Number(input.ccId ?? 0);

  const rawSearch = input.searchText?.trim() ?? "";
  const escaped = rawSearch.replace(/[%_]/g, "\\$&");
  const searchCond = rawSearch
    ? `AND (i.item_number LIKE '%${escaped}%' ESCAPE '\\\\' OR i.medicine_name LIKE '%${escaped}%' ESCAPE '\\\\')`
    : "";

  const query = `
    SELECT 
      i.id,
      i.item_number AS itemNumber,
      i.medicine_name AS medicineName,
      i.is_active AS isActive,
      i.medicine_pack_type AS medicinePackType,
      mu.name AS unit,
      mp.name AS packSize,
      i.is_allow_loose_sale AS isAllowLooseSale,
      CASE 
        WHEN LOWER('${aptType}') = 'insurance' THEN
          CASE
            WHEN pip.id IS NOT NULL THEN ROUND(pip.mrp + (pip.mrp * COALESCE(pip.insurance_percentage, 0) / 100), 2)
            ELSE ROUND(pbi.sale_amount + (pbi.sale_amount * COALESCE(pbi.insurance_percentage, 0) / 100), 2)
          END
        WHEN LOWER('${aptType}') IN ('walk-in','walk_in') THEN
          ROUND(pbi.sale_amount + (pbi.sale_amount * COALESCE(pbi.walk_in_percentage, 0) / 100), 2)
        WHEN LOWER('${aptType}') = 'corporate' THEN
          ROUND(pbi.sale_amount + (pbi.sale_amount * COALESCE(pbi.insurance_percentage, 0) / 100), 2)
        ELSE pbi.sale_amount
      END AS saleAmount,
     CASE 
  WHEN LOWER('${aptType}') = 'insurance' THEN CAST(pip.co_pay AS DOUBLE)
  ELSE NULL
END AS insuranceAmount,
CASE 
  WHEN LOWER('${aptType}') = 'insurance' THEN CAST(pip.patient_pay AS DOUBLE)
  ELSE NULL
END AS patientAmount,
      mt.name AS medicineType,
      mc.name AS medicineCategory,
      (
        SELECT COALESCE(SUM(s.quantity), 0)
        FROM pms_item_stock s
        WHERE s.item_id = i.id
          AND s.branch_id = ${ccId}
      ) AS stock
    FROM pms_item i
    LEFT JOIN pms_branch_item pbi 
      ON pbi.item_id = i.id 
     AND pbi.branch_id = ${ccId}
     AND pbi.isActive = 1
    LEFT JOIN pharmacy_insurer_payment_settings pip 
      ON pip.med_id = i.id
     AND pip.cc_id = ${ccId}
     AND pip.insurance_id = ${insuranceId}
     AND pip.status = 1
    LEFT JOIN pms_med_category mc ON mc.id = i.medicine_category_id
    LEFT JOIN pms_medicine_type mt ON mt.id = i.medicine_type_id
    LEFT JOIN pms_med_unit mu ON mu.id = i.medicine_unit_id
    LEFT JOIN pms_med_package mp ON mp.id = i.pack_size_id
    WHERE i.is_active = 1
      ${searchCond}
      AND (
        SELECT COALESCE(SUM(s.quantity), 0)
        FROM pms_item_stock s
        WHERE s.item_id = i.id
          AND s.branch_id = ${ccId}
      ) > 0
      AND pbi.id IS NOT NULL
    ORDER BY stock DESC;
  `;

  const rows = await db.$queryRawUnsafe<PatientMedicine[]>(query);
  console.log("Fetched Medicines Count:", rows.length);
  return rows;
};

export const createPatientMedicineInDb = async (
  input: CreatePatientMedicineInput,
) => {
  logger.info("entering::createPatientMedicineInDb::repository");

  const userId = requestStorage.getStore()?.user?.id ?? null;
  const medicineGroupNumber = await uinServiceFactory.generateUIN(
    OpdUinShortCode.MED,
  );
  const createdRecord = await db.$transaction(async (tx) => {
    const master = await tx.patientMedicine.create({
      data: {
        ...input,

        medicineGroupNumber,
        createdBy: userId,
        details: {
          create: input.details.map((d) => ({
            ...d,
            createdBy: userId,
          })),
        },
      },
    });
    return master;
  });

  logger.info("exiting::createPatientMedicineInDb::repository");
  return createdRecord;
};

export const updatePatientMedicineInDb = async (
  input: UpdatePatientMedicineInput,
): Promise<void> => {
  logger.info("entering::updatePatientMedicineInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id ?? null;

  const { toCreate, toUpdate, toDelete, id, ...masterData } = input;

  await db.$transaction(async (tx) => {
    return tx.patientMedicine.update({
      where: { id },
      data: {
        ...masterData,
        updatedBy: currentUser,

        details: {
          create: toCreate?.map((d) => {
            const omittedD = customOmit<UpdatePatientMedicineDetailInput, "id">(
              d,
              ["id"],
            );
            return {
              ...omittedD.rest,
              createdBy: currentUser,
            };
          }),

          update: toUpdate?.map(({ id: detailId, ...rest }) => ({
            where: { id: detailId },
            data: {
              ...rest,
              updatedBy: currentUser,
            },
          })),

          updateMany: {
            where: { id: { in: toDelete } },
            data: {
              isActive: false,
              deletedAt: new Date(),
              deletedBy: currentUser,
            },
          },
        },
      },
    });
  });

  logger.info("exiting::updatePatientMedicineInDb::repository");
};

export const getPatientMedicineByIdFromDb = async (id: number) => {
  logger.info(`entering::getPatientMedicineByIdFromDb::repository`);

  const result = await db.patientMedicine.findFirst({
    where: { id, isActive: true },
  });

  logger.info(`exiting::getPatientMedicineByIdFromDb::repository`);
  return result;
};
export const getPatientMedicineDetailsByIdFromDb = async (id: number) => {
  logger.info(`entering::getPatientMedicineDetailsByIdFromDb::repository`);

  const result = await db.patientMedicineDetail.findFirst({
    where: { id, isActive: true },
    include: {
      patientMedicine: true,
    },
  });

  logger.info(`exiting::getPatientMedicineDetailsByIdFromDb::repository`);
  return result;
};

export const getPatientMedicineByAptIdFromDb = async (
  appointmentId: number,
): Promise<PatientMedicine | null> => {
  logger.info(`entering::getPatientMedicineByAptIdFromDb::repository`);

  const result = await db.patientMedicine.findFirst({
    where: { appointmentId, isActive: true },
  });

  logger.info(`exiting::getPatientMedicineByAptIdFromDb::repository`);
  return result;
};

export const getAllPatientMedicineDetailsByAptIdAndMedIdFromDb = async (
  appointmentId: number,
  medId: number,
): Promise<PatientMedicineDetail[]> => {
  logger.info(
    "entering::getAllPatientMedicineDetailsByAptIdAndMedIdFromDb::repository",
  );

  const result = await db.patientMedicineDetail.findMany({
    where: {
      medId,
      isActive: true,
      patientMedicine: {
        appointmentId,
        isActive: true,
      },
    },
  });

  logger.info(
    "exiting::getAllPatientMedicineDetailsByAptIdAndMedIdFromDb::repository",
  );
  return result;
};

export const getPatientMedicineSellInfoByAptIdFromDb = async (
  appointmentId: number,
) => {
  logger.info("entering::getPatientMedicineSellInfoByAptIdFromDb::repository");

  const details = await db.patientMedicineDetail.findMany({
    where: {
      isActive: true,
      sellId: null,

      patientMedicine: {
        appointmentId,
        isActive: true,
      },
    },
  });

  logger.info("exiting::getPatientMedicineSellInfoByAptIdFromDb::repository");
  return details;
};

export const deletePatientMedicineFromDb = async (
  id: number,
): Promise<void> => {
  logger.info(`entering::deletePatientMedicineFromDb::repository`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id ?? null;

  await db.$transaction(async (tx) => {
    await tx.patientMedicine.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: currentUser,
      },
    });

    await tx.patientMedicineDetail.updateMany({
      where: { masterId: id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: currentUser,
      },
    });
  });

  logger.info(`exiting::deletePatientMedicineFromDb::repository`);
};

export const getPatientMedicineDetailsByMasterIdFromDb = async (
  masterId: number,
) => {
  logger.info(
    "entering::getPatientMedicineDetailsByMasterIdFromDb::repository",
  );

  const details = await db.patientMedicineDetail.findMany({
    where: {
      masterId,
      isActive: true,
    },
  });

  logger.info(`exiting::getPatientMedicineDetailsByMasterIdFromDb::repository`);
  return details;
};
