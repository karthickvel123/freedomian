import { query } from "../database/db.js";

// Common disposable/temporary email domains to prevent multi-account abuse
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
  "sharklasers.com", "throwawaymail.com", "yopmail.com", "getairmail.com",
  "dispostable.com", "maildrop.cc", "trashmail.com", "fakeinbox.com",
  "temp-mail.org", "crazymailing.com", "nada.ltd", "mohmal.com",
  "mytemp.email", "generator.email", "burnermail.io", "fakemailgenerator.com"
]);

export function isDisposableEmail(email) {
  if (!email || !email.includes("@")) return false;
  const domainPart = email.split("@")[1].toLowerCase().trim();
  return DISPOSABLE_DOMAINS.has(domainPart);
}

export function validateDomainSyntax(domainName, tld) {
  if (!domainName || typeof domainName !== "string") {
    return { valid: false, message: "Domain name is required." };
  }

  const cleanName = domainName.toLowerCase().trim();
  const cleanTld = (tld || "").toLowerCase().replace(/^\./, "").trim();

  if (!["com", "in"].includes(cleanTld)) {
    return { valid: false, message: "Only .com and .in TLDs are supported under the FreeDomain grant program." };
  }

  if (cleanName.length < 3 || cleanName.length > 63) {
    return { valid: false, message: "Domain name must be between 3 and 63 characters in length." };
  }

  // RFC 1035 domain label syntax: only lowercase alphanumeric and hyphen, cannot start or end with hyphen
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  if (!domainRegex.test(cleanName)) {
    return {
      valid: false,
      message: "Domain contains invalid characters. Only letters, numbers, and hyphens (not at start or end) are permitted."
    };
  }

  // Check for reserved words or trademark phishing patterns
  const reservedWords = ["google", "microsoft", "apple", "facebook", "amazon", "gov", "nic"];
  if (reservedWords.includes(cleanName)) {
    return { valid: false, message: "This domain label is restricted or reserved." };
  }

  return { valid: true, cleanName, cleanTld };
}

export async function enforceUserSubsidyQuota(req, res, next) {
  const userId = req.user.id;

  try {
    // 1. Check active domains owned by this user
    const existingDomains = await query(
      "SELECT id, domain_name, status FROM domains WHERE user_id = ? AND status = 'active'",
      [userId]
    );

    if (existingDomains && existingDomains.length >= 1) {
      return res.status(400).json({
        error: "Quota Reached: FreeDomain grants are limited to 1 subsidized domain per user to ensure equitable distribution."
      });
    }

    // 2. Check pending applications
    const pendingRequests = await query(
      "SELECT id, domain_name, status FROM domain_requests WHERE user_id = ? AND status IN ('pending', 'approved')",
      [userId]
    );

    if (pendingRequests && pendingRequests.length >= 1) {
      return res.status(400).json({
        error: "You already have an active or pending domain subsidy application under review."
      });
    }

    next();
  } catch (err) {
    console.error("[AbusePrevention] Quota check error:", err);
    res.status(500).json({ error: "Failed to verify eligibility quota." });
  }
}
