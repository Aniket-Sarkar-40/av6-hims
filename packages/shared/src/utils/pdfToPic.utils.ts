import { fromBuffer } from "pdf2pic";

export const createPdfThumbnail = async (pdfBuffer: Buffer) => {
  const converter = fromBuffer(pdfBuffer, {
    density: 100,
    format: "png",
    width: 300,
    quality: 100,
    preserveAspectRatio: true,
  });

  const result = await converter(1, {
    responseType: "buffer",
  });

  return result.buffer;
};
