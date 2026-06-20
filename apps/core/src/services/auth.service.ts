import {
  EXT_CHANGE_ROLE_URL,
  EXT_LOGIN_URL,
  EXT_ROLE_BY_CC_URL,
  EXT_USER_DETAILS_URL,
  EXT_UPLOAD_IMAGE,
} from "@repo/shared/config/index.js";
import { axiosClient, interceptor } from "@repo/shared/config/axiosClient.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import {
  ApiLoginResponse,
  ApiRoleResponse,
  ChangeRoleExtWire,
  ExternalUserRes,
  FileInfo,
  JwtPayload,
  LoginPayload,
  LoginResponse,
  UploadFilesResponse,
  UserResponse,
} from "@/types/auth.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { AxiosError } from "axios";
import { logger } from "@repo/platform/logging/logger.js";
import { decodeToken, encodeToken } from "@repo/shared/utils/auth.utils.js";
import { moduleConfigService } from "@/services/moduleConfig.service.js";

export const authService = {
  async loginExternal(payload: LoginPayload): Promise<ApiLoginResponse> {
    logger.info("entering::loginExternal::service");
    const { data } = await axiosClient.post<ApiLoginResponse>(
      EXT_LOGIN_URL!,
      payload
    );
    logger.info("exiting::loginExternal::service");
    return {
      token: data.token ?? "",
      shortToken: data.shortToken ?? "",
      uuid: data.uuid ?? "",
    };
  },

  async login(credentials: LoginPayload): Promise<LoginResponse> {
    logger.info("entering::login::service");
    try {
      let { token, shortToken, uuid } = await this.loginExternal(credentials);

      if (!token || !shortToken || !uuid) {
        throw new ErrorHandler(401, "Invalid credentials: No token received");
      }

      const decodedToken = decodeToken(token);
      const decodedShortToken = decodeToken(shortToken);

      const activeModules = (
        await moduleConfigService.getEnabledModulesFromDb()
      ).map((item) => item.module);

      decodedToken.modules = activeModules;
      decodedShortToken.modules = activeModules;

      token = encodeToken(decodedToken);
      shortToken = encodeToken(decodedShortToken);

      logger.info("exiting::login::service");
      return { token, shortToken, uuid };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message =
          error.response.status === 404
            ? "Invalid credentials please try again."
            : error.response.statusText || "An error occurred during login.";
        throw new ErrorHandler(error.response.status, message);
      }

      throw new ErrorHandler(500, "An unexpected error occurred during login.");
    }
  },

  async userDetails(): Promise<UserResponse> {
    logger.info("entering::userDetails::service");
    const user = requestStorage.getStore()?.user;
    const permission = requestStorage.getStore()?.perms;
    const token = requestStorage.getStore()?.token;

    if (!user || !permission || !token) {
      throw new ErrorHandler(
        401,
        "User not authenticated or permissions not found"
      );
    }
    const client = interceptor(token);
    const { data } = await client.post<ExternalUserRes>(EXT_USER_DETAILS_URL!, {
      userid: user?.id,
    });

    const currentRoleName = Object.keys(user?.role || {})[0];
    const currentRoleId = Object.values(user?.role || {})[0];

    const res: UserResponse = {
      user: data.data,
      permissions: Array.isArray(permission)
        ? permission
        : Array.from(permission ?? []),
      roles: user?.roles || [],
      currentRole: { id: currentRoleId ?? "", name: currentRoleName ?? "" },
    };
    logger.info("exiting::userDetails::service");
    return res;
  },

  async changeRoleEXT(
    role: string,
    ccId: string,
    shortToken: string
  ): Promise<ApiLoginResponse> {
    logger.info("entering::changeRoleEXT::service");
    const client = interceptor(shortToken);
    const { data, status } = await client.post<ChangeRoleExtWire>(
      EXT_CHANGE_ROLE_URL!,
      {
        roleId: role,
        ccId: ccId,
      }
    );

    logger.info("exiting::changeRoleEXT::service");
    if (status === 200 && status) {
      return {
        token: data.token ?? "",
        shortToken: data.shortToken ?? "",
        uuid: data.uuid ?? "",
      };
    }
    throw new ErrorHandler(403, "Role change failed");
  },

  async changeRole(role: string, ccId: string): Promise<LoginResponse> {
    logger.info("entering::changeRole::service");
    try {
      const prevToken = requestStorage.getStore()?.token;
      if (!prevToken) {
        throw new ErrorHandler(401, "User not authenticated");
      }
      const { token, shortToken, uuid } = await this.changeRoleEXT(
        role,
        ccId,
        prevToken
      );
      logger.info("exiting::changeRole::service");
      if (!token || !shortToken || !uuid)
        throw new ErrorHandler(
          404,
          "You are not authorized to change this role"
        );
      return { token, shortToken, uuid };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const message =
          error.response.status === 404
            ? "Invalid credentials please try again."
            : error.response.statusText || "An error occurred during login.";
        throw new ErrorHandler(error.response.status, message);
      }

      throw new ErrorHandler(500, "An unexpected error occurred during login.");
    }
  },

  async getRoleByCcId(ccId: number) {
    logger.info("entering::getRoleByCcId::service");
    const user = requestStorage.getStore()?.user;
    const permission = requestStorage.getStore()?.perms;
    const shortToken = requestStorage.getStore()?.token;

    if (!user || !permission || !shortToken) {
      throw new ErrorHandler(
        401,
        "User not authenticated or permissions not found"
      );
    }
    const client = interceptor(shortToken);
    const data = await client.post<ApiRoleResponse>(
      `${EXT_ROLE_BY_CC_URL}/${ccId}`
    );
    const role = data.data.role;
    logger.info("exiting::getRoleByCcId::service");
    return {
      role: role,
    };
  },

  async uploadInsuranceImagesExt(
    fileInfos: FileInfo[]
  ): Promise<UploadFilesResponse[] | null> {
    logger.info("entering::uploadInsuranceImagesExt::service");
    const user = requestStorage.getStore()?.user;
    const perms = requestStorage.getStore()?.perms;
    // const token = requestStorage.getStore()?.token;
    const shortToken = requestStorage.getStore()?.token;

    if (!user || !perms || !shortToken) {
      throw new ErrorHandler(
        401,
        "User not authenticated or permissions not found"
      );
    }

    const client = interceptor(shortToken);
    const results: UploadFilesResponse[] = [];
    for (const fileInfo of fileInfos) {
      const { data, status } = await client.post<UploadFilesResponse>(
        EXT_UPLOAD_IMAGE!,
        fileInfo
      );
      if (status === 200 && data.success) {
        results.push(data);
      }
    }

    logger.info("exiting::uploadInsuranceImagesExt::service");
    return results.length ? results : null;
  },
};
