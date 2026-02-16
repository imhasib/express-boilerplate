const httpStatus = require("http-status").status;
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/asyncHandler");
const { userService } = require("../services");

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "role"]);
  if (filter.name) {
    filter.name = { $regex: new RegExp(filter.name, "i") }; // work like %someName% in SQL
  }
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const searchUser = catchAsync(async (req, res) => {
  const searchExp = { $regex: new RegExp(req.query.searchText, "i") }; // work like %someName% in SQL

  const filter = { $or: [{ name: searchExp }, { email: searchExp }] };

  const options = {
    sortBy: "email:asc",
    limit: 3,
    page: 1,
  };
  const data = await userService.queryUsers(filter, options);
  const result = data.results.map((document) => {
    return {
      id: document.id,
      email: document.email,
      mobile: document.mobile,
      name: document.name,
    };
  });
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const countUsers = catchAsync(async (req, res) => {
  const result = await userService.countUsersByRole();

  result[0].role = result[0]._id;
  result[1].role = result[1]._id;

  delete result[0]._id;
  delete result[1]._id;

  res.send(result);
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  searchUser,
  countUsers,
};
