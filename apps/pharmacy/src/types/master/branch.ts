import { CityDTO } from "@apps/core/types/master/city.js";
import {
  CollectionCenter,
  PmsBranch,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel, IdValue } from "@repo/shared/types/global.js";

export interface BranchReq {
  id: number;
  name: string;
  vatNo: string;
  tinNo: string;
  businessSubline?: string;
  pharmacistName: string;
  countryCode?: string;
  phone: string;
  email: string;
  address: string;
  area?: string;
  pinCode?: number;
  countryId?: number;
  cityId?: number;
  stateId?: number;
  latitudeLongitude?: string;
  isMain?: boolean;
  categories?: number[] | null;
  isAutonomous?: boolean;
}

export interface BranchDTO
  extends Omit<
    PmsBranch,
    BaseModelAttrWoCancel | "countryId" | "cityId" | "stateId"
  > {
  location: CityDTO | null;
  collectionCenter: CollectionCenter | null;
  categoryMapping: IdValue[];
  isActive: boolean;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface BranchDropDown {
  id: number;
  name: string | null;
}

export type BranchResponce = Prisma.PmsBranchGetPayload<{
  include: {
    branchCategoryMap: true;
  };
}>;
