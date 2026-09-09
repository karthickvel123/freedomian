import { RdapClient } from "./RdapClient.js";
import { ResellerClubAdapter } from "./ResellerClubAdapter.js";
import { PorkbunAdapter } from "./PorkbunAdapter.js";

export class RegistrarService {
  constructor() {
    this.providerName = process.env.REGISTRAR_PROVIDER || "resellerclub";
    this.resellerClub = new ResellerClubAdapter();
    this.porkbun = new PorkbunAdapter();
  }

  getProvider() {
    if (this.providerName === "porkbun" && this.porkbun.isConfigured()) {
      return this.porkbun;
    }
    if (this.resellerClub.isConfigured()) {
      return this.resellerClub;
    }
    return null;
  }

  getRetailPricing(tld) {
    const cleanTld = tld.replace(/^\./, "").toLowerCase();
    switch (cleanTld) {
      case "in":
        return {
          currency: "INR",
          retailCost: 499.00,
          subsidyAmount: 499.00,
          userCost: 0.00,
          periodYears: 1
        };
      case "com":
      default:
        return {
          currency: "INR",
          retailCost: 899.00,
          subsidyAmount: 899.00,
          userCost: 0.00,
          periodYears: 1
        };
    }
  }

  async checkAvailability(domainName, tld) {
    const cleanDomain = domainName.toLowerCase().trim();
    const cleanTld = tld.replace(/^\./, "").toLowerCase().trim();
    const provider = this.getProvider();

    let result = null;
    if (provider) {
      try {
        result = await provider.checkAvailability(cleanDomain, cleanTld);
      } catch (err) {
        console.warn(`[Registrar] Provider check failed: ${err.message}. Falling back to official RDAP.`);
      }
    }

    if (!result) {
      // Real authoritative RDAP check against Verisign (.com) or NIXI (.in) registries
      result = await RdapClient.checkAvailability(cleanDomain, cleanTld);
    }

    const pricing = this.getRetailPricing(cleanTld);

    return {
      domain: `${cleanDomain}.${cleanTld}`,
      domainName: cleanDomain,
      tld: cleanTld,
      available: result.available,
      status: result.status,
      source: result.source,
      pricing: pricing,
      eligibleForSubsidy: result.available
    };
  }

  async registerDomain(domainName, tld, userDetails) {
    const cleanDomain = domainName.toLowerCase().trim();
    const cleanTld = tld.replace(/^\./, "").toLowerCase().trim();
    const provider = this.getProvider();

    if (provider) {
      try {
        return await provider.registerDomain(cleanDomain, cleanTld, userDetails);
      } catch (err) {
        console.error(`[Registrar] Registration via provider failed: ${err.message}`);
        throw err;
      }
    }

    // Sandbox / Mock Registrar Mode for development
    console.log(`[Registrar] Executing Sandbox Registration for ${cleanDomain}.${cleanTld}`);
    const now = new Date();
    const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    return {
      success: true,
      sandbox: true,
      registrarProvider: "ResellerClub-Sandbox",
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      domainId: `DOM-REG-${cleanDomain}-${cleanTld}`,
      status: "active",
      registrationDate: now.toISOString(),
      expiryDate: expiry.toISOString()
    };
  }

  async updateNameservers(domainName, tld, nameservers) {
    const provider = this.getProvider();
    if (provider) {
      return provider.updateNameservers(domainName, tld, nameservers);
    }
    return {
      success: true,
      sandbox: true,
      nameservers: nameservers,
      message: "Nameservers updated in Sandbox Registrar and local zone."
    };
  }
}

export const registrarService = new RegistrarService();
