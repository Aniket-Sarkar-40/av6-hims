import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { omitUndefined } from "@repo/shared/utils/helper.utils.js";
import { UpsertEventConfigWithKeysInput } from "@/types/event/eventConfig.js";
import {
  EventConfig,
  EventConfigKey,
  Prisma,
} from "@repo/db/generated/prisma/client";

export const upsertEventConfigWithKeysInDb = async (
  input: UpsertEventConfigWithKeysInput,
) => {
  logger.info("entering::upsertEventConfigWithKeysInDb::repository");

  const currentUser = requestStorage.getStore()?.user?.id ?? null;
  const { masterData, toCreateKeys, toUpdateKeys, toDeleteKeyIds } = input;

  const result = await db.$transaction(async (tx) => {
    const master = await (async () => {
      if (masterData.toCreate) {
        return tx.eventConfig.create({
          data: omitUndefined({
            ...masterData.toCreate,
            createdBy: currentUser,
          }),
        });
      }

      const toUpdate = masterData.toUpdate!;
      const omittedUpdate = customOmit(toUpdate, ["id"]);

      return tx.eventConfig.update({
        where: { id: toUpdate.id! },
        data: {
          ...omittedUpdate.rest,
          updatedBy: currentUser,
        },
      });
    })();

    const eventConfigId = master.id;

    await tx.eventConfig.update({
      where: { id: eventConfigId },
      data: {
        eventConfigKeys: {
          create: toCreateKeys.map((x) => ({
            ...x,
            createdBy: currentUser,
          })),

          update: toUpdateKeys.map((x) => {
            const omitted = customOmit(x, ["id"]);
            return {
              where: { id: x.id!, isActive: true },
              data: {
                ...omitted.rest,
                updatedBy: currentUser,
              },
            };
          }),

          updateMany: toDeleteKeyIds.length
            ? {
                where: { id: { in: toDeleteKeyIds } },
                data: {
                  isActive: false,
                  deletedAt: new Date(),
                  deletedBy: currentUser,
                  updatedBy: currentUser,
                },
              }
            : [],
        },
      },
    });
  });

  logger.info("exiting::upsertEventConfigWithKeysInDb::repository");
  return result;
};

export const getAllEventConfigFromDb = async (): Promise<EventConfig[]> => {
  logger.info("entering::getAllEventConfig::repository");
  return db.eventConfig.findMany({
    include: {
      serviceEvent: true,
    },
  });
};

export const getEventConfigByIdFromDb = async (
  id: number,
): Promise<EventConfig | null> => {
  logger.info("entering::getEventConfigById::repository");
  return db.eventConfig.findUnique({
    where: { id },
    include: {
      serviceEvent: true,
    },
  });
};

export const getEventConfigKeyByIdFromDb = async (
  id: number,
): Promise<EventConfigKey | null> => {
  logger.info("entering::getEventConfigById::repository");
  return db.eventConfigKey.findFirst({
    where: { id, isActive: true },
  });
};

export const getEventConfigByEventConfigNameAndTypeFromDb = async (
  serviceEventId: number,
  eventName: string,
): Promise<EventConfig | null> => {
  logger.info("entering::getEventConfigByEventConfigNameAndType::repository");
  return db.eventConfig.findFirst({
    where: {
      serviceEventId,
      eventName,
    },
    include: {
      serviceEvent: true,
    },
  });
};

export const deleteEventConfigInDb = async (
  id: number,
): Promise<EventConfig> => {
  logger.info("entering::deleteEventConfig::repository");
  return db.eventConfig.delete({
    where: { id },
    include: {
      serviceEvent: true,
    },
  });
};

export const getAllEventConfigKeysByEventConfigIdFromDb = async (
  eventConfigId: number,
): Promise<EventConfigKey[]> => {
  logger.info(
    "entering::getAllEventConfigKeysByEventConfigIdFromDb::repository",
  );
  return db.eventConfigKey.findMany({
    where: {
      eventConfigId,
      isActive: true,
    },
  });
};

export const markReadNotifications = async (ids: number[]) => {
  logger.info("entering::markReadNotifications::repository");

  await db.notification.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data: {
      readAt: new Date(),
      isRead: true,
    },
  });
};
