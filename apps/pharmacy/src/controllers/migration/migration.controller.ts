import { TryCatch } from "@repo/platform";
import { migrationService } from "@/services/migration/migration.service.js";
import { CreateMigrationReq } from "@/types/migration/migration.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createMigration = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createMigration::controller");

  const body = req.body as CreateMigrationReq;
  const migration = await migrationService.createMigrationService(body);

  logger.info("exiting::createMigration::controller");

  return res
    .status(201)
    .json(
      BaseResponse.success({ type: "CREATED", data: migration }, "Migration"),
    );
});
