import React, { useState, useEffect } from "react";
import { 
  Shield, Sparkles, CheckCircle2, Globe, Heart, ArrowRight, 
  HelpCircle, Server, Lock, AlertTriangle, Users, Laptop, BookOpen, Building2, Rocket
} from "lucide-react";
import { DomainSearchBar } from "../components/DomainSearchBar";
import { SearchResultCard } from "../components/SearchResultCard";
import { SubsidyModal } from "../components/SubsidyModal";
import { api } from "../services/api";

export function HomePage({ onOpenAuth, onNavigateDashboard }) {
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [selectedDomainForSubsidy, setSelectedDomainForSubsidy] = useState(null);
  const [grantStats, setGrantStats] = useState({
    totalPool: 100000,
    remaining: 100000,
    activeCount: 0
  });

  useEffect(() => {
    // Optionally fetch public grant pool overview
    api.getPublicPool().then(data => {
      if (data) {
        setGrantStats({
          totalPool: data.totalPool,
          remaining: data.remaining,
          activeCount: data.activeCount
        });
      }
    }).catch(() => {
      // Non-blocking if unauthenticated
    });
  }, []);

  const handleSearch = async (query, tld) => {
    setSearchLoading(true);
    setSearchData(null);
    try {
      const data = await api.searchDomain(query, tld);
      setSearchData(data);
    } catch (err) {
      alert(err.message || "Failed to search domain.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleApply = (domainObject) => {
    setSelectedDomainForSubsidy(domainObject);
  };

  const handleSelectAlternate = (alternateObject) => {
    setSelectedDomainForSubsidy(alternateObject);
  };

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400 font-bold">100% Ad-Free</span>
            <span className="text-slate-600">â€¢</span>
            <span>Genuine .com & .in Subsidies</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Claim Your Digital Identity for{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              â‚¹0
            </span>
            .
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            FreeDomain connects directly to legitimate domain registrars and subsidizes the actual ICANN registration fees for open source developers, students, researchers, and community non-profits.
          </p>

          {/* Search Component */}
          <div className="pt-4">
            <DomainSearchBar 
              onSearch={handleSearch} 
              loading={searchLoading} 
            />
          </div>

          {/* Search Result */}
          {searchData && (
            <SearchResultCard
              searchData={searchData}
              onApply={handleApply}
              onSelectAlternate={handleSelectAlternate}
            />
          )}

        </div>
      </section>

      {/* Transparency & Grant Pool Section */}
      <section id="transparency" className="py-12 px-4 sm:px-6 lg:px-8 border-y border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live Grant Pool</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Platform Subsidy Transparency</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
              We never display ads, sell user data, or inject parking links. Every â‚¹0 domain is funded directly from our community grant fund.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-medium">Initial Platform Grant Pool</span>
              <div className="text-3xl font-black text-white mt-1">â‚¹{grantStats.totalPool.toLocaleString()}</div>
              <span className="text-[11px] text-emerald-400 mt-1 block">Committed for Subsidies</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-center shadow-lg shadow-emerald-950/20">
              <span className="text-xs text-emerald-400 font-medium">Available Grant Reserve</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">â‚¹{grantStats.remaining.toLocaleString()}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Ready for Instant Allocation</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-medium">Domains Subsidized</span>
              <div className="text-3xl font-black text-white mt-1">{grantStats.activeCount}</div>
              <span className="text-[11px] text-teal-400 mt-1 block">Active Builders Empowered</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Step-by-Step</span>
            <h2 className="text-3xl font-black text-white mt-1">How Does the â‚¹0 Subsidy Work?</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
              Zero catch, zero hidden fees, and zero ads. Here is how your domain is requested and delivered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-white">1. Search Availability</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Query our live RDAP/Registrar checker for available <strong className="text-slate-300">.com</strong> or <strong className="text-slate-300">.in</strong> names. No scraping, pure real-time registry checks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-white">2. Submit Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tell us about your project (open source repository, student study, or portfolio). Fair use policies ensure domains go to real builders.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-white">3. Admin Grant Review</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Platform admins review your proposal. Upon approval, our automated system purchases the domain via registrar API, debiting our grant fund.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-bold text-white">4. Full Control</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manage your DNS records (A, CNAME, TXT, MX) or assign Cloudflare / Custom Nameservers directly from your dashboard.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section id="eligibility" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Eligibility & Fair Use</span>
            <h2 className="text-3xl font-black text-white mt-1">Who Can Receive a â‚¹0 Subsidy?</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
              To prevent domain squatting and abuse, grants are approved for legitimate initiative categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Open Source Developers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hosting documentation, GitHub project homepages, CLI utilities, or libraries that benefit the broader developer ecosystem.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Students & Researchers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Publishing academic papers, student capstone prototypes, or university club websites. Verified via educational project context.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Non-Profits & Community</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Charities, local open knowledge clubs, open datasets, and civil society initiatives with no commercial monetization.
              </p>
            </div>

          </div>

          {/* Anti-Abuse Rules Callout */}
          <div className="mt-8 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-white text-sm">Anti-Abuse Safeguards in Effect</h4>
              <p className="text-slate-300">
                To keep this service free for genuine creators: Exactly <strong>1 subsidized domain per person</strong> is permitted. Disposable temporary emails are rejected. Domains must be deployed with active DNS within 60 days. Phishing or squatting results in immediate termination.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Questions Answered</span>
            <h2 className="text-3xl font-black text-white mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4 text-xs">
            
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white">Are there really no advertisements or parked banners?</h4>
              <p className="text-slate-400 leading-relaxed">
                Yes, absolutely zero advertisements. FreeDomain is NOT an ad-supported registrar network. We do not inject pop-ups, tracking scripts, or spammy domain-parking pages. Your domain is 100% clean and directs only to your specified servers.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white">Can I connect my domain to Vercel, Cloudflare, or GitHub Pages?</h4>
              <p className="text-slate-400 leading-relaxed">
                Yes! From your User Dashboard, you have full control over DNS records (A, AAAA, CNAME, TXT, MX) or you can switch nameservers directly to Cloudflare, AWS Route 53, or any provider of your choice.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-white">What happens at the end of the 1-year subsidized period?</h4>
              <p className="text-slate-400 leading-relaxed">
                Your domain is registered with a legitimate registrar. At the end of the 1st subsidized year, you can renew it at the registrarâ€™s wholesale cost without markup, or transfer it out freely to any registrar of your choice using your EPP authorization code.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Subsidy Application Modal */}
      {selectedDomainForSubsidy && (
        <SubsidyModal
          domainInfo={selectedDomainForSubsidy}
          onClose={() => setSelectedDomainForSubsidy(null)}
          onSuccess={() => {
            setSelectedDomainForSubsidy(null);
            onNavigateDashboard();
          }}
          onOpenAuth={onOpenAuth}
        />
      )}

    </div>
  );
}
