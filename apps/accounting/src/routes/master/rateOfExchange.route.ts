import { createRateOfExchange } from "@/controllers/master/rateOfExchange.controller.js";
import { fetchRateOfExchange } from "@/controllers/master/rateOfExchange.controller.js";
import {
  validateCreateRateOfExchange,
  validateFetchRateOfExchange,
} from "@/validations/request/master/rateOfExchange.validation.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  authorize,
  verifyToken,
} from "@repo/platform/middlewares/auth.middleware.js";
import { getPermission } from "@repo/shared/utils/permission.utils.js";
import { Router } from "express";

export const rateOfExchangeRouter: Router = Router();

rateOfExchangeRouter.post(
  "/",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "RATE_OF_EXCHANGE", "CREATE")),
  validateCreateRateOfExchange,
  createRateOfExchange
);

rateOfExchangeRouter.post(
  "/fetch",
  verifyToken(ServiceCode.ACCOUNTING),
  authorize(getPermission("ACC", "RATE_OF_EXCHANGE", "VIEW")),
  validateFetchRateOfExchange,
  fetchRateOfExchange
);
