import express from "express";
import { domainSearchLimiter } from "../middleware/rateLimiter.js";
import { validateDomainSyntax } from "../middleware/abusePrevention.js";
import { registrarService } from "../services/registrar/RegistrarService.js";

const router = express.Router();

router.get("/search", domainSearchLimiter, async (req, res) => {
  try {
    const rawQuery = req.query.query;
    const requestedTld = req.query.tld || "com";

    if (!rawQuery) {
      return res.status(400).json({ error: "Domain query string is required." });
    }

    // Strip any trailing dots or leading protocols
    const cleanRaw = rawQuery.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").trim();
    let domainName = cleanRaw;
    let tld = requestedTld;

    if (cleanRaw.includes(".")) {
      const parts = cleanRaw.split(".");
      domainName = parts[0];
      tld = parts.slice(1).join(".");
    }

    const validation = validateDomainSyntax(domainName, tld);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    // Query primary requested TLD
    const primaryResult = await registrarService.checkAvailability(validation.cleanName, validation.cleanTld);

    // Also optionally query alternate TLD (.in if .com was queried, or .com if .in was queried)
    const alternateTld = validation.cleanTld === "com" ? "in" : "com";
    let alternateResult = null;
    try {
      alternateResult = await registrarService.checkAvailability(validation.cleanName, alternateTld);
    } catch (e) {
      // Non-blocking alternate check
    }

    res.json({
      query: validation.cleanName,
      tld: validation.cleanTld,
      primary: primaryResult,
      alternate: alternateResult,
      subsidizedPriceInr: 0,
      adFree: true
    });
  } catch (err) {
    console.error("[Domains] Search error:", err);
    res.status(500).json({ error: "Failed to perform domain availability lookup." });
  }
});

export default router;
