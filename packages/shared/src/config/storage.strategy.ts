import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { hetznerS3 } from "@/config/hetznerS3.config.js";
import {
  HETZNER_BUCKET,
  HETZNER_ENDPOINT,
  envMode,
} from "@repo/shared/config/index.js";
import "multer"; // ensure Multer augments global Express namespace

export async function uploadFileByEnv(
  folder: string,
  file: Express.Multer.File,
): Promise<{
  url: string;
  key?: string;
}> {
  const ext = path.extname(file.originalname);
  const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;

  // 🟢 DEVELOPMENT → Store locally
  if (envMode.toUpperCase() === "DEVELOPMENT") {
    const baseFolder = path.join(process.cwd(), "uploads");
    const dest = path.join(baseFolder, folder);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const absolutePath = path.join(dest, filename);

    await fs.promises.writeFile(absolutePath, file.buffer);

    const relativePath = path.relative(process.cwd(), absolutePath);

    return {
      url: relativePath,
    };
  }

  // 🔵 PRODUCTION → Upload to Hetzner
  const key = `AV6/${folder}/${filename}`;

  await hetznerS3.send(
    new PutObjectCommand({
      Bucket: HETZNER_BUCKET!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return {
    url: `${HETZNER_ENDPOINT}/${HETZNER_BUCKET}/${key}`,
    key,
  };
}
