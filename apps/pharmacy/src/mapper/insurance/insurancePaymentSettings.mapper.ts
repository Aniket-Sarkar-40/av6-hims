import { insuranceService } from "@/services/insurance/insurance.service.js";
import { itemService } from "@/services/item/item.service.js";
import { branchService } from "@/services/master/branch.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import { InsurancePaymentSettings, InsurancePaymentSettingsDTO } from "@/types/insurance/insurancePaymentSettings.js";

export const toInsurancePaymentSettingsDto = async (
  insurancePaymentSettings: InsurancePaymentSettings
): Promise<InsurancePaymentSettingsDTO> => {
  const insurer = await insuranceService.getInsuranceById(insurancePaymentSettings.insuranceId, true);

  const branch = await branchService.getBranchById(insurancePaymentSettings.ccId, true);
  const medicine = await itemService.getItemByIdWoDTO(insurancePaymentSettings.medId, true);
  const createdBy = insurancePaymentSettings.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(insurancePaymentSettings.createdBy, true)
    : null;

  return {
    id: insurancePaymentSettings.id,
    insurer: insurer?.customerName,
    cc: branch?.name,
    medicine: medicine?.medicineName,
    mrp: insurancePaymentSettings.mrp,
    insurancePercentage: insurancePaymentSettings.insurancePercentage,
    coPay: insurancePaymentSettings.coPay,
    patientPay: insurancePaymentSettings.patientPay,
    paymentMode: insurancePaymentSettings.paymentMode,
    paymentValue: insurancePaymentSettings.paymentValue,
    createdBy: createdBy,
  };
};
