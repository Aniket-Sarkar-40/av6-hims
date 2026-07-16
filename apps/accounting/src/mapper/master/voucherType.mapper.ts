import { BaseModelAttrWoCancel } from "@/types/common.js";
import {
  VoucherTypeDTO,
  VoucherTypeResponse,
} from "@/types/master/voucherType.js";
import { customOmit, toIdValue } from "av6-utils";

export const toVoucherTypeDto = (
  input: VoucherTypeResponse[]
): VoucherTypeDTO[] => {
  const response = input.map((voucherType) => {
    const omittedData = customOmit<
      VoucherTypeResponse,
      BaseModelAttrWoCancel | "company" | "companyId"
    >(voucherType, [
      "isActive",
      "createdBy",
      "createdAt",
      "updatedBy",
      "updatedAt",
      "deletedBy",
      "deletedAt",
    ]);
    return {
      ...omittedData.rest,
      company: toIdValue(voucherType.company, "name"),
    };
  });

  return response;
};
