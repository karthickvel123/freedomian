import dns from "dns/promises";

/**
 * Standard RDAP (Registration Data Access Protocol - RFC 7482) client
 * Queries authoritative ICANN/Registry RDAP endpoints for real-time domain availability without scraping.
 */
export class RdapClient {
  static async checkAvailability(domainName, tld) {
    const fullDomain = `${domainName.toLowerCase()}.${tld.toLowerCase()}`;
    let rdapUrl = "";

    if (tld.toLowerCase() === "com") {
      // Verisign RDAP for .com
      rdapUrl = `https://rdap.verisign.com/com/v1/domain/${fullDomain}`;
    } else if (tld.toLowerCase() === "in") {
      // Registry.in (NIXI) RDAP for .in
      rdapUrl = `https://rdap.registry.in/domain/${fullDomain}`;
    } else {
      rdapUrl = `https://rdap.org/domain/${fullDomain}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(rdapUrl, {
        method: "GET",
        headers: {
          Accept: "application/rdap+json, application/json",
          "User-Agent": "FreeDomain-Availability-Checker/1.0"
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.status === 404) {
        // HTTP 404 in RDAP standard explicitly means domain object does not exist in registry
        return {
          available: true,
          domain: fullDomain,
          status: "available",
          source: "RDAP-Registry-404"
        };
      } else if (response.status === 200) {
        // HTTP 200 means registered and active in registry
        const data = await response.json().catch(() => ({}));
        return {
          available: false,
          domain: fullDomain,
          status: "registered",
          source: "RDAP-Registry-200",
          expirationDate: data.events?.find(e => e.eventAction === "expiration")?.eventDate || null
        };
      }
    } catch (err) {
      console.warn(`[RDAP] RDAP check timed out or errored for ${fullDomain} (${err.message}). Using authoritative DNS check.`);
    }

    // Secondary authoritative DNS check fallback
    try {
      const soa = await dns.resolveSoa(fullDomain).catch(() => null);
      const ns = await dns.resolveNs(fullDomain).catch(() => null);
      const a = await dns.resolve4(fullDomain).catch(() => null);

      if (soa || (ns && ns.length > 0) || (a && a.length > 0)) {
        return {
          available: false,
          domain: fullDomain,
          status: "registered",
          source: "DNS-Resolution"
        };
      } else {
        return {
          available: true,
          domain: fullDomain,
          status: "available",
          source: "DNS-NoRecords"
        };
      }
    } catch (dnsErr) {
      return {
        available: true,
        domain: fullDomain,
        status: "available",
        source: "DNS-NXDOMAIN"
      };
    }
  }
}
