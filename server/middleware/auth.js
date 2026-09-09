import jwt from "jsonwebtoken";
import { query } from "../database/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "freedomain-super-secure-jwt-secret-2026";

export async function authenticateToken(req, res, next) {
  let token = null;
  const authHeader = req.headers["authorization"];

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await query("SELECT id, name, email, role, status FROM users WHERE id = ?", [decoded.userId]);
    if (!users || users.length === 0) {
      return res.status(401).json({ error: "Invalid session. User not found." });
    }

    const user = users[0];
    if (user.status !== "active") {
      return res.status(403).json({ error: "Your account has been suspended." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Session expired or invalid. Please log in again." });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Administrative privileges required." });
  }
  next();
}

export function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
