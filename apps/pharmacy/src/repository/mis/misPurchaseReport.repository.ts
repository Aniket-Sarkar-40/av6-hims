import { settingsService } from "@/services/master/settings.service.js";
import {
  GoodReceiveDashboardData,
  GoodReceiveMonthlySummary,
  GoodReceiveQuarterSummary,
} from "@/types/mis/misBranch.js";
import { applyRound, RoundFormat } from "av6-utils";
import { db } from "@repo/db";

export const fetchGoodReceiveDashboard =
  async (): Promise<GoodReceiveDashboardData> => {
    const setting = await settingsService.getSettings();
    const precision = setting?.grnPrecision ?? setting?.defaultPrecision ?? 2;
    // Monthly breakdown (Jan–Dec plus TOTAL)
    const monthWiseData = await db.$queryRawUnsafe<
      GoodReceiveMonthlySummary[]
    >(`
   SELECT 'JANUARY'   AS month, COALESCE(SUM(gr.total_amount), 0.00) AS amount
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED'
       AND MONTH(gr.date) = 1
    UNION ALL
    SELECT 'FEBRUARY',  COALESCE(SUM(gr.total_amount), 0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED'
       AND MONTH(gr.date) = 2
    UNION ALL
    SELECT 'MARCH',     COALESCE(SUM(gr.total_amount), 0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED'
       AND MONTH(gr.date) = 3
    UNION ALL
    SELECT 'APRIL',     COALESCE(SUM(gr.total_amount), 0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED'
       AND MONTH(gr.date) = 4
    UNION ALL
    SELECT 'MAY',       COALESCE(SUM(gr.total_amount), 0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED'
       AND MONTH(gr.date) = 5
    UNION ALL
    SELECT 'JUNE',      COALESCE(SUM(gr.total_amount), 0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED'
       AND MONTH(gr.date) = 6
    UNION ALL
    SELECT 'JULY',      COALESCE(SUM(gr.total_amount), 0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED'
       AND MONTH(gr.date) = 7
    UNION ALL
    SELECT 'AUGUST',    COALESCE(SUM(gr.total_amount), 0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED'
       AND MONTH(gr.date) = 8
    UNION ALL
    SELECT 'SEPTEMBER', COALESCE(SUM(gr.total_amount), 0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED'
       AND MONTH(gr.date) = 9
    UNION ALL
    SELECT 'OCTOBER',   COALESCE(SUM(gr.total_amount), 0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED'
       AND MONTH(gr.date) = 10
    UNION ALL
    SELECT 'NOVEMBER',  COALESCE(SUM(gr.total_amount), 0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED'
       AND MONTH(gr.date) = 11
    UNION ALL
    SELECT 'DECEMBER',  COALESCE(SUM(gr.total_amount), 0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED'
       AND MONTH(gr.date) = 12
    UNION ALL
    SELECT 'TOTAL',     COALESCE(SUM(gr.total_amount), 0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1
       AND gr.status = 'COMPLETED';
  `);

    // Quarterly breakdown
    const quarterWiseData = await db.$queryRawUnsafe<
      GoodReceiveQuarterSummary[]
    >(`
    SELECT 'Q1 (JAN–MAR)' AS period, COALESCE(SUM(gr.total_amount),0.00) AS amount
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1 AND gr.status = 'COMPLETED' AND MONTH(gr.date) BETWEEN 1 AND 3
    UNION ALL
    SELECT 'Q2 (APR–JUN)', COALESCE(SUM(gr.total_amount),0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1 AND gr.status = 'COMPLETED' AND MONTH(gr.date) BETWEEN 4 AND 6
    UNION ALL
    SELECT 'Q3 (JUL–SEP)', COALESCE(SUM(gr.total_amount),0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1 AND gr.status = 'COMPLETED' AND MONTH(gr.date) BETWEEN 7 AND 9
    UNION ALL
    SELECT 'Q4 (OCT–DEC)', COALESCE(SUM(gr.total_amount),0.00)
      FROM pms_good_receive AS gr
     WHERE gr.is_active = 1 AND gr.status = 'COMPLETED' AND MONTH(gr.date) BETWEEN 10 AND 12;
  `);

    const monthWise: GoodReceiveMonthlySummary[] = monthWiseData.map((row) => ({
      ...row,
      amount: applyRound(row.amount, RoundFormat.TO_FIXED, precision),
    }));
    const quarterWise: GoodReceiveQuarterSummary[] = quarterWiseData.map(
      (row) => ({
        ...row,
        amount: applyRound(row.amount, RoundFormat.TO_FIXED, precision),
      }),
    );
    return { monthWise, quarterWise };
  };
