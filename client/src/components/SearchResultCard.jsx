import React from "react";
import { CheckCircle2, XCircle, Sparkles, Shield, ArrowRight, Server, Lock, ExternalLink } from "lucide-react";

export function SearchResultCard({ searchData, onApply, onSelectAlternate }) {
  if (!searchData || !searchData.primary) return null;

  const { primary, alternate } = searchData;
  const isAvailable = primary.available;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Primary Result Box */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isAvailable 
          ? "bg-slate-900/90 border-emerald-500/40 shadow-xl shadow-emerald-950/30" 
          : "bg-slate-900/60 border-slate-800"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Domain name & Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {primary.domain}
              </h3>
              {isAvailable ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Available for ₹0 Grant
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  <XCircle className="w-3.5 h-3.5" />
                  Taken in Registry
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Source: Authoritative {primary.source || "Registry"}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">100% Ad-Free Guarantee</span>
            </p>

            {isAvailable && (
              <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Free WHOIS Privacy
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Server className="w-3.5 h-3.5 text-teal-400" />
                  Full DNS & NS Control
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  Genuine Registrar Registration
                </span>
              </div>
            )}
          </div>

          {/* Pricing & CTA */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 gap-3">
            {isAvailable ? (
              <>
                <div className="text-left md:text-right">
                  <div className="text-xs text-slate-400">
                    Retail: <span className="line-through">₹{primary.pricing?.retailCost || 899}</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    ₹0 <span className="text-xs font-normal text-slate-400">/ 1st Year Grant</span>
                  </div>
                  <div className="text-[10px] text-emerald-500 font-medium">100% Platform Subsidized</div>
                </div>

                <button
                  type="button"
                  onClick={() => onApply(primary)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Apply for ₹0 Grant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="text-right">
                <span className="text-xs text-slate-400">Already registered by another owner</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Alternate TLD Suggestion */}
      {alternate && alternate.available && (
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <p className="text-sm font-semibold text-white">
                Great Alternative: <strong className="text-emerald-400">{alternate.domain}</strong> is Available!
              </p>
              <p className="text-xs text-slate-400">
                Eligible for the same 100% platform subsidy grant (₹0).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectAlternate(alternate)}
            className="px-4 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <span>Claim {alternate.domain} for ₹0</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
