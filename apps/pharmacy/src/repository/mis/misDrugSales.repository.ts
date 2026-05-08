import { settingsService } from "@/services/master/settings.service.js";
import {
  BranchMonthlySalesSummary,
  QuarterWise,
  SalesDashboardData,
} from "@/types/mis/misBranch.js";
import {
  SellInformation,
  SellInformationFilters,
} from "@/types/mis/sellMis.js";
import { db } from "@repo/db";
import { PaginatedResponse } from "av6-core-v2";
import { applyRound, RoundFormat } from "av6-utils";

export const fetchBranchMonthlySales =
  async (): Promise<SalesDashboardData> => {
    const setting = await settingsService.getSettings();
    const precision = setting?.sellPrecision ?? setting?.defaultPrecision ?? 2;
    const currentYear = new Date().getFullYear();

    // 1) per‑branch, per‑month pivot + Total row with adjusted customer pay amount
    const monthWiseData = await db.$queryRawUnsafe<
      BranchMonthlySalesSummary[]
    >(`
    SELECT
      cc.col_name AS branches,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=1  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00) AS January,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=2  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00) AS February,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=3  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00) AS March,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=4  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00) AS April,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=5  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00) AS May,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=6  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00) AS June,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=7  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00) AS July,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=8  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00) AS August,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=9  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00) AS September,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=10 THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00) AS October,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=11 THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00) AS November,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=12 THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00) AS December
    FROM pms_sell AS ps
    LEFT JOIN sch_collection_center AS cc ON cc.id = ps.cc_id
    LEFT JOIN (
      SELECT
        sell_id,
        SUM(customer_pay_amount) AS customer_pay_amount,
        SUM(co_pay_amount) AS co_pay_amount,
        SUM(net_amount) AS net_amount
      FROM pms_sell_return
      WHERE status IN ('APPROVED', 'PARTIALLY_APPROVED')
      GROUP BY sell_id
    ) AS psr ON psr.sell_id = ps.id
    WHERE ps.is_active = 1
    AND YEAR(ps.bill_date) = ${currentYear}
    GROUP BY cc.col_name

    UNION ALL

    SELECT
      'Total' AS branches,
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=1  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00),
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=2  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00),
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=3  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00),
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=4  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00),
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=5  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00),
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=6  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00),
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=7  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00),
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=8  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00),
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=9  THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00),
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=10 THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00),
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=11 THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00),
      COALESCE(SUM(CASE WHEN MONTH(ps.bill_date)=12 THEN ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2) ELSE 0 END), 0.00)
    FROM pms_sell AS ps
    LEFT JOIN sch_collection_center AS cc ON cc.id = ps.cc_id
    LEFT JOIN (
      SELECT
        sell_id,
        SUM(customer_pay_amount) AS customer_pay_amount,
        SUM(co_pay_amount) AS co_pay_amount,
        SUM(net_amount) AS net_amount
      FROM pms_sell_return
      WHERE status IN ('APPROVED', 'PARTIALLY_APPROVED')
      GROUP BY sell_id
    ) AS psr ON psr.sell_id = ps.id
    WHERE ps.is_active = 1
    AND YEAR(ps.bill_date) = ${currentYear}
    ORDER BY (branches='Total'), branches;
  `);

    // 2) overall quarter pivot + TOTAL with adjusted customer pay amount
    const quarterWiseData = await db.$queryRawUnsafe<QuarterWise[]>(`
    SELECT q.period, COALESCE(s.amount, 0.00) AS amount
    FROM (SELECT 'Q1' AS period UNION ALL SELECT 'Q2' UNION ALL SELECT 'Q3' UNION ALL SELECT 'Q4') AS q
    LEFT JOIN (
      SELECT
        CASE
          WHEN MONTH(ps.bill_date) BETWEEN 1 AND 3 THEN 'Q1'
          WHEN MONTH(ps.bill_date) BETWEEN 4 AND 6 THEN 'Q2'
          WHEN MONTH(ps.bill_date) BETWEEN 7 AND 9 THEN 'Q3'
          ELSE 'Q4'
        END AS period,
        COALESCE(SUM(ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2)), 0.00) AS amount
      FROM pms_sell ps
      LEFT JOIN (
        SELECT
          sell_id,
          SUM(customer_pay_amount) AS customer_pay_amount,
          SUM(co_pay_amount) AS co_pay_amount,
          SUM(net_amount) AS net_amount
        FROM pms_sell_return
        WHERE status IN ('APPROVED', 'PARTIALLY_APPROVED')
        GROUP BY sell_id
      ) AS psr ON psr.sell_id = ps.id
      WHERE ps.is_active = 1
      GROUP BY period
    ) AS s ON s.period = q.period
    UNION ALL
    SELECT 'TOTAL' AS period, COALESCE(SUM(ROUND((COALESCE(ps.customer_pay_amount, 0) - COALESCE(psr.customer_pay_amount, 0)), 2)), 0.00) AS amount
    FROM pms_sell ps
    LEFT JOIN (
      SELECT
        sell_id,
        SUM(customer_pay_amount) AS customer_pay_amount,
        SUM(co_pay_amount) AS co_pay_amount,
        SUM(net_amount) AS net_amount
      FROM pms_sell_return
      WHERE status IN ('APPROVED', 'PARTIALLY_APPROVED')
      GROUP BY sell_id
    ) AS psr ON psr.sell_id = ps.id
    WHERE ps.is_active = 1
    AND YEAR(ps.bill_date) = ${currentYear}
    ORDER BY FIELD(period,'Q1','Q2','Q3','Q4','TOTAL');
  `);

    const monthWise: BranchMonthlySalesSummary[] = monthWiseData.map((row) => ({
      ...row,
      January: applyRound(row.January, RoundFormat.TO_FIXED, precision),
      February: applyRound(row.February, RoundFormat.TO_FIXED, precision),
      March: applyRound(row.March, RoundFormat.TO_FIXED, precision),
      April: applyRound(row.April, RoundFormat.TO_FIXED, precision),
      May: applyRound(row.May, RoundFormat.TO_FIXED, precision),
      June: applyRound(row.June, RoundFormat.TO_FIXED, precision),
      July: applyRound(row.July, RoundFormat.TO_FIXED, precision),
      August: applyRound(row.August, RoundFormat.TO_FIXED, precision),
      September: applyRound(row.September, RoundFormat.TO_FIXED, precision),
      October: applyRound(row.October, RoundFormat.TO_FIXED, precision),
      November: applyRound(row.November, RoundFormat.TO_FIXED, precision),
      December: applyRound(row.December, RoundFormat.TO_FIXED, precision),
    }));

    const quarterWise: QuarterWise[] = quarterWiseData.map((row) => ({
      ...row,
      amount: applyRound(row.amount, RoundFormat.TO_FIXED, precision),
    }));

    return { monthWise, quarterWise };
  };

export const fetchSellInformationWithPagination = async (
  filters: SellInformationFilters = {
    pageNo: 1,
    pageSize: Number.MAX_SAFE_INTEGER,
  }
): Promise<PaginatedResponse<SellInformation>> => {
  const {
    pageNo = 1,
    pageSize = Number.MAX_SAFE_INTEGER,
    sortBy = "ps.bill_date",
    sortDir = "ASC",
    searchText,
    startDate,
    endDate,
    ccId,
    status,
    patientId,
    doctorId,
  } = filters;

  const conditions: string[] = [];
  const params: unknown[] = [];

  // Build WHERE conditions
  if (startDate) {
    conditions.push("ps.bill_date >= ?");
    params.push(startDate);
  }

  if (endDate) {
    conditions.push("ps.bill_date <= ?");
    params.push(endDate);
  }

  if (ccId) {
    conditions.push("ps.cc_id = ?");
    params.push(ccId);
  }

  if (status) {
    conditions.push("ps.status = ?");
    params.push(status);
  }

  if (patientId) {
    conditions.push("ps.customer_id = ?");
    params.push(patientId);
  }

  if (doctorId) {
    conditions.push("ps.doctor_id = ?");
    params.push(doctorId);
  }

  // Add search text condition
  if (searchText) {
    conditions.push(`(
      ps.sell_ref_no LIKE ? OR 
      ps.apt_no LIKE ? OR 
      p.patient_name LIKE ? OR 
      s.name LIKE ? OR 
      im.customer_name LIKE ? OR 
      cm.customer_name LIKE ?
    )`);
    const searchPattern = `%${searchText}%`;
    params.push(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    );
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Validate sortBy field to prevent SQL injection
  const allowedSortFields = [
    "ps.bill_date",
    "ps.sell_ref_no",
    "ps.apt_no",
    "p.patient_name",
    "s.name",
    "ps.status",
    "adjustedGrossAmount",
    "adjustedCoPayAmount",
    "adjustedCustomerPayAmount",
    "ps.paid_amount",
    "ps.total_returned_amount",
    "dueOrSettled",
  ];

  const validSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "ps.bill_date";
  const validSortDir = ["ASC", "DESC"].includes(sortDir) ? sortDir : "ASC";

  // Calculate offset for pagination
  const offset = (pageNo - 1) * pageSize;

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM pms_sell ps
    LEFT JOIN (
      SELECT
        sell_id,
        SUM(customer_pay_amount) AS customer_pay_amount,
        SUM(co_pay_amount) AS co_pay_amount,
        SUM(net_amount) as net_amount
      FROM pms_sell_return
      WHERE status IN ('APPROVED', 'PARTIALLY_APPROVED')
      GROUP BY sell_id
    ) as psr ON psr.sell_id = ps.id 
    LEFT JOIN patients p ON ps.customer_id = p.id
    LEFT JOIN staff s ON s.id = ps.doctor_id
    LEFT JOIN insurer_master im ON im.id = ps.insurance_id
    LEFT JOIN client_master cm ON cm.id = ps.corporate_client_id
    ${whereClause}
  `;

  const countResult = await db.$queryRawUnsafe<[{ total: bigint }]>(
    countQuery,
    ...params
  );
  const total = Number(countResult[0]?.total || 0);

  // Get paginated data with camelCase aliases
  const dataQuery = `
    SELECT
      ps.id,
      ps.sell_ref_no as sellNo,
      ps.apt_no as aptNo,
      ps.bill_no as billNo,
      ps.delivery_type as deliveryType,
      p.patient_name as patientName,
      p.mobileno as mobileNo,
      p.email as email,
      s.name as doctorName,
      ps.bill_date as date,
      im.customer_name as insuranceName,
      cm.customer_name as corporateName,
      ps.status,
      ps.net_amount as grossAmount,
      ps.co_pay_amount as coPayAmount,
      ps.customer_pay_amount as customerPayAmount,
      sid.sale_items as saleItems,
      sid.totalQty,
      ROUND(COALESCE(psr.net_amount, 0), 2) as returnGrossAmount,
      ROUND(COALESCE(psr.co_pay_amount, 0), 2) as returnCoPayAmount,
      ROUND(COALESCE(psr.customer_pay_amount, 0), 2) as returnCustomerPayAmount,
      ROUND((ps.net_amount - COALESCE(psr.net_amount, 0)), 2) as adjustedGrossAmount, 
      ROUND((ps.co_pay_amount - COALESCE(psr.co_pay_amount, 0)), 2) as adjustedCoPayAmount,
      ROUND((ps.customer_pay_amount - COALESCE(psr.customer_pay_amount, 0)), 2) as adjustedCustomerPayAmount,
      ROUND((ps.net_discount  - COALESCE(psr.net_discount , 0)), 2) as adjustedDiscountAmount,
      ps.paid_amount as paidAmount,
      ps.total_returned_amount as refundedAmount,
      GREATEST(ROUND(((COALESCE(ps.total_amount, 0)) - COALESCE(psr.total_amount, 0) - COALESCE(psr.co_pay_amount, 0) - COALESCE(ps.paid_amount, 0)), 2), 0) as dueOrSettled
    FROM pms_sell ps
    LEFT JOIN (
      SELECT
        sell_id,
        SUM(customer_pay_amount) AS customer_pay_amount,
        SUM(co_pay_amount) AS co_pay_amount,
        SUM(net_amount) as net_amount,
        SUM(total_amount) as total_amount,
        SUM(net_discount ) as net_discount
      FROM pms_sell_return
      WHERE status IN ('APPROVED', 'PARTIALLY_APPROVED')
      GROUP BY sell_id
    ) as psr ON psr.sell_id = ps.id 
    LEFT JOIN (
      SELECT
          sell_id,
          sum(psd.quantity - psd.return_quantity) as totalQty,
          GROUP_CONCAT(CONCAT(pi.medicine_name , ' x ', psd.quantity - psd.return_quantity ) SEPARATOR '\n') AS sale_items
      FROM pms_sell_details as psd
      join pms_item  pi on pi.id = psd.item_id 
      where psd.quantity - psd.return_quantity > 0
      GROUP BY sell_id
    ) sid ON sid.sell_id = ps.id
    LEFT JOIN patients p ON ps.customer_id = p.id
    LEFT JOIN staff s ON s.id = ps.doctor_id
    LEFT JOIN insurer_master im ON im.id = ps.insurance_id
    LEFT JOIN client_master cm ON cm.id = ps.corporate_client_id
    ${whereClause}
    ORDER BY ${validSortBy} ${validSortDir}
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  const sellData = await db.$queryRawUnsafe<SellInformation[]>(
    dataQuery,
    ...params
  );

  return {
    data: sellData,
    totalRecords: total,
    currentPageNumber: pageNo,
    lastPageNumber: Math.ceil(total / pageSize),
    pageSize,
  };
};
