const { generateStructuredCodeReview } = require("./openai.service");
const {
  buildCacheKey,
  getCachedReview,
  setCachedReview,
} = require("./review-cache.service");

async function reviewCode(payload) {
  const cacheKey = buildCacheKey(payload);
  const cached = getCachedReview(cacheKey);

  if (cached) {
    return {
      review: cached,
      cached: true,
    };
  }

  const review = await generateStructuredCodeReview(payload);
  setCachedReview(cacheKey, review);

  return {
    review,
    cached: false,
  };
}

module.exports = {
  reviewCode,
};