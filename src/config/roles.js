const rights = Object.freeze({
  manageUsers: "manageUsers",
  getUsers: "getUsers",
});

const allRoles = {
  admin: [rights.getUsers, rights.manageUsers],
  user: [],
};

const roles = [];
Object.keys(allRoles).map((role) => {
  roles[role] = role;
  return role;
});

const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  rights,
  roles,
  roleRights,
};
