const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const fileRoute = require("./file.route");
const swaggerDefinition = require("../../docs/swaggerDef");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/file",
    route: fileRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// Swagger documentation
const swaggerSpecs = swaggerJsdoc({
  swaggerDefinition,
  apis: ["src/docs/*.yml", "src/routes/v1/*.js"],
});

router.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, { explorer: true }),
);
router.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpecs);
});

module.exports = router;
