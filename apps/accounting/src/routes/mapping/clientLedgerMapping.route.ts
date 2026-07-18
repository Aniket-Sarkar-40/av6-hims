import {
  createExternalClientLedgerMapping,
  fetchClientLedgerMapping,
} from "@/controllers/mapping/clientLedgerMapping.controller.js";
import { authorizeExternalRequest } from "@/middleware/auth.middleware.js";
import {
  validateCreateExternalClientLedgerMapping,
  validateFetchClientLedgerMapping,
} from "@/validations/request/mapping/clientLedgerMapping.validation.js";
import { Router } from "express";

export const clientLedgerMappingRouter: Router = Router();

clientLedgerMappingRouter.post(
  "/external",
  authorizeExternalRequest(),
  validateCreateExternalClientLedgerMapping,
  createExternalClientLedgerMapping
);

clientLedgerMappingRouter.post(
  "/external-fetch",
  authorizeExternalRequest(),
  validateFetchClientLedgerMapping,
  fetchClientLedgerMapping
);
