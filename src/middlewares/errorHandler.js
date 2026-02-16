const httpStatus = require("http-status").status;
const logger = require("../config/logger");

const errorHandler = (err, req, res, _next) => {
  let { statusCode, message } = err;

  if (!statusCode) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === "development") {
    logger.error(err.message);
  }

  res.status(statusCode).send(response);
};

module.exports = errorHandler;
