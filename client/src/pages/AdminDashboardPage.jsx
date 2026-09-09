import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, AlertCircle, CheckCircle2, XCircle, Clock, 
  ExternalLink, DollarSign, Globe, RefreshCw, Users, Layers, Loader2, Sparkles
} from "lucide-react";
import { api } from "../services/api";

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [requests, setRequests] = useState([]);
  const [domains, setDomains] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");

  // Review Modal State
  const [reviewItem, setReviewItem] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [actionError, setActionError] = useState("");

  // Budget Top-Up State
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpMsg, setTopUpMsg] = useState("");

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ov, reqs, doms] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminRequests(filterStatus),
        api.getAdminDomains()
      ]);
      setOverview(ov);
      setRequests(reqs.requests || []);
      setDomains(doms.domains || []);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [filterStatus]);

  const handleApprove = async () => {
    if (!reviewItem) return;
    setProcessingAction(true);
    setActionError("");

    try {
      await api.approveRequest(reviewItem.id, { adminNotes });
      setReviewItem(null);
      setAdminNotes("");
      loadAdminData();
    } catch (err) {
      setActionError(err.message || "Failed to approve and purchase domain.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async () => {
    if (!reviewItem) return;
    const reason = prompt("Enter the reason for rejection:", "Does not meet project eligibility guidelines.");
    if (!reason) return;

    setProcessingAction(true);
    setActionError("");
    try {
      await api.rejectRequest(reviewItem.id, { reason });
      setReviewItem(null);
      setAdminNotes("");
      loadAdminData();
    } catch (err) {
      setActionError(err.message || "Failed to reject application.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleTopUpBudget = async (e) => {
    e.preventDefault();
    if (!topUpAmount || isNaN(topUpAmount) || Number(topUpAmount) <= 0) return;
    try {
      const res = await api.topUpBudget(Number(topUpAmount));
      setTopUpMsg(res.message);
      setTopUpAmount("");
      setTimeout(() => setTopUpMsg(""), 4000);
      loadAdminData();
    } catch (err) {
      alert("Failed to top up budget: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh] space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Platform Admin Portal
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Registrar Management
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review subsidy applications, execute legitimate domain registrations, and manage the platform grant pool
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Overview Metric Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Remaining Grant Fund</span>
            <div className="text-2xl font-black text-emerald-400">
              ₹{overview.budget.remainingPool.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">
              Out of ₹{overview.budget.totalGrantPool.toLocaleString()} initial pool
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Subsidies Spent</span>
            <div className="text-2xl font-black text-white">
              ₹{overview.budget.totalSpent.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-400">
              {overview.budget.activeSubsidiesCount} domains 100% funded
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Pending Review Queue</span>
            <div className="text-2xl font-black text-amber-400">
              {overview.stats.pendingRequests}
            </div>
            <span className="text-[11px] text-slate-400">Awaiting eligibility verification</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Registrar API Engine</span>
            <div className="text-xl font-bold text-teal-300 truncate">
              {overview.stats.registrarProvider.toUpperCase()}
            </div>
            <span className="text-[11px] text-emerald-400">Active & Operational</span>
          </div>

        </div>
      )}

      {/* Grant Pool Top-Up Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Top Up Platform Subsidy Reserve</h3>
          <p className="text-xs text-slate-400">Deposit additional sponsor grant funds to finance more builder registrations.</p>
        </div>

        <form onSubmit={handleTopUpBudget} className="flex items-center gap-2">
          <input
            type="number"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            placeholder="Amount in INR (e.g. 50000)"
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs w-48 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            Deposit Funds
          </button>
        </form>
      </div>

      {topUpMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{topUpMsg}</span>
        </div>
      )}

      {/* Section: Applications Review Queue */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white">Subsidy Grant Applications</h2>
            <p className="text-xs text-slate-400">Review project validity and execute automated registrar registration</p>
          </div>

          {/* Status Filter */}
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === "pending" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("fulfilled")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === "fulfilled" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === "rejected" ? "bg-red-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Applicant</th>
                <th className="px-5 py-3.5">Requested Domain</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Project Title</th>
                <th className="px-5 py-3.5">Subsidy Cost</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No applications found for status '{filterStatus}'.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{r.applicant_name}</div>
                      <div className="text-[11px] text-slate-400">{r.applicant_email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">
                      {r.domain_name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded uppercase text-[10px] font-bold bg-slate-800 text-slate-300">
                        {r.purpose_category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate font-medium text-slate-200">
                      {r.project_title}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-200">
                      ₹{r.subsidized_amount_inr}
                    </td>
                    <td className="px-5 py-3.5">
                      {r.status === "pending" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pending Review
                        </span>
                      )}
                      {r.status === "fulfilled" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Fulfilled
                        </span>
                      )}
                      {r.status === "rejected" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setReviewItem(r);
                          setAdminNotes("");
                          setActionError("");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                      >
                        Inspect & Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section: Active Registered Domains Roster */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div>
          <h2 className="text-lg font-black text-white">Active Sponsored Domains ({domains.length})</h2>
          <p className="text-xs text-slate-400">All domains successfully purchased with the platform grant fund</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Domain</th>
                <th className="px-5 py-3.5">Owner</th>
                <th className="px-5 py-3.5">Registrar Order ID</th>
                <th className="px-5 py-3.5">Registered Date</th>
                <th className="px-5 py-3.5">Expiry Date</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {domains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                    No domains registered yet.
                  </td>
                </tr>
              ) : (
                domains.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-bold font-mono text-emerald-400">{d.domain_name}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{d.owner_name}</div>
                      <div className="text-[11px] text-slate-400">{d.owner_email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">{d.registrar_order_id}</td>
                    <td className="px-5 py-3.5 text-slate-400">{new Date(d.registration_date).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-slate-400">{new Date(d.expiry_date).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {d.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Review Subsidy Application</h3>
              <button
                onClick={() => setReviewItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                {actionError}
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Domain:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">{reviewItem.domain_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Applicant:</span>
                <span className="font-semibold text-white">{reviewItem.applicant_name} ({reviewItem.applicant_email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold text-slate-200 uppercase">{reviewItem.purpose_category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Grant Subsidy Required:</span>
                <span className="font-bold text-emerald-400">₹{reviewItem.subsidized_amount_inr}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-300">Project Title:</span>
              <p className="p-3 rounded-xl bg-slate-950 text-slate-200">{reviewItem.project_title}</p>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-300">Project Description:</span>
              <p className="p-3 rounded-xl bg-slate-950 text-slate-300 leading-relaxed whitespace-pre-wrap">
                {reviewItem.project_description}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-300">Proof of Work / Repository:</span>
              <div className="p-3 rounded-xl bg-slate-950 flex items-center justify-between">
                <span className="text-slate-300 truncate max-w-sm">{reviewItem.github_or_portfolio_url}</span>
                <a
                  href={reviewItem.github_or_portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <span>Open Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="font-bold text-slate-300">Admin Feedback / Notes (Visible to applicant):</span>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Excellent open-source initiative! Grant approved."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={processingAction}
                onClick={handleReject}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold"
              >
                Reject Request
              </button>

              {reviewItem.status === "pending" && (
                <button
                  type="button"
                  disabled={processingAction}
                  onClick={handleApprove}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                >
                  {processingAction ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Purchasing from Registrar API...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Approve & Purchase (₹{reviewItem.subsidized_amount_inr})</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
