import express from "express";
import crypto from "crypto";
import { query } from "../database/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { subsidyLimiter } from "../middleware/rateLimiter.js";
import { validateDomainSyntax, enforceUserSubsidyQuota } from "../middleware/abusePrevention.js";
import { registrarService } from "../services/registrar/RegistrarService.js";

const router = express.Router();

router.post("/apply", authenticateToken, subsidyLimiter, enforceUserSubsidyQuota, async (req, res) => {
  try {
    const {
      domainName,
      tld,
      purposeCategory,
      projectTitle,
      projectDescription,
      githubOrPortfolioUrl
    } = req.body;

    if (!domainName || !tld || !purposeCategory || !projectTitle || !projectDescription || !githubOrPortfolioUrl) {
      return res.status(400).json({ error: "All application fields are mandatory for grant eligibility verification." });
    }

    const validCategories = ["open-source", "student", "non-profit", "developer", "startup"];
    if (!validCategories.includes(purposeCategory)) {
      return res.status(400).json({ error: "Invalid purpose category selected." });
    }

    const validation = validateDomainSyntax(domainName, tld);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    // Verify availability one more time
    const check = await registrarService.checkAvailability(validation.cleanName, validation.cleanTld);
    if (!check.available) {
      return res.status(400).json({
        error: `Domain ${validation.cleanName}.${validation.cleanTld} is already registered. Please choose an available domain.`
      });
    }

    const pricing = registrarService.getRetailPricing(validation.cleanTld);
    const requestId = crypto.randomUUID();

    await query(
      `INSERT INTO domain_requests (
        id, user_id, domain_name, tld, purpose_category,
        project_title, project_description, github_or_portfolio_url,
        retail_cost_inr, subsidized_amount_inr, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        requestId,
        req.user.id,
        `${validation.cleanName}.${validation.cleanTld}`,
        validation.cleanTld,
        purposeCategory,
        projectTitle.trim(),
        projectDescription.trim(),
        githubOrPortfolioUrl.trim(),
        pricing.retailCost,
        pricing.subsidyAmount
      ]
    );

    // Audit log
    const auditId = crypto.randomUUID();
    await query(
      "INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES (?, ?, 'SUBSIDY_APPLIED', ?, ?)",
      [
        auditId,
        req.user.id,
        `Applied for â‚¹0 subsidy on domain: ${validation.cleanName}.${validation.cleanTld}`,
        req.ip || "unknown"
      ]
    );

    res.status(201).json({
      message: "Domain subsidy grant application submitted successfully! Our review team will process your request shortly.",
      requestId
    });
  } catch (err) {
    console.error("[Subsidy] Application error:", err);
    res.status(500).json({ error: "Failed to submit domain subsidy request." });
  }
});

router.get("/my-requests", authenticateToken, async (req, res) => {
  try {
    const requests = await query(
      "SELECT * FROM domain_requests WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json({ requests: requests || [] });
  } catch (err) {
    console.error("[Subsidy] Fetch my requests error:", err);
    res.status(500).json({ error: "Failed to retrieve your subsidy applications." });
  }
});

router.get("/pool", async (req, res) => {
  try {
    const budgetRows = await query("SELECT * FROM platform_budget WHERE id = 1");
    const budget = budgetRows?.[0] || {
      total_grant_pool_inr: 100000,
      total_spent_inr: 0,
      active_subsidies_count: 0
    };
    res.json({
      totalPool: Number(budget.total_grant_pool_inr),
      totalSpent: Number(budget.total_spent_inr),
      remaining: Math.max(0, Number(budget.total_grant_pool_inr) - Number(budget.total_spent_inr)),
      activeCount: Number(budget.active_subsidies_count)
    });
  } catch (err) {
    res.json({ totalPool: 100000, totalSpent: 0, remaining: 100000, activeCount: 0 });
  }
});

export default router;
