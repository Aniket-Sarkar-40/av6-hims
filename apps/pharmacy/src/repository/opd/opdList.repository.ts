import { db } from "@repo/db";
import { PaginatedResponse } from "av6-core";
import {
  AppointmentMedicineSummary,
  AppointmentResponse,
  LastAppointmentRes,
  MedicineInstruction,
  NonCompletedMedicine,
  OpdBill,
  RawMedicineInstruction,
  RawOpdBill,
  SearchRequestOpd,
  SearchWithDate,
} from "@/types/opd/opdList.js";
import { ISO_DATE_FORMAT } from "@repo/shared/utils/constants.utils.js";
import { fromTimestampToSqlDatetime } from "@repo/shared/utils/date.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Prisma } from "@repo/db/generated/prisma/client";
import dayjs from "dayjs";

export const fetchPendingPaginatedAppointments = async (
  input: SearchRequestOpd,
): Promise<PaginatedResponse<AppointmentMedicineSummary>> => {
  const offset = (input.pageNo - 1) * input.pageSize;
  const pattern = input.searchText
    ? `%${input.searchText.replace(/[%_]/g, "\\$&")}%`
    : "%";

  let filter = "";
  if (input.ccId) {
    filter += `AND at2.collection_center = ${input.ccId}`;
  }
  if (input.startDate && input.endDate) {
    filter += ` AND at2.created_at BETWEEN '${fromTimestampToSqlDatetime(input.startDate)}' AND '${fromTimestampToSqlDatetime(input.endDate)}'`;
  }

  const [{ total }] = await db.$queryRawUnsafe<{ total: bigint }[]>(`
   SELECT COUNT(*) AS total
    FROM (
      SELECT at2.id
      FROM appointments_table AS at2
      INNER JOIN patient_medicine AS pm
        ON pm.appointment_id = at2.id
      LEFT JOIN patients AS pt
        ON pt.patient_unique_id = at2.patient_unique_id
      WHERE (at2.med_status <> 'Success' OR at2.med_status IS NULL)
        AND pm.is_active = 'yes'
        AND (
          pt.patient_name LIKE '${pattern}'
          OR at2.appointment_id LIKE '${pattern}'
        )
        ${filter}
      GROUP BY at2.id
      HAVING COUNT(CASE WHEN pm.sell_id IS NULL THEN 1 END) > 0
      -- or: HAVING SUM(pm.sell_id IS NULL) > 0   -- MySQL boolean-sum trick
    ) AS pending_with_unsold;
  `);

  const data = await db.$queryRawUnsafe<AppointmentMedicineSummary[]>(`
    SELECT 
      pt.patient_name AS "patientName",
      pt.age,
      pt.dob ,
      pt.gender ,
      at2.appointment_id AS "appointmentNo",
      at2.id AS "id",
      st.name AS "bookedBy",
      at2.appointment_type AS "appointmentType",
      at2.selected_date_str AS "appointmentDate",
      at2.visit_id AS "visitNo",
      at2.status AS "appointmentStatus",
      at2.bill_id AS "billNo",
      im.customer_name AS "insurerName",
      cm.customer_name AS "clientName"
    FROM appointments_table AS at2
    INNER JOIN patient_medicine AS pm
      ON pm.appointment_id = at2.id
    LEFT JOIN patients AS pt
      ON pt.patient_unique_id = at2.patient_unique_id
    LEFT JOIN staff AS st
      ON st.id = at2.doctor_id
    LEFT JOIN insurer_master im 
      ON im.id = at2.insurer_id
    LEFT JOIN client_master as cm on cm.id = at2.client_id
    WHERE (at2.med_status <> 'Success' OR at2.med_status IS NULL)
      AND (
        pt.patient_name LIKE '${pattern}'
        OR at2.appointment_id LIKE '${pattern}'
      )
     
      AND pm.is_active = "yes"
      ${filter}
    GROUP BY at2.id
    HAVING COUNT(CASE WHEN pm.sell_id IS NULL THEN 1 END) > 0
    ORDER BY at2.id ${input.sortDir}
    LIMIT ${input.pageSize}
    OFFSET ${offset};
  `);

  return {
    data,
    totalRecords: Number(total),
    pageSize: input.pageSize,
    currentPageNumber: input.pageNo,
    lastPageNumber: Math.ceil(Number(total) / input.pageSize),
  };
};

export const getOpdBill = async (id: number): Promise<OpdBill | null> => {
  const result = await db.$queryRawUnsafe<RawOpdBill[]>(`
    SELECT
      pt.patient_name AS "patientName",
      pt.age,
      pt.dob ,
      pt.gender ,
      pt.id AS "patientId",
      at2.appointment_id AS "appointmentNo",
      at2.collection_center AS "ccId",
      at2.id AS "id",
      st.name AS "bookedBy",
      st.id AS "doctorId",
      pm.patient_unique_id AS "patientUniqueId",
      pi.id AS "patientInsuranceId",
      pi.insurance_type AS "patientInsuranceType",
      pi.insurer_id AS "insurerId",
      im.customer_name as "insurerName",
      at2.client_id AS "clientId",
      cm.customer_name as "clientName",
      
      GROUP_CONCAT(
        CONCAT(
          '{"medId":', pm.med_id, 
          ',"morningDose":', pm.morn, 
          ',"afternoonDose":', pm.aft, 
          ',"nightDose":', pm.night, 
          ',"sos":"', pm.sos, 
          '","duration":"', pm.duration, 
          '","notes":"', pm.notes, '"}'
        ) 
        SEPARATOR ',' 
      ) AS medicines
    FROM patient_medicine AS pm
    LEFT JOIN patients AS pt ON pt.patient_unique_id = pm.patient_unique_id
    LEFT JOIN appointments_table AS at2 ON at2.id = pm.appointment_id
    LEFT JOIN staff AS st ON st.id = at2.doctor_id
    LEFT JOIN patients_insurance AS pi ON pi.patient_id = at2.patient_unique_id AND pi.insurer_id = at2.insurer_id AND lower(pi.insurance_type) = lower(at2.insurance_type)
    LEFT JOIN insurer_master as im on im.id = pi.insurer_id
    LEFT JOIN client_master as cm on cm.id = at2.client_id
    WHERE at2.id = ${id} and pm.sell_id is null
    GROUP BY at2.appointment_id, pt.id, st.id, st.name;
  `);

  if (result.length > 0) {
    const row = result[0];

    const medicines = row.medicines ? JSON.parse(`[${row.medicines}]`) : [];

    return {
      ...row,
      ccId: Number(row.ccId),
      patientInsuranceId: row.patientInsuranceId
        ? Number(row.patientInsuranceId)
        : null,
      patientInsuranceType: row.patientInsuranceType
        ? row.patientInsuranceType.toLowerCase()
        : null,
      insurerId: row.insurerId ? Number(row.insurerId) : null,
      insurerName: row.insurerName || null,
      clientId: row.clientId ? Number(row.clientId) : null,
      clientName: row.clientName || null,
      medicines: medicines,
    };
  }

  return null;
};

export const getMedicineInstructionFromDb = async (
  id: number,
): Promise<MedicineInstruction[]> => {
  const result = await db.$queryRawUnsafe<RawMedicineInstruction[]>(`
    select
    pi2.medicine_name as 'medicineName',
    pi2.item_number as 'itemNumber',
    pm.id,
    pm.appointment_id as 'appointmentId',
    pm.morn,
    pm.aft,
    pm.night,
    pm.sos,
    pm.duration,
    pm.notes
  from
    patient_medicine pm
  join pms_item pi2 on pi2.id = pm.med_id
  where
    pm.appointment_id = ${id}
    and pm.is_active = 'yes'
  `);

  return result.map(
    (item): MedicineInstruction => ({
      id: Number(item.id),
      appointmentId: Number(item.appointmentId),
      medicineName: item.medicineName,
      itemNumber: item.itemNumber,
      morn: Number(item.morn) || 0,
      aft: Number(item.aft) || 0,
      night: Number(item.night) || 0,
      sos: item.sos === "SOS" ? "SOS" : "No SOS",
      duration: item.duration ? Number(item.duration) : 0,
      notes: item.notes || "",
    }),
  );
};

export const fetchPendingPaginatedAppointmentsExcel = async (
  input: SearchWithDate,
): Promise<AppointmentMedicineSummary[]> => {
  let filter = "";
  if (input.ccId) {
    filter += `AND at2.collection_center = ${input.ccId}`;
  }
  if (input.startDate && input.endDate) {
    filter += ` AND at2.created_at BETWEEN '${fromTimestampToSqlDatetime(input.startDate)}' AND '${fromTimestampToSqlDatetime(input.endDate)}'`;
  }

  const data = await db.$queryRawUnsafe<AppointmentMedicineSummary[]>(`
    SELECT 
      pt.patient_name AS "patientName",
      at2.appointment_id AS "appointmentNo",
      at2.id AS "id",
      st.name AS "bookedBy",
      at2.appointment_type AS "appointmentType",
      at2.selected_date_str AS "appointmentDate",
      at2.visit_id AS "visitNo",
      at2.status AS "appointmentStatus",
      at2.bill_id AS "billNo",
      im.customer_name AS "insurerName"
    FROM appointments_table AS at2
    INNER JOIN patient_medicine AS pm
      ON pm.appointment_id = at2.id
    LEFT JOIN patients AS pt
      ON pt.patient_unique_id = at2.patient_unique_id
    LEFT JOIN staff AS st
      ON st.id = at2.doctor_id
    LEFT JOIN insurer_master im 
      ON im.id = at2.insurer_id
    WHERE (at2.med_status <> 'Success' OR at2.med_status IS NULL)
      AND pm.is_active = "yes"
      ${filter}
    GROUP BY at2.id
    HAVING COUNT(CASE WHEN pm.sell_id IS NULL THEN 1 END) > 0
    ORDER BY at2.selected_date_str DESC;  -- You can adjust sorting as needed
  `);

  return data;
};

export const insertIntoClientInvMapping = async (
  tx: Prisma.TransactionClient,
  clientId: number,
  sellRefNo: string,
  amount: number,
): Promise<void> => {
  const existingClientInvMapping = await tx.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM client_inv_map_path 
             WHERE path_invoice = ? AND client_id = ? AND lower(service_type) = 'pharmacy'`,
    sellRefNo,
    clientId,
  );

  if (existingClientInvMapping && existingClientInvMapping.length > 0) {
    await tx.$executeRaw`
    UPDATE client_inv_map_path SET amount = ${amount} WHERE id = ${existingClientInvMapping[0].id}`;
  } else {
    const today = dayjs().format(ISO_DATE_FORMAT);
    const invoiceId = `INVC-${dayjs().format("YYYYMM")}${clientId}`;
    // Raw insert similar to the PHP method
    await tx.$executeRaw`
    INSERT INTO client_inv_map_path (client_id, date, invoice_no, path_invoice, service_type, amount)
    VALUES (${clientId}, ${today}, ${invoiceId}, ${sellRefNo}, "PHARMACY", ${amount})
  `;
  }
};

export const handleClientPlanInvoiceForOpd = async (
  tx: Prisma.TransactionClient,
  params: {
    clientPlan: string | undefined;
    sellRefNo: string;
    clientId: number;
    totalAmount: number;
    coPayAmount: number;
  },
) => {
  logger.info(
    `handleClientPlanInvoiceForOpd params --------->` + JSON.stringify(params),
  );
  const plan = (params.clientPlan || "").toLowerCase();
  if (plan !== "postpaid" && plan !== "prepaid") return;
  // Check if invoice already exists
  const existingInvoices = await tx.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM pathology_b2b_invoice_amount_summary 
             WHERE case_id = ? AND b2b_client_id = ? AND lower(service_type) = 'pharmacy'`,
    params.sellRefNo,
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
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PHARMACY', ?, ?)`,
      params.sellRefNo,
      invoiceId,
      params.clientId,
      params.coPayAmount,
      plan === "prepaid" ? "paid" : "due",
      creationDate,
      invoicePaymentId,
      today,
      params.totalAmount,
    );

    // 5) Map client invoice
  }
  await insertIntoClientInvMapping(
    tx,
    params.clientId,
    params.sellRefNo,
    params.coPayAmount,
  );
};

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
             WHERE case_id = ? AND insurer_id = ? AND lower(type) = 'pharmacy'`,
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
               VALUES (?, ?, ?, ?, ?, ?, ?, ?,'Pharmacy', NOW(), NOW())`,
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

export const getAllLastAppointments = async (
  patientId: number,
): Promise<LastAppointmentRes[]> => {
  logger.info("entering::getAllLastAppointments::repository");
  const result = await db.$queryRawUnsafe<LastAppointmentRes[]>(`
    select
      p.patient_name as patientName,
      d.name as doctorName,
      a.appointment_id as appointmentId,
      scc.col_name as ccName,
      a.selected_date_str  as dateOfVisit,
      a.referred_by as referredBy,
      a.appointment_type as appointmentType,
      a.visit_id as visitId,
      a.payment_status as appointmentPaymentStatus
    from
      appointments_table a
    join patients p on p.patient_unique_id = a.patient_unique_id
    join staff d on d.id = a.doctor_id
    join sch_collection_center scc on scc.id = a.collection_center 
    where
      p.patient_unique_id = ${patientId} and p.is_active = 'yes'
  `);

  return result;
};

export const getNotCompetedOpdBillWithMedicinesDetails = async (
  appointmentId: number,
): Promise<NonCompletedMedicine[]> => {
  logger.info("entering::getNotCompetedOpdBillWithMedicines::repository");

  const result = await db.$queryRaw<NonCompletedMedicine[]>(Prisma.sql`
    SELECT
      pm_q.med_id as id,
      pi.item_number as itemNumber,
      pi.medicine_name as medicineName,
      sd_q.apt_no as appointmentNo,
      pm_q.expected_qty as expectedQty,
      COALESCE(sd_q.total_sold_qty, 0) AS totalSoldQty
    FROM
      (
      SELECT
        pm.med_id,
        CASE
          WHEN i.medicine_pack_type IN ('Strip', 'Sachet', 'Packet')
          AND (pm.morn + pm.aft + pm.night) > 0
                THEN COALESCE(SUM((pm.morn + pm.aft + pm.night) * CAST(pm.duration AS UNSIGNED)), 0)
          ELSE 1
        END AS expected_qty
      FROM
        patient_medicine pm
      LEFT JOIN pms_item i
            ON
        i.id = pm.med_id
      WHERE
        pm.appointment_id = ${appointmentId}
        AND pm.is_active = 'yes'
      GROUP BY
        pm.med_id
    ) AS pm_q
    LEFT JOIN
    (
      SELECT
        psd.item_id,
        ps.apt_no,
        COALESCE(SUM(psd.quantity), 0) AS total_sold_qty
      FROM
        pms_sell ps
      LEFT JOIN pms_sell_details psd
            ON
        psd.sell_id = ps.id
      WHERE
        ps.apt_id = ${appointmentId}
        AND ps.is_active = 1
      GROUP BY
        psd.item_id
    ) AS sd_q
        ON
      sd_q.item_id = pm_q.med_id 
    left join pms_item pi on pi.id =  pm_q.med_id 
      WHERE COALESCE(sd_q.total_sold_qty, 0) < COALESCE(pm_q.expected_qty, 0) ;
      `);

  logger.info("exiting::getNotCompetedOpdBillWithMedicines::repository");
  return result;
};

export const getAppointmentById = async (
  id: number,
): Promise<AppointmentResponse | null> => {
  const result = await db.$queryRaw<AppointmentResponse[]>(Prisma.sql`
    SELECT 
      pt.patient_name AS "patientName",
      pt.age,
      pt.dob ,
      pt.gender ,
      at2.appointment_id AS "appointmentNo",
      at2.payment_type AS "paymentType",
      at2.id AS "id",
      st.name AS "bookedBy",
      at2.appointment_type AS "appointmentType",
      at2.selected_date_str AS "appointmentDate",
      at2.visit_id AS "visitNo",
      at2.status AS "appointmentStatus",
      at2.bill_id AS "billNo",
      im.customer_name AS "insurerName",
      cm.customer_name AS "clientName",
      scc.id as ccId,
      scc.col_name as ccName,
      scc.address ,
      scc.phone as ccPhone,
      scc.email as ccEmail
    FROM appointments_table AS at2
    LEFT JOIN patients AS pt
      ON pt.patient_unique_id = at2.patient_unique_id
    LEFT JOIN staff AS st
      ON st.id = at2.doctor_id
    LEFT JOIN insurer_master im 
      ON im.id = at2.insurer_id
    LEFT JOIN client_master as cm on cm.id = at2.client_id
    left join sch_collection_center scc on scc.id = at2.collection_center 
    where at2.id = ${id}`);

  return result.length > 0 ? result[0] : null;
};
