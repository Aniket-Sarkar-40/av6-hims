import { CreateOrUpdateModuleConfigReq } from "@/types/moduleConfig.js";
import { db } from "@repo/db/client";
import { MonoRepoModule } from "@repo/db/generated/prisma/client";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";

export const createOrUpdateModuleConfigInDb = async (
  data: CreateOrUpdateModuleConfigReq[]
): Promise<MonoRepoModule[]> => {
  logger.info("entering::createOrUpdateModuleConfigInDb::service");

  const store = requestStorage.getStore();

  const existingModules = await getAllModulesFromDb();

  const existingModuleMap = new Map(
    existingModules.map((item) => [item.module, item])
  );

  const incomingModuleSet = new Set(
    data.map((item) => item.module as ServiceCode)
  );

  const createData = data.filter(
    (item) => !existingModuleMap.has(item.module as ServiceCode)
  );

  const updateData = data.filter((item) =>
    existingModuleMap.has(item.module as ServiceCode)
  );

  const deleteData = existingModules.filter(
    (item) => !incomingModuleSet.has(item.module)
  );

  await db.$transaction([
    ...createData.map((item) =>
      db.monoRepoModule.create({
        data: {
          module: item.module,
          isEnabled: item.isEnabled,
          isActive: true,
          createdBy: store?.user?.id,
        },
      })
    ),

    ...updateData.map((item) =>
      db.monoRepoModule.update({
        where: {
          id: existingModuleMap.get(item.module as ServiceCode)!.id,
        },
        data: {
          isEnabled: item.isEnabled,
          isActive: true,
          updatedBy: store?.user?.id,
          updatedAt: new Date(),
        },
      })
    ),

    ...deleteData.map((item) =>
      db.monoRepoModule.update({
        where: {
          id: item.id,
        },
        data: {
          isActive: false,
          deletedBy: store?.user?.id,
          deletedAt: new Date(),
        },
      })
    ),
  ]);

  const modules = await getEnabledModulesFromDb();

  logger.info("exiting::createOrUpdateModuleConfigInDb::service");

  return modules;
};

export const getAllModulesFromDb = async (): Promise<MonoRepoModule[]> => {
  logger.info("entering::getAllModulesFromDb::service");
  const activeModules = await db.monoRepoModule.findMany({
    where: {
      isActive: true,
    },
  });
  logger.info("exiting::getAllModulesFromDb::service");
  return activeModules;
};

export const getEnabledModulesFromDb = async (): Promise<MonoRepoModule[]> => {
  logger.info("entering::getEnabledModulesFromDb::service");
  const activeModules = await db.monoRepoModule.findMany({
    where: {
      isActive: true,
      isEnabled: true,
    },
  });
  logger.info("exiting::getEnabledModulesFromDb::service");
  return activeModules;
};
