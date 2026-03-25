import { countryService } from "@/services/master/country.service.js";
import { CountryCodeDTO } from "@/types/master/countryCode.js";
import { CountryCode } from "@repo/db/generated/prisma/client";

export const toCountryCodeDTO = async (
  countryCode: CountryCode,
): Promise<CountryCodeDTO> => {
  const country = await countryService.getCountryById(
    countryCode.countryId,
    true,
  );
  return {
    id: countryCode.id,
    countryCode: countryCode.countryCode,
    country: country,
    createdBy: countryCode.createdBy,
    createdAt: countryCode.createdAt,
    updatedBy: countryCode.updatedBy,
    updatedAt: countryCode.updatedAt,
  };
};
