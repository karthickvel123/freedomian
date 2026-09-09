import express from "express";
import crypto from "crypto";
import { query } from "../database/db.js";
import { authenticateToken } from "../middleware/auth.js";
import { registrarService } from "../services/registrar/RegistrarService.js";

const router = express.Router();

// Helper to verify user owns domain
async function verifyDomainOwnership(domainId, userId) {
  const domains = await query("SELECT * FROM domains WHERE id = ? AND user_id = ?", [domainId, userId]);
  if (!domains || domains.length === 0) return null;
  return domains[0];
}

router.get("/my-domains", authenticateToken, async (req, res) => {
  try {
    const domains = await query(
      `SELECT d.*, n.mode as ns_mode, n.ns1, n.ns2 
       FROM domains d 
       LEFT JOIN nameservers n ON d.id = n.domain_id 
       WHERE d.user_id = ? 
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );
    res.json({ domains: domains || [] });
  } catch (err) {
    console.error("[UserDomains] Fetch error:", err);
    res.status(500).json({ error: "Failed to retrieve your domains." });
  }
});

router.get("/:domainId", authenticateToken, async (req, res) => {
  try {
    const domain = await verifyDomainOwnership(req.params.domainId, req.user.id);
    if (!domain) {
      return res.status(404).json({ error: "Domain not found or access denied." });
    }

    const ns = await query("SELECT * FROM nameservers WHERE domain_id = ?", [domain.id]);
    const dnsRecords = await query("SELECT * FROM dns_records WHERE domain_id = ? ORDER BY created_at ASC", [domain.id]);

    res.json({
      domain,
      nameservers: ns?.[0] || { mode: "default", ns1: "ns1.freedomain.org", ns2: "ns2.freedomain.org" },
      dnsRecords: dnsRecords || []
    });
  } catch (err) {
    console.error("[UserDomains] Details error:", err);
    res.status(500).json({ error: "Failed to fetch domain details." });
  }
});

router.get("/:domainId/dns", authenticateToken, async (req, res) => {
  try {
    const domain = await verifyDomainOwnership(req.params.domainId, req.user.id);
    if (!domain) return res.status(404).json({ error: "Domain not found or access denied." });

    const records = await query(
      "SELECT * FROM dns_records WHERE domain_id = ? ORDER BY created_at ASC",
      [domain.id]
    );
    res.json({ records: records || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve DNS records." });
  }
});

router.post("/:domainId/dns", authenticateToken, async (req, res) => {
  try {
    const domain = await verifyDomainOwnership(req.params.domainId, req.user.id);
    if (!domain) return res.status(404).json({ error: "Domain not found or access denied." });

    const { recordType, name, value, ttl = 3600, priority = null } = req.body;

    const allowedTypes = ["A", "AAAA", "CNAME", "TXT", "MX"];
    if (!allowedTypes.includes((recordType || "").toUpperCase())) {
      return res.status(400).json({ error: `Invalid DNS record type. Supported types: ${allowedTypes.join(", ")}` });
    }

    if (!name || !value) {
      return res.status(400).json({ error: "Host/Name and Value/Target are required." });
    }

    // Basic record syntax validation
    const cleanType = recordType.toUpperCase();
    if (cleanType === "A") {
      const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/;
      if (!ipv4Regex.test(value.trim())) {
        return res.status(400).json({ error: "Invalid IPv4 address for type A record." });
      }
    }

    const recordId = crypto.randomUUID();
    await query(
      `INSERT INTO dns_records (id, domain_id, record_type, name, value, ttl, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [recordId, domain.id, cleanType, name.trim(), value.trim(), Number(ttl) || 3600, priority ? Number(priority) : null]
    );

    res.status(201).json({
      message: "DNS record added successfully.",
      record: { id: recordId, domain_id: domain.id, record_type: cleanType, name: name.trim(), value: value.trim(), ttl, priority }
    });
  } catch (err) {
    console.error("[UserDomains] Add DNS error:", err);
    res.status(500).json({ error: "Failed to add DNS record." });
  }
});

router.delete("/:domainId/dns/:recordId", authenticateToken, async (req, res) => {
  try {
    const domain = await verifyDomainOwnership(req.params.domainId, req.user.id);
    if (!domain) return res.status(404).json({ error: "Domain not found or access denied." });

    await query("DELETE FROM dns_records WHERE id = ? AND domain_id = ?", [req.params.recordId, domain.id]);
    res.json({ message: "DNS record deleted successfully." });
  } catch (err) {
    console.error("[UserDomains] Delete DNS error:", err);
    res.status(500).json({ error: "Failed to delete DNS record." });
  }
});

router.put("/:domainId/nameservers", authenticateToken, async (req, res) => {
  try {
    const domain = await verifyDomainOwnership(req.params.domainId, req.user.id);
    if (!domain) return res.status(404).json({ error: "Domain not found or access denied." });

    const { mode, ns1, ns2, ns3, ns4 } = req.body;
    const cleanMode = mode === "custom" ? "custom" : "default";

    let primaryNs1 = "ns1.freedomain.org";
    let primaryNs2 = "ns2.freedomain.org";
    let primaryNs3 = null;
    let primaryNs4 = null;

    if (cleanMode === "custom") {
      if (!ns1 || !ns2) {
        return res.status(400).json({ error: "At least two authoritative nameservers (NS1 and NS2) are required for custom setup." });
      }
      primaryNs1 = ns1.trim().toLowerCase();
      primaryNs2 = ns2.trim().toLowerCase();
      primaryNs3 = ns3 ? ns3.trim().toLowerCase() : null;
      primaryNs4 = ns4 ? ns4.trim().toLowerCase() : null;
    }

    // Call registrar service
    const nsList = [primaryNs1, primaryNs2];
    if (primaryNs3) nsList.push(primaryNs3);
    if (primaryNs4) nsList.push(primaryNs4);

    await registrarService.updateNameservers(domain.domain_name, domain.tld, nsList);

    // Upsert into nameservers table
    const existing = await query("SELECT id FROM nameservers WHERE domain_id = ?", [domain.id]);
    if (existing && existing.length > 0) {
      await query(
        `UPDATE nameservers SET mode = ?, ns1 = ?, ns2 = ?, ns3 = ?, ns4 = ?, updated_at = CURRENT_TIMESTAMP
         WHERE domain_id = ?`,
        [cleanMode, primaryNs1, primaryNs2, primaryNs3, primaryNs4, domain.id]
      );
    } else {
      const nsId = crypto.randomUUID();
      await query(
        `INSERT INTO nameservers (id, domain_id, mode, ns1, ns2, ns3, ns4) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nsId, domain.id, cleanMode, primaryNs1, primaryNs2, primaryNs3, primaryNs4]
      );
    }

    res.json({
      message: "Authoritative nameservers updated successfully. Changes will propagate globally within minutes.",
      nameservers: { mode: cleanMode, ns1: primaryNs1, ns2: primaryNs2, ns3: primaryNs3, ns4: primaryNs4 }
    });
  } catch (err) {
    console.error("[UserDomains] Update nameservers error:", err);
    res.status(500).json({ error: "Failed to update nameservers." });
  }
});

export default router;
