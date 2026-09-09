import React, { useState } from "react";
import { X, Shield, Lock, Mail, User, Sparkles, Loader2, AlertCircle, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AuthModal({ initialTab = "login", onClose, onSuccess }) {
  const [tab, setTab] = useState(initialTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error("Your full name or organization name is required.");
        }
        await register(name, email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type) => {
    setError("");
    if (type === "admin") {
      setTab("login");
      setEmail("admin@freedomain.org");
      setPassword("Admin@12345");
    } else {
      setTab("register");
      setName("Aarav Sharma");
      setEmail(`aarav.developer${Math.floor(Math.random() * 900 + 100)}@gmail.com`);
      setPassword("Builder2026!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 text-slate-100">
        
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === "login"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setTab("register"); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === "register"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-white tracking-tight">
            {tab === "login" ? "Welcome Back" : "Join the FreeDomain Network"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {tab === "login" 
              ? "Access your registered domains, DNS records & applications" 
              : "Claim 100% subsidized domains for your legitimate projects"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {tab === "register" && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@gmail.com (No temp emails)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            {tab === "register" && (
              <span className="text-[10px] text-slate-500 mt-1 block">
                * Disposable email services are blocked by abuse protection.
              </span>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{tab === "login" ? "Sign In" : "Create Account & Claim Subsidy"}</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fill Quick Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-400 text-center mb-2 font-medium flex items-center justify-center gap-1">
            <KeyRound className="w-3 h-3 text-slate-400" />
            <span>Fast Evaluation Credentials:</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillCredentials("admin")}
              className="flex-1 py-1.5 px-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-semibold transition-colors"
            >
              Fill Admin (admin@freedomain.org)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("user")}
              className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold transition-colors"
            >
              Fill Sample Builder
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
