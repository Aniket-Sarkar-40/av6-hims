import { Request } from "express";
import "multer";

export interface AuthRequest extends Request {
  perms?: Set<string>;
  user?: {
    userName?: string;
    email?: string;
    contactNo?: string;
  };
  token?: string;
  traceId?: string;
  uploadedFile?: {
    key: string;
    bucket: string;
  };
  uploadedFiles?: {
    key: string;
    bucket: string;
  }[];
  fileUrls?: Record<string, string>;
  fileUrl?: string;
}
