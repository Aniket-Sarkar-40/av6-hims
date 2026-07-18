import { TryCatch } from "@repo/platform";
import { featureFlagService } from "@/services/feature/feature.service.js";
import {
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
} from "@/types/feature/feature.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createFeatureFlag = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createFeatureFlag::controller");
    const input = req.body as CreateFeatureFlagInput;
    const feature = await featureFlagService.createFeatureFlag(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: feature },
      "Feature Flag",
    );

    logger.info("exiting::createFeatureFlag::controller");
    return res.status(201).json(response);
  },
);

export const updateFeatureFlag = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateFeatureFlag::controller");
    const input = req.body as UpdateFeatureFlagInput;
    const updated = await featureFlagService.updateFeatureFlag(input);
    logger.info("exiting::updateFeatureFlag::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "UPDATED", data: updated },
          "Feature Flag",
        ),
      );
  },
);

export const getAllFeatureFlags = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllFeatureFlags::controller");
    const features = await featureFlagService.getAllFeatureFlags();
    logger.info("exiting::getAllFeatureFlags::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "FETCHED", data: features },
          "Feature Flags",
        ),
      );
  },
);

export const getFeatureFlagByShortCode = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getFeatureFlagByShortCode::controller");
    const { shortCode } = req.query as { shortCode: string };
    const feature =
      await featureFlagService.getFeatureFlagByShortCode(shortCode);
    logger.info("exiting::getFeatureFlagByShortCode::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "FETCHED", data: feature },
          "Feature Flag",
        ),
      );
  },
);

export const toggleFeatureFlag = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::toggleFeatureFlag::controller");
    const { featureFlagId } = req.query as { featureFlagId: string };
    const updated = await featureFlagService.toggleEnabled(
      Number(featureFlagId),
    );
    logger.info("exiting::toggleFeatureFlag::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { type: "UPDATED", data: updated },
          "Feature Flag",
        ),
      );
  },
);

export const deleteFeatureFlag = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteFeatureFlag::controller");
    const { featureFlagId } = req.query as { featureFlagId: string };
    const isDeleted = await featureFlagService.deleteFeatureFlag(
      Number(featureFlagId),
    );
    if (!isDeleted) {
      return res
        .status(400)
        .json(BaseResponse.error({ message: "Unable to Delete Feature Flag" }));
    }
    logger.info("exiting::deleteFeatureFlag::controller");
    return res
      .status(200)
      .json(BaseResponse.success({ type: "DELETED" }, "Feature Flag"));
  },
);
