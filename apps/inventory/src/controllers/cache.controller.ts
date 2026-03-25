import { clearAllCache, clearCache, loadCache } from "@/cache/redisClient";
import { TryCatch } from "@/middlewares/error.middleware";
import { BaseResponse } from "@/utils/baseResponse.utils";
import { logger } from "@/utils/logger.utils";
import { generateSuccessMessage } from "@/utils/responseMessage.utils";
import { Request, Response } from "express";

export const getAllCacheController = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllCache::controller");

  const { cacheKeys } = req.body as { cacheKeys: string[] };

  if (!cacheKeys || cacheKeys.length === 0) {
    logger.info("No cacheKey name provided: reloading ALL cacheable cacheKey.");
    await loadCache();
    const response = new BaseResponse({
      success: true,
      message: generateSuccessMessage("UPDATED", "Cache"),
    });
    return res.status(200).json(response);
  }

  for (const cacheKey of cacheKeys) {
    await loadCache(cacheKey);
  }

  logger.info("exiting::getAllCache::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("UPDATED", "Cache"),
    })
  );
});

export const clearCacheController = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::clearCache::controller");

  const cacheKey: string | undefined =
    typeof req.params.cacheKey === "string" ? req.params.cacheKey : (req.body.cacheKey as string | undefined);

  if (!cacheKey) {
    return res.status(400).json(
      new BaseResponse(
        {
          success: false,
          message: "Missing required field: cacheKey",
        },
        null
      )
    );
  }

  await clearCache(cacheKey);

  logger.info("exiting::clearCache::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("DELETED", "Cache"),
    })
  );
});

export const clearAllCacheController = TryCatch(async (_req: Request, res: Response) => {
  logger.info("entering::clearAllCache::controller");

  await clearAllCache();

  logger.info("exiting::clearAllCache::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("DELETED", "All cache"),
      },
      null
    )
  );
});
