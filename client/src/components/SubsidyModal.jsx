import React, { useState } from "react";
import { X, Sparkles, AlertCircle, CheckCircle2, ShieldAlert, Loader2, ArrowRight } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function SubsidyModal({ domainInfo, onClose, onSuccess, onOpenAuth }) {
  const { user } = useAuth();
  const [purposeCategory, setPurposeCategory] = useState("open-source");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [githubOrPortfolioUrl, setGithubOrPortfolioUrl] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!domainInfo) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      onOpenAuth("register");
      return;
    }

    if (!projectTitle.trim() || !projectDescription.trim() || !githubOrPortfolioUrl.trim()) {
      setError("Please fill out all project verification fields.");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the FreeDomain fair-use commitment.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.applySubsidy({
        domainName: domainInfo.domainName,
        tld: domainInfo.tld,
        purposeCategory,
        projectTitle,
        projectDescription,
        githubOrPortfolioUrl
      });

      setSuccessMsg(res.message || "Grant application submitted successfully!");
      setTimeout(() => {
        onSuccess();
      }, 1800);
    } catch (err) {
      setError(err.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Apply for ₹0 Domain Grant
            </h2>
            <p className="text-xs text-slate-400">
              100% subsidized registration for genuine creators and builders
            </p>
          </div>
        </div>

        {/* Selected Domain Banner */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Target Domain</span>
            <div className="text-lg font-black text-white">{domainInfo.domain}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 line-through">Retail: ₹{domainInfo.pricing?.retailCost || 899}</span>
            <div className="text-lg font-black text-emerald-400">₹0 (Free)</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Application Received!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              {successMsg} You can track the approval status directly inside your User Dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {!user && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Account required to submit application.</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenAuth("register")}
                  className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Sign In / Sign Up
                </button>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Project Category
              </label>
              <select
                value={purposeCategory}
                onChange={(e) => setPurposeCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="open-source">Open Source Software / Tool</option>
                <option value="student">Student / Academic Research</option>
                <option value="non-profit">Non-Profit / NGO / Community Initiative</option>
                <option value="developer">Developer Portfolio / Blog</option>
                <option value="startup">Bootstrapped Early-Stage MVP</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Project / Initiative Title
              </label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. FreeIndia Code Mentorship, Rust Web Framework"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Project Summary & Purpose (What will be hosted?)
              </label>
              <textarea
                required
                rows={3}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Explain what problem your project solves and how this domain will be utilized..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* GitHub or Portfolio link */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Proof of Work (GitHub Repo, LinkedIn, or Demo URL)
              </label>
              <input
                type="url"
                required
                value={githubOrPortfolioUrl}
                onChange={(e) => setGithubOrPortfolioUrl(e.target.value)}
                placeholder="https://github.com/username/project or https://linkedin.com/in/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                />
                <span className="leading-snug">
                  I certify this domain will be used for legitimate purposes only. I agree not to engage in phishing, malware, or domain hoarding. (Limit 1 grant per builder).
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying & Submitting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm & Submit ₹0 Grant Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
