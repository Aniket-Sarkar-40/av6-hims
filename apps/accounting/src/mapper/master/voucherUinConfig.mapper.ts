import { commonGetService } from "@/services/common.service.js";
import { BaseModelAttrWoCancel } from "@/types/common.js";
import { VoucherUINConfigDTO } from "@/types/master/voucherUinConfig.js";
import { VoucherUINConfig } from "@repo/db/generated/prisma/client";
import { UINSegment } from "av6-core-v2";
import { customOmit, toIdValue } from "av6-utils";

export const toVoucherUINConfigDTO = async (
  data: VoucherUINConfig[],
): Promise<VoucherUINConfigDTO[]> => {
  const voucherTypes = await commonGetService.getAllElements<"VoucherType">({
    cacheCode: "VOUCHER_TYPE",
    canNullReturnable: true,
    modelName: "VoucherType",
    shortCode: "VOUCHER_TYPE",
    useActiveFlag: true,
  });
  const response = data.map((voucherUINConfig) => {
    const voucherType = voucherTypes?.find(
      (voucherType) => voucherType.id === voucherUINConfig.voucherTypeId,
    );
    const uinSegments =
      typeof voucherUINConfig.uinSegments === "string"
        ? (JSON.parse(voucherUINConfig.uinSegments) as UINSegment[])
        : [];
    return {
      ...customOmit<
        VoucherUINConfig,
        BaseModelAttrWoCancel | "uinSegments" | "sequenceNo"
      >(voucherUINConfig, [
        "uinSegments",
        "sequenceNo",
        "isActive",
        "createdBy",
        "createdAt",
        "updatedBy",
        "updatedAt",
        "deletedBy",
        "deletedAt",
      ]).rest,
      voucherType: toIdValue(voucherType, "name"),
      sequenceNo: voucherUINConfig.sequenceNo.toString(),
      uinSegments,
    };
  });
  return response;
};
