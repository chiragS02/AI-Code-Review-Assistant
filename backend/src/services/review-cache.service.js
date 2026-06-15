const crypto = require("crypto");
const env = require("../config/env");

const reviewCache = new Map();

function buildCacheKey({ language, context, code }) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ language, context, code }))
    .digest("hex");
}

function getCachedReview(cacheKey) {
  const entry = reviewCache.get(cacheKey);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    reviewCache.delete(cacheKey);
    return null;
  }

  return entry.value;
}

function setCachedReview(cacheKey, value) {
  reviewCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + env.reviewCacheTtlMs,
  });
}

module.exports = {
  buildCacheKey,
  getCachedReview,
  setCachedReview,
};