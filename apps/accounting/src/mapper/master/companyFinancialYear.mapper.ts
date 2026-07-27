import {
  CompanyFinancialYearDTO,
  CompanyFinancialYearResponse,
} from "@/types/master/companyFinancialYear.js";
import { customOmit, toIdValue } from "av6-utils";

export const toCompanyFinancialYearDto = async (
  input: CompanyFinancialYearResponse[],
): Promise<CompanyFinancialYearDTO[]> => {
  const response: CompanyFinancialYearDTO[] = input.map(
    (companyFinancialYear) => {
      return {
        ...customOmit(companyFinancialYear, [
          "company",
          "companyId",
          "createdAt",
          "createdBy",
          "updatedAt",
          "updatedBy",
          "deletedAt",
          "deletedBy",
          "isActive",
        ]).rest,
        company: toIdValue(companyFinancialYear.company, "name"),
      };
    },
  );
  return response;
};
