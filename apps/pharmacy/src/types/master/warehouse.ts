import { CityDTO } from "@apps/core/types/master/city.js";
import { CollectionCenter } from "@repo/db/generated/prisma/client";

export interface WarehouseReq {
  id: number;
  name: string;
  vatNo: string;
  tinNo: string;
  businessSubline?: string;
  contactPerson: string;
  countryCode: string | null;
  phone: string;
  email: string;
  countryId?: number;
  cityId?: number;
  stateId?: number;
  address: string;
  area?: string;
  pinCode: number;
  latitudeLongitude?: string;
  isMain?: boolean;
}
export interface WarehouseDTO {
  id: number;
  name: string;
  vatNo: string;
  tinNo: string;
  businessSubline: string | null;
  contactPerson: string;
  countryCode: string | null;
  phone: string;
  location: CityDTO | null;
  collectionCenter: CollectionCenter | null;
  email: string;
  address: string;
  area: string | null;
  pinCode: number | null;
  latitudeLongitude: string | null;
  isMain: boolean;
  isActive: boolean;
  createdBy: number | null;
  updatedBy: number | null;
}
