import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";
import { moduleConfigService } from "@/services/moduleConfig.service.js";
import { decodeToken } from "@repo/shared/utils/auth.utils.js";
import { AuthRequest } from "@repo/shared/types/request.type.js";
import { SEVENTEEN_HOURS } from "@/controllers/auth.controller.js";
import { envMode } from "@repo/shared/config/index.js";

export const createOrUpdateModuleConfig = TryCatch(
  async (req: AuthRequest, res: Response) => {
    logger.info("entering::createOrUpdateModuleConfig::controller");
    const { data } = req.body;
    const token = await moduleConfigService.createOrUpdateModuleConfig(data);

    res.cookie("access-token-av6", token, {
      httpOnly: true,
      secure: envMode === "PRODUCTION",
      sameSite: "lax",
      maxAge: SEVENTEEN_HOURS,
      path: "/",
      domain: envMode === "PRODUCTION" ? ".av6.co.in" : undefined,
    });

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Module Config"),
      },
      { token: token }
    );
    logger.info("exiting::createOrUpdateModuleConfig::controller");
    return res.status(201).json(response);
  }
);
