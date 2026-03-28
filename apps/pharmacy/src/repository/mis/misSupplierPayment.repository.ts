import {
  SupplierPaymentSchedule,
  SupplierPaymentScheduleResult,
} from "@/types/mis/misBranch.js";
import { applyRound, RoundFormat } from "av6-utils";
import { db } from "@repo/db";

export const fetchSupplierPaymentSchedule = async (
  startDate?: Date,
  endDate?: Date,
): Promise<SupplierPaymentScheduleResult> => {
  const dateCondition =
    startDate && endDate
      ? `AND gr.due_date BETWEEN '${startDate}' AND '${endDate}'`
      : "";
  const row = await db.$queryRawUnsafe<Omit<SupplierPaymentSchedule, "id">[]>(`
    SELECT
      d.dp_name                            AS supplier,
      COALESCE(gr.total_amount, 0.00)       AS amount,
      gr.bill_no                          AS invoiceNo,
      w.name                              AS branch,
      CONCAT(d.due_date, ' DAYS')         AS creditDays,
      po.date                             AS invoiceDate,
      gr.date                             AS dateSupplied,
      gr.due_date                         AS dueDate
    FROM pms_good_receive AS gr
    INNER JOIN pms_distributor AS d
      ON d.id         = gr.distributor_id
      AND d.is_active = 1
    INNER JOIN pms_warehouse AS w
      ON w.id         = gr.warehouse_id
      AND w.is_active = 1
    INNER JOIN pms_purchase_order AS po
      ON po.id         = gr.po_id
      AND po.is_active = 1
    WHERE
      gr.is_active = 1
      AND gr.status    = 'COMPLETED'
      ${dateCondition}

    ORDER BY gr.due_date;
  `);

  const rows: SupplierPaymentSchedule[] = row.map((row, idx) => ({
    id: idx + 1,
    ...row,
    amount: applyRound(row.amount, RoundFormat.TO_FIXED, 2),
  }));
  // now reduce to get total
  const totalAmount = rows.reduce((sum, r) => sum + Number(r.amount), 0);

  return { rows, totalAmount };
};
