import { getOpeningClosingStock } from "@/repository/stock/stockOpeningClosing.repository.js";
import { StockOpeningClosingFilter } from "@/types/stock/stockOpeningClosing.js";
import { logger } from "@repo/platform/logging/logger.js";

export const stockOpeningClosingService = {
  async getOpeningClosingStock(input: StockOpeningClosingFilter) {
    logger.info("entering::getOpeningClosingStock::service");
    const result = await getOpeningClosingStock(input);
    logger.info("exiting::getOpeningClosingStock::service");
    return result;
  },
};
