import { getCollectionCenterByIdFromDb } from "@/repository/collectionCenter/collectionCenter.repository.js";
import { opdDepartmentPrefixService } from "@/services/master/opdDepartmentPrefix.service.js";
import {
  DoctorDTO,
  DoctorResponse,
  DoctorScheduleDTO,
  StaffCollectionCenterDTO,
} from "@/types/doctor/doctor.js";
import { customOmit, toIdValue } from "av6-utils";
import {
  DoctorSchedule,
  StaffCollectionCenter,
} from "@repo/db/generated/prisma/client";
import { opdDepartmentService } from "../../services/master/opdDepartment.service.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";

export const toDoctorDTO = async (
  doctor: DoctorResponse,
): Promise<DoctorDTO> => {
  const { doctorSchedule, staffCollectionCenter } = doctor;

  const dept = doctor.opdDepartmentId
    ? await opdDepartmentService.getOpdDepartmentById(
        doctor.opdDepartmentId,
        true,
      )
    : null;
  const deptPrefix = doctor.prefixId
    ? await opdDepartmentPrefixService.getOpdDepartmentPrefixById(
        doctor.prefixId,
        true,
      )
    : null;
  const doctorScheduleDTO: DoctorScheduleDTO[] = await Promise.all(
    doctorSchedule.map(async (schedule) => {
      const cc = await getCollectionCenterByIdFromDb(schedule.ccId);
      const createdBy = schedule.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            schedule.createdBy,
            true,
          )
        : null;
      const updatedBy = schedule.updatedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            schedule.updatedBy,
            true,
          )
        : null;

      const omittedSchedule = customOmit<
        DoctorSchedule,
        "isActive" | "createdBy" | "updatedBy" | "deletedBy" | "deletedAt"
      >(schedule, [
        "createdBy",
        "updatedBy",
        "isActive",
        "deletedBy",
        "deletedAt",
      ]);

      return {
        ...omittedSchedule.rest,
        collectionCenter: cc ? toIdValue(cc, "colName") : null,
        createdBy: createdBy,
        updatedBy: updatedBy,
      };
    }),
  );

  const staffColMappings: StaffCollectionCenterDTO[] = await Promise.all(
    staffCollectionCenter.map(async (mapping) => {
      const omittedMappings = customOmit<StaffCollectionCenter, "isActive">(
        mapping,
        ["isActive"],
      );
      const cc = await getCollectionCenterByIdFromDb(
        mapping.collectionCenterId,
      );
      return {
        ...omittedMappings.rest,
        collectionCenter: cc ? toIdValue(cc, "colName") : null,
      };
    }),
  );

  return {
    id: doctor.id,
    employeeId: doctor.employeeId,

    name: doctor.name,
    gender: doctor.gender,
    contactNo: doctor.contactNo,
    email: doctor.email,
    doctorRegistrationNo: doctor.doctorRegistrationNo,
    address: doctor.localAddress,
    licenseName: doctor.licenseName,
    checkUpTime: doctorSchedule[0]?.timeTaken ?? 0,
    opdDepartment: dept ? toIdValue(dept, "departmentName") : null,
    opdDepartmentPrefix: deptPrefix,
    doctorSchedule: doctorScheduleDTO,
    staffCollectionCenter: staffColMappings,
  };
};
