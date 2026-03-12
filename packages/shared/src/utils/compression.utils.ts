import sharp from "sharp";

const LARGE_FILE_THRESHOLD = 2 * 1024 * 1024; // 2MB
const MAX_WIDTH = 2000;

export async function optimizeImageSmart(
  buffer: Buffer,
  mimetype: string
): Promise<Buffer> {
  const image = sharp(buffer).rotate(); // auto-rotate based on EXIF

  const metadata = await image.metadata();
  const isLarge = buffer.length > LARGE_FILE_THRESHOLD;

  if (isLarge && metadata.width && metadata.width > MAX_WIDTH) {
    image.resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
    });
  }

  if (mimetype === "image/jpeg") {
    return image
      .jpeg({
        quality: isLarge ? 85 : 100,
        mozjpeg: true,
      })
      .toBuffer();
  }

  if (mimetype === "image/png") {
    return image
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toBuffer();
  }

  if (mimetype === "image/webp") {
    return image
      .webp({
        quality: isLarge ? 85 : 100,
        lossless: !isLarge,
      })
      .toBuffer();
  }

  return buffer;
}
