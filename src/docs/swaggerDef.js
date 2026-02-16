const { version } = require("../../package.json");
const config = require("../config/config");

const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "express-boilerplate API documentation",
    version,
    license: {
      name: "MIT",
      url: "",
    },
  },
  servers: [
    {
      url: config.server.baseUrl,
    },
  ],
};

module.exports = swaggerDef;
