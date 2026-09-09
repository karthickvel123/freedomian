import React, { useState } from "react";
import { Search, Loader2, Sparkles, AlertCircle } from "lucide-react";

export function DomainSearchBar({ onSearch, loading, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedTld, setSelectedTld] = useState("com");
  const [validationError, setValidationError] = useState("");

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setValidationError("");

    const clean = query.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "");
    if (!clean) {
      setValidationError("Please enter a domain name to search.");
      return;
    }

    const domainOnly = clean.split(".")[0];
    if (domainOnly.length < 3) {
      setValidationError("Domain names must be at least 3 characters long.");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(domainOnly)) {
      setValidationError("Only letters, numbers, and hyphens are valid.");
      return;
    }

    onSearch(domainOnly, selectedTld);
  };

  const handleTagClick = (tag, tld) => {
    setQuery(tag);
    setSelectedTld(tld);
    setValidationError("");
    onSearch(tag, tld);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form 
        onSubmit={handleSearchSubmit}
        className="relative p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (validationError) setValidationError("");
              }}
              placeholder="Find your digital home (e.g. devportfolio, buildinpublic)..."
              className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white text-base placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* TLD Badges Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-center">
            <button
              type="button"
              onClick={() => setSelectedTld("com")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTld === "com"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              .com
            </button>
            <button
              type="button"
              onClick={() => setSelectedTld("in")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTld === "in"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              .in
            </button>
          </div>

          {/* Search Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Registry...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Search ₹0 Subsidy</span>
              </>
            )}
          </button>
        </div>
      </form>

      {validationError && (
        <div className="mt-2.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Suggested Quick Search Tags */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        <span className="text-slate-400 font-medium">Try searching:</span>
        <button
          type="button"
          onClick={() => handleTagClick("opencollective-india", "in")}
          className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-colors"
        >
          opencollective-india.in
        </button>
        <button
          type="button"
          onClick={() => handleTagClick("studenthacks-2026", "com")}
          className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-colors"
        >
          studenthacks-2026.com
        </button>
        <button
          type="button"
          onClick={() => handleTagClick("aiexplorers-hub", "in")}
          className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-colors"
        >
          aiexplorers-hub.in
        </button>
      </div>
    </div>
  );
}
