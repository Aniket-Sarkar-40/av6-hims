import { EXT_BASE_URL, EXT_UPLOAD_IMAGE } from "@repo/shared/config/index.js";
import { interceptor } from "@/config/axiosClient.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { FileInfo, UploadFilesResponse } from "@repo/shared/types/global.js";

export const externalService = {
  async validateCorporateAmount(
    clientId: number,
    amount: number,
  ): Promise<boolean> {
    logger.info("entering::validateCorporateAmount::service");
    const token = requestStorage.getStore()?.token || "";

    const client = interceptor(token);
    try {
      const { data, status } = await client.post<{
        status: boolean;
        allowed: boolean;
      }>(EXT_BASE_URL + "checkCreditlimit", {
        client_id: clientId,
        currentBillAmount: amount,
      });

      logger.info("exiting::validateCorporateAmount::service");
      if (status === 200 && status) {
        return data.allowed;
      } else {
        return false;
      }
    } catch (error) {
      logger.error("error::validateCorporateAmount::service", error);
      return false;
    }
  },

  async uploadInsuranceImagesExt(
    fileInfos: FileInfo[],
  ): Promise<UploadFilesResponse[] | null> {
    logger.info("entering::uploadInsuranceImagesExt::service");
    const user = requestStorage.getStore()?.user;
    const perms = requestStorage.getStore()?.perms;
    // const token = requestStorage.getStore()?.token;
    const shortToken = requestStorage.getStore()?.token;

    if (!user || !perms || !shortToken) {
      throw new ErrorHandler(
        401,
        "User not authenticated or permissions not found",
      );
    }

    const client = interceptor(shortToken);
    const results: UploadFilesResponse[] = [];
    for (const fileInfo of fileInfos) {
      const { data, status } = await client.post<UploadFilesResponse>(
        EXT_UPLOAD_IMAGE!,
        fileInfo,
      );
      if (status === 200 && data.success) {
        results.push(data);
      }
    }

    logger.info("exiting::uploadInsuranceImagesExt::service");
    return results.length ? results : null;
  },
};
