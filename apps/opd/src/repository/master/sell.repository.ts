import { db } from "@repo/db/client";
import { GetSellReq, SellDetails } from "@/types/master/sell.js";
import { logger } from "@repo/platform/logging/logger.js";
export const getSellDetailsFromDb = async (
  input: GetSellReq,
): Promise<SellDetails | null> => {
  logger.info("entering::getSellAmountsFromDb::repository");

  const rows = await db.$queryRaw<SellDetails[]>`
    SELECT 
      ps.id,
      ps.sell_ref_no AS sellRefNo,
      ps.bill_date AS billDate,
      ps.net_amount AS netAmount,
      ps.discount,
      ps.net_discount AS netDiscount,
      ps.tax,
      ps.net_tax AS netTax,
      ps.total_amount AS totalAmount,
      ps.paid_amount AS paidAmount,
      ps.returned_amount AS returnedAmount,
      ps.total_returned_amount AS totalReturnedAmount,
      ps.co_pay_amount AS coPayAmount,
      ps.customer_pay_amount AS customerPayAmount
    FROM pms_sell ps
    WHERE 
      ps.id = ${input.sellId}
      AND ps.sell_ref_no = ${input.sellRefNo}
      AND ps.cc_id = ${input.ccId}
      AND ps.is_active = 1
    LIMIT 1;
  `;

  logger.info("exiting::getSellAmountsFromDb::repository");

  return rows[0] ?? null;
};
