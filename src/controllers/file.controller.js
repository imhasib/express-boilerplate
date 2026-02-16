const httpStatus = require("http-status").status;
const catchAsync = require("../utils/asyncHandler");
const { fileService } = require("../services");
const ApiError = require("../utils/ApiError");

const uploadFile = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No file uploaded");
  }
  const file = await fileService.uploadFile(req.file, req.user.id);
  res.status(httpStatus.CREATED).send({
    id: file.id,
    filename: file.filename,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    link: `/v1/file/${file.id}`,
  });
});

const getFile = catchAsync(async (req, res) => {
  const file = await fileService.getFileById(req.params.fileId);
  res.set("Content-Type", file.mimeType);
  res.set("Content-Disposition", `inline; filename="${file.originalName}"`);
  res.send(file.data);
});

module.exports = {
  uploadFile,
  getFile,
};
