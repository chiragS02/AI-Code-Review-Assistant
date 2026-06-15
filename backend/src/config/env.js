const dotenv = require("dotenv");

dotenv.config();

const required = ["GEMINI_API_KEY"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8080),
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  geminiAllowInsecureTls: process.env.GEMINI_ALLOW_INSECURE_TLS === "true",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  reviewRateLimitWindowMs: Number(process.env.REVIEW_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  reviewRateLimitMax: Number(process.env.REVIEW_RATE_LIMIT_MAX || 120),
  reviewCacheTtlMs: Number(process.env.REVIEW_CACHE_TTL_MS || 5 * 60 * 1000),
};
