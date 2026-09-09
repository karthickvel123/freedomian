import rateLimit from "express-rate-limit";

// General API rate limiter: 120 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP. Please try again after 15 minutes."
  }
});

// Domain availability search rate limiter: 30 requests per minute per IP
export const domainSearchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Domain lookup limit reached. Please wait a minute before making more queries."
  }
});

// Subsidy application limiter: 5 applications per 24 hours per IP
export const subsidyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Subsidy application quota reached for today. Please try again tomorrow."
  }
});
