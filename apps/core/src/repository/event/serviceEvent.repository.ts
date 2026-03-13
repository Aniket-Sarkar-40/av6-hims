import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreateServiceEvent } from "@/types/event/serviceEvent.js";
import { logger } from "@repo/platform/logging/logger.js";
import { ServiceCode, ServiceEvent } from "@repo/db/generated/prisma/client";
import { omitUndefined } from "@repo/shared/utils/helper.utils.js";

export const createServiceEventInDb = async (
  serviceEvent: CreateServiceEvent
): Promise<ServiceEvent> => {
  logger.info("entering::createServiceEvent::repository");
  const store = requestStorage.getStore();
  return db.serviceEvent.create({
    data: omitUndefined({ ...serviceEvent, createdBy: store?.user?.id }),
  });
};

export const getAllServiceEventFromDb = async (): Promise<ServiceEvent[]> => {
  logger.info("entering::getAllServiceEvent::repository");
  return db.serviceEvent.findMany({});
};

export const getServiceEventByIdFromDb = async (
  id: number
): Promise<ServiceEvent | null> => {
  logger.info("entering::getServiceEventById::repository");
  return db.serviceEvent.findUnique({
    where: { id },
  });
};

export const getServiceEventByServiceEventNameFromDb = async (
  service: ServiceCode
): Promise<ServiceEvent | null> => {
  logger.info("entering::getServiceEventByServiceEventName::repository");
  return db.serviceEvent.findFirst({
    where: { service },
  });
};

export const updateServiceEventInDb = async (
  serviceEvents: CreateServiceEvent[]
): Promise<ServiceEvent[]> => {
  logger.info("entering::updateServiceEventInDb::repository");

  const store = requestStorage.getStore();
  const userId = store?.user?.id;

  return await db.$transaction(
    serviceEvents.map((event) => {
      const { id, ...rest } = event;
      return db.serviceEvent.update({
        where: { id: id! },
        data: omitUndefined({
          ...rest,
          updatedBy: userId ?? null,
        }),
      });
    })
  );
};
