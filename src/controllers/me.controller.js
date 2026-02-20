const catchAsync = require("../utils/asyncHandler");
const { userService } = require("../services");

const getMe = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res.send(user);
});

const updateMe = catchAsync(async (req, res) => {
  const { name, mobile } = req.body;
  const updateBody = {};
  if (name !== undefined) updateBody.name = name;
  if (mobile !== undefined) updateBody.mobile = mobile;

  const user = await userService.updateUserById(req.user.id, updateBody);
  res.send(user);
});

module.exports = {
  getMe,
  updateMe,
};
