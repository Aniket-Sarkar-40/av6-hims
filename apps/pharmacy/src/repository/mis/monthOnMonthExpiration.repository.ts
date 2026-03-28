import { settingsService } from "@/services/master/settings.service.js";
import {
  MonthOnMonthExpiration,
  QuarterlyExpiration,
} from "@/types/mis/monthOnMonthExpiration.js";
import { applyRound, RoundFormat } from "av6-utils";
import { db } from "@repo/db";
import { logger } from "@repo/platform/logging/logger.js";

export const getMonthOnMonthExpirationMis = async (): Promise<{
  monthWise: MonthOnMonthExpiration[];
  quarterWise: QuarterlyExpiration[];
}> => {
  logger.info("entering::monthOnMonthExpiration::repository");
  const setting = await settingsService.getSettings();
  const precision = setting?.grnPrecision ?? setting?.defaultPrecision ?? 2;

  const monthWiseData = await db.$queryRawUnsafe<MonthOnMonthExpiration[]>(`
WITH calendar AS (
  /* build the 12 months of the CURRENT year */
  SELECT
      DATE_ADD(MAKEDATE(YEAR(CURDATE()), 1), INTERVAL n MONTH)           AS month_start,
      LAST_DAY(DATE_ADD(MAKEDATE(YEAR(CURDATE()), 1), INTERVAL n MONTH)) AS month_end,
      DATE_FORMAT(
          DATE_ADD(MAKEDATE(YEAR(CURDATE()), 1), INTERVAL n MONTH),
          '%Y-%m'
      ) AS expiryMonth
  FROM ( SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
         UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
         SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
         UNION ALL SELECT 11 ) AS m
)
SELECT
    c.expiryMonth,
    COALESCE(SUM(pis.quantity * pi.purchase_amount), 0.00) AS amount
FROM      calendar       AS c
LEFT JOIN pms_item_stock AS pis
       ON pis.is_active = 1
      AND pis.expiry_date BETWEEN c.month_start AND c.month_end
LEFT JOIN pms_item       AS pi  ON pi.id = pis.item_id
GROUP BY  c.expiryMonth
ORDER BY  c.expiryMonth;
  `);

  const quarterWiseData = await db.$queryRawUnsafe<QuarterlyExpiration[]>(`
WITH calendar AS (
  SELECT
      q,
      CONCAT('Q', q)                                                    AS quarter,
      DATE_ADD(MAKEDATE(YEAR(CURDATE()), 1), INTERVAL (q-1)*3 MONTH)    AS q_start,
      LAST_DAY(
        DATE_ADD(MAKEDATE(YEAR(CURDATE()), 1), INTERVAL (q*3)-1 MONTH)
      )                                                                 AS q_end
  FROM (SELECT 1 q UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) quarters
)
SELECT
    calendar.quarter  AS expiryQuarter,
    COALESCE(SUM(pis.quantity * pi.purchase_amount), 0.00) AS amount
FROM calendar
LEFT JOIN pms_item_stock pis
       ON pis.is_active = 1
      AND pis.expiry_date BETWEEN calendar.q_start AND calendar.q_end
LEFT JOIN pms_item pi ON pi.id = pis.item_id
GROUP BY calendar.q, calendar.quarter
ORDER BY calendar.q;
  `);

  const monthWise: MonthOnMonthExpiration[] = monthWiseData.map((row) => ({
    ...row,
    amount: applyRound(row.amount, RoundFormat.TO_FIXED, precision),
  }));
  const quarterWise: QuarterlyExpiration[] = quarterWiseData.map((row) => ({
    ...row,
    amount: applyRound(row.amount, RoundFormat.TO_FIXED, precision),
  }));

  logger.info("exiting::monthOnMonthExpiration::repository");
  return { monthWise, quarterWise };
};
