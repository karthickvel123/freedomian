import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { query } from "../database/db.js";
import { generateToken, authenticateToken } from "../middleware/auth.js";
import { isDisposableEmail } from "../middleware/abusePrevention.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check disposable email
    if (isDisposableEmail(cleanEmail)) {
      return res.status(400).json({
        error: "Temporary or disposable email addresses are not permitted. Please use a permanent email to prevent platform abuse."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    // Check if email already exists
    const existing = await query("SELECT id FROM users WHERE email = ?", [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = crypto.randomUUID();

    await query(
      "INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, 'user', 'active')",
      [userId, name.trim(), cleanEmail, passwordHash]
    );

    const userObj = { id: userId, name: name.trim(), email: cleanEmail, role: "user" };
    const token = generateToken(userObj);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax"
    });

    res.status(201).json({
      message: "Registration successful. Welcome to FreeDomain!",
      user: userObj,
      token
    });
  } catch (err) {
    console.error("[Auth] Registration error:", err);
    res.status(500).json({ error: "Internal server error during registration." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = await query("SELECT * FROM users WHERE email = ?", [cleanEmail]);

    if (!users || users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = users[0];
    if (user.status !== "active") {
      return res.status(403).json({ error: "This account has been deactivated." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const userObj = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = generateToken(userObj);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax"
    });

    res.json({
      message: "Login successful.",
      user: userObj,
      token
    });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    res.status(500).json({ error: "Internal server error during login." });
  }
});

router.get("/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully." });
});

export default router;
