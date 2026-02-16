const mongoSanitize = require("mongo-sanitize");

const sanitize = (req, res, next) => {
  // Sanitize body (mutable)
  if (req.body) {
    req.body = mongoSanitize(req.body);
  }
  // For query and params, sanitize values in-place since they may be read-only in Express 5
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      req.query[key] = mongoSanitize(req.query[key]);
    });
  }
  if (req.params) {
    Object.keys(req.params).forEach((key) => {
      req.params[key] = mongoSanitize(req.params[key]);
    });
  }
  next();
};

module.exports = sanitize;
