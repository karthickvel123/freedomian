import React from "react";
import { Shield, Sparkles, User, LogOut, LayoutDashboard, ShieldCheck, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Navbar({ onOpenAuth, activePage, setActivePage, onOpenSponsorModal }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActivePage("home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">FreeDomain</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Subsidized
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">Zero Ads • Legitimate Registrars</p>
          </div>
        </div>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button 
            onClick={() => setActivePage("home")}
            className={`hover:text-white transition-colors ${activePage === "home" ? "text-emerald-400 font-semibold" : ""}`}
          >
            Search Domains
          </button>
          <a 
            href="#how-it-works"
            onClick={() => setActivePage("home")}
            className="hover:text-white transition-colors"
          >
            How ₹0 Works
          </a>
          <a 
            href="#eligibility"
            onClick={() => setActivePage("home")}
            className="hover:text-white transition-colors"
          >
            Eligibility
          </a>
          <a 
            href="#transparency"
            onClick={() => setActivePage("home")}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Grant Pool</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin ? (
                <button
                  onClick={() => setActivePage(activePage === "admin" ? "home" : "admin")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activePage === "admin" 
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25" 
                      : "bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>
              ) : null}

              <button
                onClick={() => setActivePage(activePage === "dashboard" ? "home" : "dashboard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activePage === "dashboard"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>My Dashboard</span>
              </button>

              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                <span className="text-[10px] text-slate-400">{user.email}</span>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/10 hover:text-red-400 text-slate-400 border border-slate-700/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth("login")}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Claim Free Domain</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
