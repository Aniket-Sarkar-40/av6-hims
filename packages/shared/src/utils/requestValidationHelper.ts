/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "@/types/global.js";
import { AuthRequest } from "@/types/request.type.js";
import { NextFunction, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";
import { BaseResponse } from "./baseResponse.utils.js";
import { toRelativeImagePath } from "./helper.utils.js";
import { getFileAttrFromShortCode } from "./shortCode/index.js";

interface ValidationHandlerOptions {
  schema: Joi.Schema;
  type?: "NORMAL" | "FORMDATA" | "FORMDATA_WITH_MULTIPLE_DOCS";
  imgAttr?: string;
  multipleDocsAttr?: { key: string; path: string }[];
  allowUnknown?: boolean;
  path?: "body" | "query" | "params";
  jsonAttr?: string;
}

export const validationHandler = ({
  schema,
  type = "NORMAL",
  imgAttr,
  allowUnknown = false,
  path = "body",
  multipleDocsAttr,
  jsonAttr,
}: ValidationHandlerOptions) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (type === "FORMDATA" && imgAttr && req.fileUrl && path === "body") {
      req.body[imgAttr] = toRelativeImagePath(req.fileUrl);
    }

    if (
      type === "FORMDATA_WITH_MULTIPLE_DOCS" &&
      multipleDocsAttr?.length &&
      req.fileUrls &&
      path === "body"
    ) {
      multipleDocsAttr.forEach((doc) => {
        req.body[doc.key] =
          req.files && !Array.isArray(req.files)
            ? req.fileUrls?.[doc.path]
                ?.split(",")
                .map((x) => toRelativeImagePath(x))
                .join(",")
            : "";
      });
    }
    if (
      type === "FORMDATA" &&
      jsonAttr &&
      path === "body" &&
      req.body?.[jsonAttr]
    ) {
      try {
        req.body[jsonAttr] = JSON.parse(req.body[jsonAttr]);
      } catch {
        return res.status(400).json(
          new BaseResponse({
            success: false,
            errorCode: "PARAMETER_INVALID",
            errorMessage: `${jsonAttr} must be a valid JSON`,
          })
        );
      }
    }

    const { value, error } = schema.validate(req[path], {
      abortEarly: false,
      allowUnknown,
    });

    if (error) {
      const messages = (error.details as ValidationErrorItem[])
        .map((d) => d.message.replace(/['"]/g, ""))
        .join(", ");

      return res.status(400).json(
        new BaseResponse({
          success: false,
          errorCode: "PARAMETER_INVALID",
          errorMessage: messages,
          errors: error.details,
        })
      );
    }

    req[path] = value;

    next();
  };
};

export const uploadFileHandler = ({
  type = "FORMDATA",
  imgAttr,
  multipleDocsAttr,
  isCommonCreateUpdate = false,
  service,
}: {
  type?: "FORMDATA" | "FORMDATA_WITH_MULTIPLE_DOCS";
  imgAttr?: string;
  multipleDocsAttr?: { key: string; path: string }[];
  isCommonCreateUpdate: boolean;
  service: Service;
}) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (isCommonCreateUpdate) {
      imgAttr = getFileAttrFromShortCode(
        service,
        req.query.shortCode as string
      );
    }

    if (type === "FORMDATA" && imgAttr && req.fileUrl) {
      req.body[imgAttr] = toRelativeImagePath(req.fileUrl);
    }

    if (
      type === "FORMDATA_WITH_MULTIPLE_DOCS" &&
      multipleDocsAttr?.length &&
      req.fileUrls
    ) {
      multipleDocsAttr.forEach((doc) => {
        req.body[doc.key] =
          req.files && !Array.isArray(req.files)
            ? req.fileUrls?.[doc.path]
                ?.split(",")
                .map((x) => toRelativeImagePath(x))
                .join(",")
            : "";
      });
    }

    next();
  };
};

const toCamelKey = (key: string) => {
  if (key.includes("_")) {
    return key.replace(/_([a-zA-Z0-9])/g, (_, c) => String(c).toUpperCase());
  }

  return key.length ? key.charAt(0).toLowerCase() + key.slice(1) : key;
};

export const convertKeysToCamelDeep = (input: any): any => {
  if (Array.isArray(input)) return input.map(convertKeysToCamelDeep);
  if (input && typeof input === "object" && input.constructor === Object) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      out[toCamelKey(k)] = convertKeysToCamelDeep(v);
    }
    return out;
  }
  return input;
};
