// import { envMode } from "@/config";
// import { AuthRequest } from "@/middlewares/auth.middleware";
// import { TryCatch } from "@/middlewares/error.middleware";
// import { authService } from "@/services/auth.service";
// import { BaseResponse } from "@/utils/baseResponse.utils";
// import ErrorHandler from "@/utils/errorHandler.utils";
// import { processAndRecreateJWT } from "@/utils/helper.utils";
// import { logger } from "@/utils/logger.utils";
// import { addToCacheForLogin, deleteCacheLogin } from "@/utils/redisHelper.utils";
// import { generateSuccessMessage } from "@/utils/responseMessage.utils";
// import { Request, Response } from "express";

// const SEVENTEEN_HOURS = 1000 /*ms*/ * 60 /*sec*/ * 60 /*min*/ * 17; /*hrs*/

export const LOGIN_KEY = `av6:login`;

// export const login = TryCatch(async (req: Request, res: Response) => {
//   logger.info("entering::login::controller");
//   const { username, password } = req.body;
//   const { token, shortToken, uuid } = await authService.login({
//     username,
//     password,
//   });

//   const rolePermission = processAndRecreateJWT(token);
//   await addToCacheForLogin(
//     LOGIN_KEY,
//     uuid,
//     {
//       roles: rolePermission.roles,
//       permissions: rolePermission.permissions,
//       // token: token,
//       // shortToken: shortToken,
//     },
//     SEVENTEEN_HOURS / 1000
//   );

//   res.cookie("access-token-av6", shortToken, {
//     httpOnly: true,
//     secure: envMode === "PRODUCTION",
//     sameSite: "lax",
//     maxAge: SEVENTEEN_HOURS,
//     path: "/",
//     domain: envMode === "PRODUCTION" ? ".av6.co.in" : undefined,
//   });

//   logger.info("exiting::login::controller");
//   return res.status(200).json(
//     new BaseResponse(
//       {
//         success: true,
//         message: "Logged in successfully",
//       },
//       // { token }
//       envMode.toUpperCase() === "TEST" ? { token: shortToken } : { token }
//     )
//   );
// });

// export const logout = TryCatch(async (req: AuthRequest, res: Response) => {
//   logger.info("entering::logout::controller");

//   const decodedToken = authService.decodeToken(req.token as string);

//   if (!decodedToken || !decodedToken.uuid) {
//     throw new ErrorHandler(401, "Invalid token");
//   }

//   // Clear the cache for the user
//   await deleteCacheLogin(LOGIN_KEY, decodedToken.uuid);

//   res.clearCookie("access-token-av6", {
//     httpOnly: true,
//     secure: envMode === "PRODUCTION",
//     sameSite: "lax",
//     path: "/", // must match the path you originally set
//     domain: envMode === "PRODUCTION" ? ".av6.co.in" : undefined,
//   });
//   logger.info("exiting::logout::controller");
//   return res.status(200).json(
//     new BaseResponse({
//       success: true,
//       message: "Logged out successfully",
//     })
//   );
// });
// export const getUserDetails = TryCatch(async (req: AuthRequest, res: Response) => {
//   logger.info("entering::getUserDetails::controller");
//   if (!req.token) throw new ErrorHandler(401, "Missing Token");
//   const getDetailsUser = await authService.userDetails();
//   logger.info("exiting::getUserDetails::controller");
//   return res.status(200).json(
//     new BaseResponse(
//       {
//         success: true,
//         message: generateSuccessMessage("FETCHED", "User Details"),
//       },
//       getDetailsUser
//     )
//   );
// });

// export const changeRole = TryCatch(async (req: AuthRequest, res: Response) => {
//   logger.info("entering::changeRole::controller");
//   const { roleId, ccId } = req.body;
//   if (!req.token) throw new ErrorHandler(401, "Missing Token");

//   const decodedToken = authService.decodeToken(req.token as string);

//   if (!decodedToken || !decodedToken.uuid) {
//     throw new ErrorHandler(401, "Invalid token");
//   }

//   const { token, shortToken, uuid } = await authService.changeRole(roleId, ccId);

//   const rolePermission = processAndRecreateJWT(token);
//   await deleteCacheLogin(LOGIN_KEY, decodedToken.uuid);

//   await addToCacheForLogin(
//     LOGIN_KEY,
//     uuid,
//     {
//       roles: rolePermission.roles,
//       permissions: rolePermission.permissions,
//     },
//     SEVENTEEN_HOURS / 1000
//   );

//   res.cookie("access-token-av6", shortToken, {
//     httpOnly: true,
//     secure: envMode === "PRODUCTION",
//     sameSite: "lax",
//     maxAge: SEVENTEEN_HOURS,
//     path: "/",
//     domain: envMode === "PRODUCTION" ? ".av6.co.in" : undefined,
//   });

//   logger.info("exiting::changeRole::controller");
//   return res.status(200).json(
//     new BaseResponse(
//       {
//         success: true,
//         message: "Role changed successfully",
//       },
//       envMode.toUpperCase() === "TEST" ? { token: shortToken } : { token }
//     )
//   );
// });

// export const getRoleByCcId = TryCatch(async (req: AuthRequest, res: Response) => {
//   logger.info("entering::getRoleByCcId::controller");
//   if (!req.token) throw new ErrorHandler(401, "Missing Token");
//   const { ccId } = req.body as { ccId: number };

//   const getDetailsUser = await authService.getRoleByCcId(Number(ccId));
//   logger.info("exiting::getRoleByCcId::controller");
//   return res.status(200).json(
//     new BaseResponse(
//       {
//         success: true,
//         message: generateSuccessMessage("FETCHED", "Role By Cc Id"),
//       },
//       getDetailsUser
//     )
//   );
// });
