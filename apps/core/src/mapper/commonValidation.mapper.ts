import { SingleValidationMapping } from "av6-core";

export const commonCreateUpdateValidationMapping: Record<
  string,
  SingleValidationMapping
> = {
  // [SHORT_CODE.STATE]: {
  //   create: (data: unknown) => createStateServiceValidation(data as CreateOrUpdateState),
  //   update: (data: unknown) => updateIdStateServiceValidation(data as CreateOrUpdateState),
  // },
};
