const { z } = require("zod");
const { reviewCode: reviewCodeService } = require("../services/review.service");
const logger = require("../utils/logger");

const reviewSchema = z.object({
  language: z.string().min(1).max(40),
  code: z.string().min(1).max(20000),
  context: z.string().max(2000).optional().default(""),
});

async function reviewCode(req, res, next) {
  try {
    const payload = reviewSchema.parse(req.body);
    const result = await reviewCodeService(payload);

    logger.info(
      `Review completed language=${payload.language} chars=${payload.code.length} cached=${result.cached}`,
    );

    return res.status(200).json({
      success: true,
      data: {
        review: result.review,
        meta: {
          cached: result.cached,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  reviewCode,
};
