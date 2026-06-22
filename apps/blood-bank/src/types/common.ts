import { RedisResource } from "@/config/cache.config.js";
import { HospitalDTOLocation } from "@/types/master/hospital.js";
import {
  BloodBankDynamicShortCode,
  CalculationMethod,
  DiscMethod,
  Prisma,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/bloodBank.shortCode.utils.js";

export interface LockUnlockParams {
  shortCode: string;
  id: number;
}

export interface LockUnlockRequestRepository extends LockUnlockParams {
  shortCodeData: BloodBankDynamicShortCode;
}

export interface ToggleActive {
  id: number;
  action: "ACTIVE" | "IN_ACTIVE";
}

export interface CalculationInput {
  amount: number;
  discountMethod: DiscMethod;
  discount: number;
  // taxMethod: TAX_METHOD;
  tax: number;
  calculationMethod: CalculationMethod;
  roundFormat: RoundFormat;
  precision: number;
}
export interface CalculationRes {
  netDiscount: number;
  netTax: number;
  totalAmount: number;
}

export type ModelName = Prisma.ModelName;

export type FindUniqueArgs<M extends ModelName> =
  Prisma.TypeMap["model"][M]["operations"]["findUnique"]["args"];

export type WhereUnique<M extends ModelName> = FindFirstArgs<M>["where"];

export type FindUniqueResult<M extends ModelName> =
  Prisma.TypeMap["model"][M]["operations"]["findUnique"]["result"];

export type FindFirstArgs<M extends ModelName> =
  Prisma.TypeMap["model"][M]["operations"]["findFirst"]["args"];

export type FindFirstResult<M extends ModelName> =
  Prisma.TypeMap["model"][M]["operations"]["findFirst"]["result"];

export type FullRow<M extends ModelName> =
  Prisma.TypeMap["model"][M]["payload"]["scalars"];

export interface CommonGetByIdInput {
  id: number;
  canNullReturnable: boolean;
  cacheCode: keyof typeof RedisResource;
  shortCode: keyof typeof SHORT_CODE;
  modelName: ModelName;
  useActiveFlag?: boolean;
}

export type CommonGetAllInput = Omit<CommonGetByIdInput, "id">;

export interface CommonFindUniqueInput<M extends ModelName> {
  model: M;
  where: WhereUnique<M>;
  useActiveFlag?: boolean;
  args?: Omit<FindUniqueArgs<M>, "where">;
}

export type FindManyArgs<M extends ModelName> =
  Prisma.TypeMap["model"][M]["operations"]["findMany"]["args"];

export type WhereMany<M extends ModelName> = FindManyArgs<M>["where"];

export type FindManyResult<M extends ModelName> =
  Prisma.TypeMap["model"][M]["operations"]["findMany"]["result"]; // (computed result)[]

export interface CommonFindManyInput<M extends ModelName> {
  model: M;
  useActiveFlag?: boolean;
  where?: WhereMany<M>;
  args?: Omit<FindManyArgs<M>, "where">; // select/include/orderBy/skip/take/distinct...
}

type CCType = "Hospital";

export interface CollectionCenterResolved {
  id: number;
  name: string;
  type: CCType;
  bloodBank: HospitalDTOLocation;
  //branch: BranchDTOLocation | null;
  //warehouse: WarehouseDTOLocation | null;
}

export interface CollectionCenterApiRow {
  id: number;
  name: string;
  type?: CCType; // optional from API
}

export interface PaginatedResponse<T> {
  totalRecords: number;
  currentPageNumber: number;
  lastPageNumber: number;
  pageSize: number;
  data: T[];
}

export type CommonFieldScalarValue =
  | string
  | number
  | boolean
  | null
  | Date
  | Record<string, unknown>
  | unknown[];

export interface CommonActiveInactiveParams {
  shortCode: string;
  id: number;
  field: string;
  value: CommonFieldScalarValue;
}

export interface CommonActiveInactiveValidated
  extends CommonActiveInactiveParams {
  normalizedValue: CommonFieldScalarValue | Date;
}

export interface CommonActiveInactiveRequestRepository
  extends CommonActiveInactiveParams {
  shortCodeData: BloodBankDynamicShortCode;
}
