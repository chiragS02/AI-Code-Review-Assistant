const express = require("express");
const { reviewCode } = require("../controllers/review.controller");
const { reviewLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/review", reviewLimiter, reviewCode);
router.post("/review-code", reviewLimiter, reviewCode);

module.exports = router;
