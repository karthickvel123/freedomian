import React, { useState, useEffect } from "react";
import { 
  Globe, Server, Shield, Plus, Trash2, CheckCircle2, Clock, 
  AlertCircle, ExternalLink, RefreshCw, Layers, ArrowLeft, Loader2
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function UserDashboardPage({ onGoSearch }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("domains"); // 'domains' | 'applications'
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState([]);
  const [applications, setApplications] = useState([]);
  
  // Selected domain for DNS & NS management
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [dnsRecords, setDnsRecords] = useState([]);
  const [nameservers, setNameservers] = useState({ mode: "default", ns1: "", ns2: "", ns3: "", ns4: "" });
  const [nsSaving, setNsSaving] = useState(false);
  const [nsFeedback, setNsFeedback] = useState("");

  // New DNS Record Form
  const [showAddDns, setShowAddDns] = useState(false);
  const [newRecordType, setNewRecordType] = useState("A");
  const [newRecordName, setNewRecordName] = useState("@");
  const [newRecordValue, setNewRecordValue] = useState("");
  const [newRecordTtl, setNewRecordTtl] = useState("3600");
  const [newRecordPriority, setNewRecordPriority] = useState("");
  const [dnsError, setDnsError] = useState("");
  const [dnsSubmitting, setDnsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [domRes, reqRes] = await Promise.all([
        api.getMyDomains(),
        api.getMyRequests()
      ]);
      setDomains(domRes.domains || []);
      setApplications(reqRes.requests || []);
      if (domRes.domains && domRes.domains.length > 0 && !selectedDomain) {
        handleSelectDomain(domRes.domains[0]);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectDomain = async (domain) => {
    setSelectedDomain(domain);
    try {
      const details = await api.getDomainDetails(domain.id);
      setDnsRecords(details.dnsRecords || []);
      setNameservers(details.nameservers || { mode: "default", ns1: "ns1.freedomain.org", ns2: "ns2.freedomain.org" });
    } catch (err) {
      console.error("Failed to load domain details:", err);
    }
  };

  const handleAddDnsRecord = async (e) => {
    e.preventDefault();
    setDnsError("");
    setDnsSubmitting(true);

    try {
      const res = await api.addDnsRecord(selectedDomain.id, {
        recordType: newRecordType,
        name: newRecordName,
        value: newRecordValue,
        ttl: Number(newRecordTtl) || 3600,
        priority: newRecordType === "MX" ? Number(newRecordPriority) : null
      });

      setDnsRecords([...dnsRecords, res.record]);
      setShowAddDns(false);
      setNewRecordName("@");
      setNewRecordValue("");
      setNewRecordPriority("");
    } catch (err) {
      setDnsError(err.message || "Failed to add DNS record.");
    } finally {
      setDnsSubmitting(false);
    }
  };

  const handleDeleteDnsRecord = async (recordId) => {
    if (!confirm("Are you sure you want to delete this DNS record?")) return;
    try {
      await api.deleteDnsRecord(selectedDomain.id, recordId);
      setDnsRecords(dnsRecords.filter(r => r.id !== recordId));
    } catch (err) {
      alert("Failed to delete record: " + err.message);
    }
  };

  const handleSaveNameservers = async (e) => {
    e.preventDefault();
    setNsSaving(true);
    setNsFeedback("");
    try {
      const res = await api.updateNameservers(selectedDomain.id, nameservers);
      setNsFeedback(res.message || "Nameservers successfully updated!");
      setTimeout(() => setNsFeedback(""), 4000);
    } catch (err) {
      setNsFeedback("Error: " + err.message);
    } finally {
      setNsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            User Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your subsidized domains, DNS zone configurations, and grant requests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onGoSearch}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Find Another Domain</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 my-6">
        <button
          onClick={() => setActiveTab("domains")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "domains"
              ? "bg-slate-800 text-white border border-slate-700 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          My Domains ({domains.length})
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "applications"
              ? "bg-slate-800 text-white border border-slate-700 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Grant Applications ({applications.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
          <span className="text-xs font-semibold">Loading your platform records...</span>
        </div>
      ) : activeTab === "applications" ? (
        
        /* Applications List */
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
              <Clock className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No subsidy requests found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                You haven't requested a ₹0 domain grant yet. Search available .com or .in domains to apply!
              </p>
              <button
                onClick={onGoSearch}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Search Available Domains
              </button>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-black text-white">{app.domain_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {app.purpose_category}
                    </span>
                    {app.status === "fulfilled" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Approved & Registered
                      </span>
                    )}
                    {app.status === "pending" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Under Review
                      </span>
                    )}
                    {app.status === "rejected" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{app.project_title}</p>
                  <p className="text-xs text-slate-400 line-clamp-1">{app.project_description}</p>
                  {app.admin_notes && (
                    <div className="text-[11px] text-slate-400 mt-1 italic">
                      Reviewer Note: {app.admin_notes}
                    </div>
                  )}
                </div>

                <div className="text-right sm:self-center shrink-0">
                  <div className="text-xs text-slate-400">
                    Grant Value: <strong className="text-emerald-400">₹{app.subsidized_amount_inr} (100% Free)</strong>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Submitted: {new Date(app.created_at).toLocaleDateString()}
                  </div>
                  {app.status === "fulfilled" && (
                    <button
                      onClick={() => {
                        setActiveTab("domains");
                        const matched = domains.find(d => d.domain_name === app.domain_name);
                        if (matched) handleSelectDomain(matched);
                      }}
                      className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                    >
                      Manage DNS & Nameservers →
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      ) : (

        /* My Domains Grid & Management */
        <div>
          {domains.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
              <Globe className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No active registered domains</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                When your ₹0 subsidy application is approved by the admin, your registered domain and DNS control will appear here.
              </p>
              <button
                onClick={onGoSearch}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Apply for a Domain
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Domain List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Registered Domains
                </h3>
                {domains.map((dom) => (
                  <div
                    key={dom.id}
                    onClick={() => handleSelectDomain(dom)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedDomain?.id === dom.id
                        ? "bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white">{dom.domain_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {dom.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                      <div>Registrar: <span className="text-slate-300 font-medium">{dom.registrar_provider}</span></div>
                      <div>Expiry Date: <span className="text-slate-300 font-medium">{new Date(dom.expiry_date).toLocaleDateString()}</span></div>
                      <div>Order Ref: <span className="font-mono text-slate-300">{dom.registrar_order_id}</span></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: DNS and Nameserver Management */}
              {selectedDomain ? (
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Domain Overview Banner */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-white">{selectedDomain.domain_name}</h2>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Registrar Sync
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Subsidized 1st Year • 100% Ad-Free • Full DNS Zone Control
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">WHOIS Privacy</span>
                      <div className="text-xs font-bold text-emerald-400">Protected / Hidden</div>
                    </div>
                  </div>

                  {/* Section 1: Nameserver Management */}
                  <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Server className="w-5 h-5 text-teal-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">Nameserver Configuration</h3>
                          <p className="text-[11px] text-slate-400">
                            Route to FreeDomain Smart DNS or configure custom external nameservers (Cloudflare, AWS, etc.)
                          </p>
                        </div>
                      </div>
                    </div>

                    {nsFeedback && (
                      <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        nsFeedback.startsWith("Error")
                          ? "bg-red-500/10 border border-red-500/20 text-red-300"
                          : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                      }`}>
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{nsFeedback}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveNameservers} className="space-y-4 text-xs">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                          <input
                            type="radio"
                            name="nsMode"
                            checked={nameservers.mode === "default"}
                            onChange={() => setNameservers({
                              ...nameservers,
                              mode: "default",
                              ns1: "ns1.freedomain.org",
                              ns2: "ns2.freedomain.org"
                            })}
                            className="text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                          />
                          <span>FreeDomain Default DNS (Recommended)</span>
                        </label>

                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                          <input
                            type="radio"
                            name="nsMode"
                            checked={nameservers.mode === "custom"}
                            onChange={() => setNameservers({ ...nameservers, mode: "custom" })}
                            className="text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                          />
                          <span>Custom Nameservers (e.g. Cloudflare)</span>
                        </label>
                      </div>

                      {nameservers.mode === "custom" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nameserver 1 *</label>
                            <input
                              type="text"
                              required
                              value={nameservers.ns1 || ""}
                              onChange={(e) => setNameservers({ ...nameservers, ns1: e.target.value })}
                              placeholder="e.g. ns1.cloudflare.com"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nameserver 2 *</label>
                            <input
                              type="text"
                              required
                              value={nameservers.ns2 || ""}
                              onChange={(e) => setNameservers({ ...nameservers, ns2: e.target.value })}
                              placeholder="e.g. ns2.cloudflare.com"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nameserver 3 (Optional)</label>
                            <input
                              type="text"
                              value={nameservers.ns3 || ""}
                              onChange={(e) => setNameservers({ ...nameservers, ns3: e.target.value })}
                              placeholder="Optional"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nameserver 4 (Optional)</label>
                            <input
                              type="text"
                              value={nameservers.ns4 || ""}
                              onChange={(e) => setNameservers({ ...nameservers, ns4: e.target.value })}
                              placeholder="Optional"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={nsSaving}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        {nsSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                        <span>Save Nameservers</span>
                      </button>
                    </form>
                  </div>

                  {/* Section 2: DNS Zone Records Management */}
                  <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">DNS Zone Records</h3>
                          <p className="text-[11px] text-slate-400">
                            Configure host mapping (A, CNAME, TXT, MX) for Vercel, Netlify, or mail
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowAddDns(!showAddDns)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-emerald-400 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Record</span>
                      </button>
                    </div>

                    {/* Add Record Form */}
                    {showAddDns && (
                      <form onSubmit={handleAddDnsRecord} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                        <div className="font-bold text-white text-xs">Add New DNS Record</div>
                        
                        {dnsError && (
                          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px]">
                            {dnsError}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Type</label>
                            <select
                              value={newRecordType}
                              onChange={(e) => setNewRecordType(e.target.value)}
                              className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
                            >
                              <option value="A">A (IPv4 Address)</option>
                              <option value="AAAA">AAAA (IPv6 Address)</option>
                              <option value="CNAME">CNAME (Alias)</option>
                              <option value="TXT">TXT (Verification/SPF)</option>
                              <option value="MX">MX (Mail Exchange)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Host / Name</label>
                            <input
                              type="text"
                              required
                              value={newRecordName}
                              onChange={(e) => setNewRecordName(e.target.value)}
                              placeholder="@ or www"
                              className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-slate-400 mb-1">Target / Value</label>
                            <input
                              type="text"
                              required
                              value={newRecordValue}
                              onChange={(e) => setNewRecordValue(e.target.value)}
                              placeholder={newRecordType === "A" ? "192.0.2.1" : "cname.vercel-dns.com"}
                              className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        {newRecordType === "MX" && (
                          <div className="w-32">
                            <label className="block text-[10px] text-slate-400 mb-1">Priority</label>
                            <input
                              type="number"
                              required
                              value={newRecordPriority}
                              onChange={(e) => setNewRecordPriority(e.target.value)}
                              placeholder="10"
                              className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none"
                            />
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowAddDns(false)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={dnsSubmitting}
                            className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                          >
                            {dnsSubmitting ? "Adding..." : "Add Record"}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Records Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                          <tr>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Host / Name</th>
                            <th className="px-4 py-3">Target / Value</th>
                            <th className="px-4 py-3">TTL</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {dnsRecords.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                                No custom DNS records configured yet. Click "Add Record" to connect your domain.
                              </td>
                            </tr>
                          ) : (
                            dnsRecords.map((rec) => (
                              <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold text-[11px]">
                                    {rec.record_type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-white">{rec.name}</td>
                                <td className="px-4 py-3 font-mono text-slate-300 max-w-xs truncate">{rec.value}</td>
                                <td className="px-4 py-3 text-slate-400">{rec.ttl}s</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDnsRecord(rec.id)}
                                    title="Delete Record"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>

                </div>
              ) : null}

            </div>
          )}
        </div>

      )}

    </div>
  );
}
