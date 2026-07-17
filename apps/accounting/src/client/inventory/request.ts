import { externalInterceptor } from "@/config/axiosClient.js";
import {
  InventoryOpeningAndClosingStockRequest,
  StockOpeningClosingResponse,
} from "@/types/reports/profitLoss.js";
import { logger } from "@repo/platform/logging/logger.js";
import { INVENTORY_SERVICE_URL } from "@repo/shared";

export const inventoryRequests = {
  async getOpeningAndClosingStock(
    input: InventoryOpeningAndClosingStockRequest
  ): Promise<StockOpeningClosingResponse | null> {
    logger.info("entering::getOpeningAndClosingStock::service");

    const url = `${INVENTORY_SERVICE_URL}/stock-opening-closing/ext`;
    const client = externalInterceptor();

    try {
      const res = await client.post(url, input, {
        validateStatus: (s) => s === 200 || s === 404,
      });
      if (!res.data.success || res.status === 404) {
        logger.info(
          "exiting::getOpeningAndClosingStock::service (404 -> null)"
        );
        return null;
      }
      return res.data.data;
    } catch (error) {
      logger.error(`getOpeningAndClosingStock::service error ${error}`);
      return null;
    }
  },
};
