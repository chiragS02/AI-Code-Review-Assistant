const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const reviewLimiter = rateLimit({
  windowMs: env.reviewRateLimitWindowMs,
  limit: env.reviewRateLimitMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many review requests. Please wait before retrying.",
  },
});

module.exports = {
  reviewLimiter,
};