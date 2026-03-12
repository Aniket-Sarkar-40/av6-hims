// hetznerS3.ts
import { S3Client } from "@aws-sdk/client-s3";
import {
  HETZNER_ACCESS_KEY,
  HETZNER_ENDPOINT,
  HETZNER_REGION,
  HETZNER_SECRET_KEY,
} from "./index.js";

export const hetznerS3 = new S3Client({
  region: HETZNER_REGION,
  endpoint: HETZNER_ENDPOINT,
  credentials: {
    accessKeyId: HETZNER_ACCESS_KEY!,
    secretAccessKey: HETZNER_SECRET_KEY!,
  },
  forcePathStyle: true,
});
