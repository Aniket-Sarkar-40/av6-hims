import { Request, Response } from "express";
import { chequeMasterService } from "@/services/master/chequeMaster.service.js";
import { logger } from "@repo/platform/logging/logger.js";
import { TryCatch } from "@repo/platform";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

export const toggleStatusChequeMaster = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::toggleStatusChequeMaster::controller");
    const { chequeMasterId } = req.query as { chequeMasterId: string };
    const updatedChequeMaster =
      await chequeMasterService.toggleStatusChequeMaster(
        Number(chequeMasterId),
      );
    const response = BaseResponse.success(
      { type: "UPDATED", data: updatedChequeMaster },
      "Cheque Master",
    );
    logger.info("exiting::toggleStatusChequeMaster::controller");
    return res.status(200).json(response);
  },
);
