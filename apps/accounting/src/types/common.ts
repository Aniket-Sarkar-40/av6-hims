import { RedisResource } from "@/config/cache.config.js";
import { Prisma } from "@repo/db/generated/prisma/client";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";

export interface BaseCoreResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorMessage?: string;
}
export interface CollectionCenterApiRow {
  id: number;
  name: string;
}

export interface BaseModel {
  isActive: boolean;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
  canceledAt?: Date | null;
  canceledBy?: number | null;
  deletedAt?: Date | null;
  deletedBy?: number | null;
}

export type BaseModelAttr =
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "canceledBy"
  | "canceledAt"
  | "createdAt"
  | "updatedAt"
  | "deletedAt";

export type BaseModelAttrWoCancel =
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt";

export type BaseModelAttrWoCancelAndCreated =
  | "isActive"
  | "updatedBy"
  | "deletedBy"
  | "updatedAt"
  | "deletedAt";

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
