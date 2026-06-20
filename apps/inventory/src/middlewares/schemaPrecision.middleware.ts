import { settingsService } from "@/services/master/settings.service.js";
import { setSchemaPrecisionSettings } from "@/utils/schema.utils.js";
import { NextFunction, Request, Response } from "express";

let isSchemaPrecisionLoaded = false;

export const refreshSchemaPrecisionSettings = async () => {
  const settings = await settingsService.getSettings(true);
  setSchemaPrecisionSettings(settings);
  isSchemaPrecisionLoaded = true;
};

export const loadSchemaPrecisionSettings = async (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!isSchemaPrecisionLoaded) {
      await refreshSchemaPrecisionSettings();
    }

    next();
  } catch (error) {
    next(error);
  }
};
