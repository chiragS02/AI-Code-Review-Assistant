const { ZodError } = require("zod");
const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: err.issues,
    });
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? "Internal server error" : err.message;

  if (status >= 500) {
    logger.error(
      `Unhandled error on ${req.method} ${req.originalUrl}`,
      err.message,
      logger.isProduction ? "" : err.stack || "",
    );
  }

  return res.status(status).json({
    success: false,
    error: message,
  });
}

module.exports = errorHandler;
