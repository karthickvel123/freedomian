import React from "react";
import { Shield, Lock, Globe, CheckCircle2, Ban } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Col 1: Platform identity */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">FreeDomain Platform</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400 max-w-md">
            FreeDomain provides legitimate, 100% subsidized <strong className="text-slate-300">.com</strong> and <strong className="text-slate-300">.in</strong> domain names to genuine students, open-source developers, researchers, and non-profit projects. We absorb the real wholesale registrar fees through our independent grant pool.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
              <Ban className="w-3 h-3 text-emerald-400" /> 100% Ad-Free Guarantee
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-teal-400">
              <CheckCircle2 className="w-3 h-3 text-teal-400" /> Real Registrar APIs
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-blue-400">
              <Lock className="w-3 h-3 text-blue-400" /> Zero Scraping / No Fakes
            </span>
          </div>
        </div>

        {/* Col 2: Supported TLDs & Integrations */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Registrar Ecosystem</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> .com (Verisign Global gTLD)
            </li>
            <li className="flex items-center gap-1.5 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> .in (NIXI India ccTLD)
            </li>
            <li className="text-slate-400">ResellerClub / LogicBoxes API</li>
            <li className="text-slate-400">Porkbun REST v3 API</li>
            <li className="text-slate-400">ICANN Standard RDAP (RFC 7482)</li>
          </ul>
        </div>

        {/* Col 3: Fair Use & Trust */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Governance & Trust</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#eligibility" className="hover:text-emerald-400 transition-colors">Grant Eligibility Criteria</a></li>
            <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Anti-Abuse & Fair Use Policy</a></li>
            <li><a href="#transparency" className="hover:text-emerald-400 transition-colors">Subsidy Pool Transparency</a></li>
            <li><span className="text-slate-500">Max 1 Domain per Verified Builder</span></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© 2026 FreeDomain Platform. Built for open-source builders, students & non-profits.</p>
        <p className="flex items-center gap-1 text-slate-400">
          Funded by community grants and tech sponsorships • Powered by Node.js, MySQL & React
        </p>
      </div>
    </footer>
  );
}
