import { ServiceCode } from "@repo/db/generated/prisma/enums.js";

export type CreateOrUpdateModuleConfigReq = {
  id?: number;
  module: ServiceCode;
  isEnabled: boolean;
};
