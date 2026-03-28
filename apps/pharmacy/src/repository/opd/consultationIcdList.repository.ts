import { db } from "@repo/db";
import { ConsultationIcdTenListRow } from "@/types/opd/consultationIcdList.js";

export const fetchConsultationIcdTenListByAppointment = async (
  appointmentId: number,
): Promise<ConsultationIcdTenListRow[]> => {
  const data = await db.$queryRawUnsafe<ConsultationIcdTenListRow[]>(`
    SELECT
      cil.id                    AS id,
      cil.appointment_id        AS appointmentId,
      cil.consultation_id       AS consultationId,
      cil.icd10_id              AS icd10Id,
      cil.is_active             AS isActive,
      cil.attendance            AS attendance,
      cil.type                  AS type,
      cil.status_of_diagnosis   AS statusOfDiagnosis,
      cil.category              AS category,
      cil.adverse_effect        AS adverseEffect,
      cil.dgrg_code             AS dgrgCode,
      atbl.selected_date_str    AS appointmentDate,
      atbl.appointment_id       AS appointmentNo,
      itm.icd_specific_code     AS icdSpecificCode,
      itm.icd_description       AS icdDescription
    FROM consultation_icd_ten_list AS cil
    JOIN appointments_table     AS atbl 
      ON cil.appointment_id = atbl.id
    JOIN icd_ten_master         AS itm 
      ON cil.icd10_id       = itm.id
    WHERE cil.appointment_id = ${appointmentId};
  `);

  return data;
};
