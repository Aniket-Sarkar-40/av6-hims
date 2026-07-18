import { clientLedgerMappingService } from "@/services/mapping/clientLedgerMapping.service.js";

import {
  CreateExternalClientLedgerMappingInput,
  FetchClientLedgerMappingInput,
} from "@/types/mapping/clientLedgerMapping.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";

export const createExternalClientLedgerMapping = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createExternalClientLedgerMapping::controller");
    const input = req.body as CreateExternalClientLedgerMappingInput;
    const mapping =
      await clientLedgerMappingService.createExternalClientLedgerMapping(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: mapping },
      "Client Ledger Mapping"
    );
    logger.info("exiting::createExternalClientLedgerMapping::controller");
    return res.status(201).json(response);
  }
);

export const fetchClientLedgerMapping = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::fetchClientLedgerMapping::controller");
    const input = req.body as FetchClientLedgerMappingInput;
    const mapping = await clientLedgerMappingService.fetchClientLedgerMapping(
      input
    );
    const response = BaseResponse.success(
      { type: "FETCHED", data: mapping },
      "Client Ledger Mapping"
    );
    logger.info("exiting::fetchClientLedgerMapping::controller");
    return res.status(200).json(response);
  }
);
