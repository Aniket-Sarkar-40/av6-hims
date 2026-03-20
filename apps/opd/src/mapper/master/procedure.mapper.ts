import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { getClientPaymentSettingByFilterFromDb } from "@/repository/corporate/opdClientMasterSettings.repository.js";
import { getInsurancePaymentSettingByFilterFromDb } from "@/repository/insurance/opdInsurancePaymentSettings.repository.js";
import { collectionCenterService } from "@/services/master/collectionCenter.service.js";
import { procedureService } from "@/services/master/procedure.service.js";
import {
  FetchProcedureInput,
  FetchProcedureResponse,
  ProcedureMasterDTO,
} from "@/types/master/procedure.js";
import { customOmit, toIdValue } from "av6-utils";
import {
  OpdClientMasterSetting,
  OpdInsurerPaymentSetting,
  ProcedureMaster,
} from "@repo/db/generated/prisma/client";

export const toProcedureMasterDTO = async (
  procedure: ProcedureMaster,
): Promise<ProcedureMasterDTO> => {
  const omittedProcedure = customOmit<
    ProcedureMaster,
    "isActive" | "createdBy" | "updatedBy" | "deletedBy" | "deletedAt"
  >(procedure, [
    "isActive",
    "createdBy",
    "updatedBy",
    "deletedBy",
    "deletedAt",
  ]);

  const createdBy = procedure.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        procedure.createdBy,
        true,
      )
    : null;
  const updatedBy = procedure.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        procedure.updatedBy,
        true,
      )
    : null;
  const cc = await collectionCenterService.getCollectionCenterById(
    procedure.ccId,
  );

  return {
    ...omittedProcedure.rest,
    collectionCenter: cc ? toIdValue(cc, "colName") : null,
    createdBy: createdBy ? toIdValue(createdBy, "name") : null,
    updatedBy: updatedBy ? toIdValue(updatedBy, "name") : null,
  };
};

export const toFetchProcedureResponse = async (
  input: FetchProcedureInput,
): Promise<FetchProcedureResponse> => {
  const { procedureId, type, typeId } = input;
  const procedure = await procedureService.getProcedureById(procedureId, true);

  if (type && typeId && procedure) {
    let settings: OpdInsurerPaymentSetting | OpdClientMasterSetting | null;
    if (type === "INSURANCE") {
      settings = await getInsurancePaymentSettingByFilterFromDb(
        typeId,
        procedure.ccId,
        "Procedure",
        procedureId,
      );
    } else {
      settings = await getClientPaymentSettingByFilterFromDb(
        typeId,
        procedure.ccId,
        "Procedure",
        procedureId,
      );
    }
    const coPayType = settings
      ? settings.paymentMode === "co_pay" ||
        settings.paymentMode === "in_percentage"
        ? "PERCENTAGE"
        : "AMOUNT"
      : null;
    return {
      id: procedure.id,
      procedureName: procedure.procedureName,
      procedureCharge: procedure.procedureCharge,
      type: type,
      typeId: typeId,
      coPaymentType: coPayType,
      coPaymentValue: settings ? settings.paymentValue : null,
    };
  }

  return {
    id: procedureId,
    procedureName: procedure?.procedureName ?? null,
    procedureCharge: procedure?.procedureCharge ?? null,
    type: null,
    typeId: null,
    coPaymentType: null,
    coPaymentValue: null,
  };
};
