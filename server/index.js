import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { initDb, getDbType } from "./database/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/auth.js";
import domainRoutes from "./routes/domains.js";
import subsidyRoutes from "./routes/subsidy.js";
import userDomainRoutes from "./routes/userDomains.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiting for API
app.use("/api", apiLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    platform: "FreeDomain",
    database: getDbType(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/subsidy", subsidyRoutes);
app.use("/api/user/domains", userDomainRoutes);
app.use("/api/admin", adminRoutes);

// Production Frontend Static File Serving
const clientDist = path.resolve(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  console.log(`[Production] Serving static client build from ${clientDist}`);
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(err.status || 500).json({
    error: err.message || "An unexpected internal server error occurred."
  });
});

async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 FreeDomain API Server is running on port ${PORT}`);
      console.log(`📊 Mode: Subsidized Domain Grant Engine (No Ads)`);
      console.log(`🗄️ Database Backend: ${getDbType().toUpperCase()}`);
      console.log(`🌐 Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error("Fatal: Failed to start FreeDomain server:", err);
    process.exit(1);
  }
}

startServer();