import type { EventConfig, Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr, IdValue } from "@repo/shared/types/global.js";

export type CreateOrUpdateEventConfig = Omit<
  Prisma.EventConfigCreateManyInput,
  BaseModelAttr | "eventConfigKey"
>;

export type CreateOrUpdateEventConfigKey = Omit<
  Prisma.EventConfigKeyCreateManyInput,
  BaseModelAttr | "eventConfigId"
>;

export type UpsertEventConfigWithKeysInput = {
  eventConfig: CreateOrUpdateEventConfig;
  keys: CreateOrUpdateEventConfigKey[];

  masterData: {
    toCreate: Omit<CreateOrUpdateEventConfig, "id"> | null;
    toUpdate: CreateOrUpdateEventConfig | null;
  };
  toCreateKeys: Omit<CreateOrUpdateEventConfigKey, "id">[];
  toUpdateKeys: CreateOrUpdateEventConfigKey[];
  toDeleteKeyIds: number[];
};

export interface EventConfigDTO extends Omit<EventConfig, BaseModelAttr> {
  serviceEvent: IdValue | null;
  emailTemplate: IdValue | null;
  smsTemplate: IdValue | null;
  wpTemplate: IdValue | null;
  appNotificationTemplate: IdValue | null;
  webNotificationTemplate: IdValue | null;
}
