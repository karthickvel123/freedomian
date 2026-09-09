import express from "express";
import crypto from "crypto";
import { query } from "../database/db.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { registrarService } from "../services/registrar/RegistrarService.js";

const router = express.Router();

// Apply auth + requireAdmin to all admin endpoints
router.use(authenticateToken, requireAdmin);

router.get("/overview", async (req, res) => {
  try {
    const budgetRows = await query("SELECT * FROM platform_budget WHERE id = 1");
    const budget = budgetRows?.[0] || {
      total_grant_pool_inr: 100000,
      total_spent_inr: 0,
      active_subsidies_count: 0
    };

    const pendingCounts = await query("SELECT COUNT(*) as count FROM domain_requests WHERE status = 'pending'");
    const totalUsers = await query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const totalDomains = await query("SELECT COUNT(*) as count FROM domains WHERE status = 'active'");

    res.json({
      budget: {
        totalGrantPool: Number(budget.total_grant_pool_inr),
        totalSpent: Number(budget.total_spent_inr),
        remainingPool: Math.max(0, Number(budget.total_grant_pool_inr) - Number(budget.total_spent_inr)),
        activeSubsidiesCount: Number(budget.active_subsidies_count)
      },
      stats: {
        pendingRequests: pendingCounts?.[0]?.count || 0,
        registeredUsers: totalUsers?.[0]?.count || 0,
        activeDomains: totalDomains?.[0]?.count || 0,
        registrarProvider: registrarService.providerName
      }
    });
  } catch (err) {
    console.error("[Admin] Overview error:", err);
    res.status(500).json({ error: "Failed to retrieve admin statistics." });
  }
});

router.get("/requests", async (req, res) => {
  try {
    const statusFilter = req.query.status;
    let sql = `
      SELECT r.*, u.name as applicant_name, u.email as applicant_email
      FROM domain_requests r
      JOIN users u ON r.user_id = u.id
    `;
    const params = [];

    if (statusFilter && statusFilter !== "all") {
      sql += " WHERE r.status = ?";
      params.push(statusFilter);
    }
    sql += " ORDER BY r.created_at DESC";

    const requests = await query(sql, params);
    res.json({ requests: requests || [] });
  } catch (err) {
    console.error("[Admin] Fetch requests error:", err);
    res.status(500).json({ error: "Failed to fetch subsidy requests." });
  }
});

router.post("/requests/:id/approve", async (req, res) => {
  try {
    const requestId = req.params.id;
    const reqRows = await query(
      "SELECT r.*, u.name, u.email FROM domain_requests r JOIN users u ON r.user_id = u.id WHERE r.id = ?",
      [requestId]
    );

    if (!reqRows || reqRows.length === 0) {
      return res.status(404).json({ error: "Application not found." });
    }

    const request = reqRows[0];
    if (request.status !== "pending") {
      return res.status(400).json({ error: `Cannot approve application with status '${request.status}'.` });
    }

    // Check budget
    const budgetRows = await query("SELECT * FROM platform_budget WHERE id = 1");
    const budget = budgetRows?.[0];
    const subsidyCost = Number(request.subsidized_amount_inr);
    const remaining = Number(budget.total_grant_pool_inr) - Number(budget.total_spent_inr);

    if (remaining < subsidyCost) {
      return res.status(400).json({
        error: "Insufficient platform grant funds to subsidize this registration. Please top up the grant budget pool."
      });
    }

    // Execute legitimate domain registration via Registrar API
    console.log(`[Admin] Registering domain ${request.domain_name} with registrar API...`);
    const regResult = await registrarService.registerDomain(
      request.domain_name.split(".")[0],
      request.tld,
      {
        name: request.name,
        email: request.email,
        userId: request.user_id
      }
    );

    const domainId = crypto.randomUUID();
    const expiryDate = regResult.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Insert domain into domains table
    await query(
      `INSERT INTO domains (
        id, domain_name, tld, user_id, request_id,
        registrar_provider, registrar_order_id, registrar_domain_id,
        status, registration_date, expiry_date, auto_renew
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, ?, 1)`,
      [
        domainId,
        request.domain_name,
        request.tld,
        request.user_id,
        request.id,
        regResult.registrarProvider || "ResellerClub",
        regResult.orderId || `ORD-${Date.now()}`,
        regResult.domainId || `DOM-${Date.now()}`,
        expiryDate
      ]
    );

    // 2. Set default FreeDomain nameservers
    const nsId = crypto.randomUUID();
    await query(
      `INSERT INTO nameservers (id, domain_id, mode, ns1, ns2) VALUES (?, ?, 'default', 'ns1.freedomain.org', 'ns2.freedomain.org')`,
      [nsId, domainId]
    );

    // 3. Mark request as fulfilled
    await query(
      "UPDATE domain_requests SET status = 'fulfilled', admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [req.body.adminNotes || "Approved and 100% subsidized by FreeDomain grant program.", requestId]
    );

    // 4. Update platform budget
    await query(
      `UPDATE platform_budget 
       SET total_spent_inr = total_spent_inr + ?,
           active_subsidies_count = active_subsidies_count + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [subsidyCost]
    );

    // 5. Audit log
    const auditId = crypto.randomUUID();
    await query(
      "INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES (?, ?, 'SUBSIDY_APPROVED_AND_REGISTERED', ?, ?)",
      [
        auditId,
        req.user.id,
        `Approved & purchased ₹${subsidyCost} domain ${request.domain_name} for applicant ${request.email}. Order: ${regResult.orderId}`,
        req.ip || "unknown"
      ]
    );

    res.json({
      message: `Domain ${request.domain_name} successfully registered and granted to ${request.email} for ₹0.`,
      domainId,
      orderId: regResult.orderId
    });
  } catch (err) {
    console.error("[Admin] Approval error:", err);
    res.status(500).json({ error: `Registration failed: ${err.message}` });
  }
});

router.post("/requests/:id/reject", async (req, res) => {
  try {
    const requestId = req.params.id;
    const { reason } = req.body;

    const reqRows = await query("SELECT * FROM domain_requests WHERE id = ?", [requestId]);
    if (!reqRows || reqRows.length === 0) {
      return res.status(404).json({ error: "Application not found." });
    }

    const request = reqRows[0];
    if (request.status !== "pending") {
      return res.status(400).json({ error: `Cannot reject application with status '${request.status}'.` });
    }

    await query(
      "UPDATE domain_requests SET status = 'rejected', admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [reason || "Does not meet project eligibility guidelines.", requestId]
    );

    // Audit log
    const auditId = crypto.randomUUID();
    await query(
      "INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES (?, ?, 'SUBSIDY_REJECTED', ?, ?)",
      [
        auditId,
        req.user.id,
        `Rejected subsidy application for ${request.domain_name}. Reason: ${reason || "Unspecified"}`,
        req.ip || "unknown"
      ]
    );

    res.json({ message: "Application rejected." });
  } catch (err) {
    console.error("[Admin] Reject error:", err);
    res.status(500).json({ error: "Failed to reject application." });
  }
});

router.get("/domains", async (req, res) => {
  try {
    const domains = await query(`
      SELECT d.*, u.name as owner_name, u.email as owner_email
      FROM domains d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `);
    res.json({ domains: domains || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve active domains." });
  }
});

router.post("/budget", async (req, res) => {
  try {
    const { additionalGrantInr } = req.body;
    const amount = Number(additionalGrantInr);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "A valid positive grant amount in INR is required." });
    }

    await query(
      "UPDATE platform_budget SET total_grant_pool_inr = total_grant_pool_inr + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
      [amount]
    );

    const budget = await query("SELECT * FROM platform_budget WHERE id = 1");
    res.json({
      message: `Successfully credited ₹${amount.toLocaleString()} to the platform grant pool.`,
      budget: budget[0]
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update platform grant budget." });
  }
});

export default router;
