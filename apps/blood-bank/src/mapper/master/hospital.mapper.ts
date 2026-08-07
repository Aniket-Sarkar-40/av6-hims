import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import {
  HospitalDTO,
  HospitalResponse,
  HospitalDTOLocation,
} from "@/types/master/hospital.js";
import { customOmit } from "av6-utils";
import { commonService } from "@/services/common.service.js";

export const toHospitalDTO = async (
  data: HospitalResponse[],
): Promise<HospitalDTO[]> => {
  const allCollectionCenters =
    await commonService.getAllElements<"CollectionCenter">({
      cacheCode: "COLLECTION_CENTER",
      canNullReturnable: true,
      modelName: "CollectionCenter",
      shortCode: "COLLECTION_CENTER",
      useActiveFlag: true,
    });

  return data.map((hospital) => {
    const omittedHospital = customOmit<HospitalResponse, BaseModelAttrWoCancel>(
      hospital,
      [
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
      ],
    );

    const singleCollectionCenter =
      allCollectionCenters.find((cc) => cc.id === hospital.id) ?? null;
    return {
      ...omittedHospital.rest,
      collectionCenter: singleCollectionCenter,
    };
  });
};

export const toHospitalDTOLocation = async (
  hospital: HospitalResponse,
): Promise<HospitalDTOLocation> => {
  const omittedHospital = customOmit<
    HospitalResponse,
    | "createdBy"
    | "updatedBy"
    | "isActive"
    | "deletedAt"
    | "deletedBy"
    | "createdAt"
    | "updatedAt"
  >(hospital, [
    "createdAt",
    "updatedBy",
    "isActive",
    "deletedAt",
    "deletedBy",
    "createdAt",
    "updatedAt",
  ]);
  return {
    ...omittedHospital.rest,
    collectionCenter: hospital.collectionCenter,
  };
};
