import { CityDTO } from "@apps/core/types/master/city.js";
import { CollectionCenter, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

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

export interface BranchDTO {
  id: number;
  name: string;
  vatNo: string;
  tinNo: string;
  businessSubline: string | null;
  pharmacistName: string;
  countryCode: string | null;
  phone: string;
  email: string;
  address: string;
  area: string | null;
  location: CityDTO | null;
  latitudeLongitude: string | null;
  collectionCenter: CollectionCenter | null;
  pinCode: number | null;
  isMain: boolean;
  isActive: boolean;
  createdBy: number | null;
  updatedBy: number | null;
  categoryMapping: IdValue[];
  isAutonomous: boolean;
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
