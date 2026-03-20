import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreateOrUpdateConsultationICDTenList } from "@/types/appointment/consultationICDTenList.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { ConsultationICDTenList } from "@repo/db/generated/prisma/client";

export const createConsultationICDTenListInDb = async (
  data: CreateOrUpdateConsultationICDTenList,
): Promise<ConsultationICDTenList> => {
  logger.info("entering::createConsultationICDTenListInDb::repository");
  const store = requestStorage.getStore();
  const consultationICDTenListOmit = customOmit<
    CreateOrUpdateConsultationICDTenList,
    "id"
  >(data, ["id"]);
  return db.consultationICDTenList.create({
    data: {
      ...consultationICDTenListOmit.rest,
      createdBy: store?.user?.id,
    },
  });
};

export const getConsultationICDTenListByAppointmentIdFromDb = async (
  appointmentId: number,
  icdTenId: number,
): Promise<ConsultationICDTenList | null> => {
  logger.info("entering::getOpdDepartmentByIdFromDb::repository");
  return db.consultationICDTenList.findFirst({
    where: { appointmentId: appointmentId, icdTenId: icdTenId, isActive: true },
  });
};

export const getConsultationICDTenListByIdFromDb = async (id: number) => {
  logger.info("entering::getConsultationICDTenListByIdFromDb::repository");
  return db.consultationICDTenList.findFirst({
    where: { id, isActive: true },
  });
};

export const updateConsultationICDTenListInDb = async (
  data: CreateOrUpdateConsultationICDTenList,
) => {
  logger.info("entering::updateConsultationICDTenListInDb::repository");
  const store = requestStorage.getStore();
  return db.consultationICDTenList.update({
    where: { id: data.id },
    data: {
      ...data,
      updatedBy: store?.user?.id,
    },
  });
};
