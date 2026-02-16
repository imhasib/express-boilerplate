const httpStatus = require("http-status").status;
const sharp = require("sharp");
const { File } = require("../models");
const ApiError = require("../utils/ApiError");

const MAX_FILE_SIZE = 100 * 1024; // 100KB

const isImage = (mimeType) => {
  return mimeType.startsWith("image/");
};

const compressImage = async (buffer, mimeType) => {
  let sharpInstance = sharp(buffer);
  const metadata = await sharpInstance.metadata();

  let quality = 80;
  let result = buffer;

  // Try progressive quality reduction until under 100KB
  while (result.length > MAX_FILE_SIZE && quality >= 10) {
    if (mimeType === "image/png") {
      result = await sharp(buffer)
        .resize({
          width: Math.min(metadata.width, 800),
          withoutEnlargement: true,
        })
        .png({ quality, compressionLevel: 9 })
        .toBuffer();
    } else if (mimeType === "image/webp") {
      result = await sharp(buffer)
        .resize({
          width: Math.min(metadata.width, 800),
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer();
    } else {
      // Default to JPEG for other image types
      result = await sharp(buffer)
        .resize({
          width: Math.min(metadata.width, 800),
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toBuffer();
    }
    quality -= 10;
  }

  // If still too large, resize more aggressively
  if (result.length > MAX_FILE_SIZE) {
    result = await sharp(buffer)
      .resize({ width: 400, withoutEnlargement: true })
      .jpeg({ quality: 60 })
      .toBuffer();
  }

  return result;
};

const uploadFile = async (file, userId) => {
  let data = file.buffer;
  let mimeType = file.mimetype;
  let size = file.size;

  // Compress if it's an image
  if (isImage(mimeType)) {
    data = await compressImage(file.buffer, mimeType);
    size = data.length;
    // Update mimeType if converted to JPEG
    if (mimeType !== "image/png" && mimeType !== "image/webp") {
      mimeType = "image/jpeg";
    }
  }

  const fileDoc = await File.create({
    filename: `${Date.now()}-${file.originalname}`,
    originalName: file.originalname,
    mimeType,
    size,
    data,
    uploadedBy: userId,
  });

  return fileDoc;
};

const getFileById = async (fileId) => {
  const file = await File.findById(fileId);
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, "File not found");
  }
  return file;
};

module.exports = {
  uploadFile,
  getFileById,
};
