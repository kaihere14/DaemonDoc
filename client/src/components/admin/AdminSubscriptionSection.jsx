/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
import {
  Crown,
  Search,
  ChevronRight,
  Loader2,
  UserX,
  IndianRupee,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, ENDPOINTS } from "../../lib/api";
import { toast } from "sonner";

const formatPrice = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

// ── Revoke confirm modal ──────────────────────────────────────────────────────
const RevokeModal = ({ user, onConfirm, onClose, isLoading }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X size={18} />
        </button>
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50">
          <UserX size={26} className="text-rose-500" />
        </div>
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">
          Confirm Action
        </p>
        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">
          Revoke Pro Plan
        </h3>
        <p className="text-sm leading-relaxed text-slate-500 mb-6">
          This will move{" "}
          <span className="font-semibold text-slate-700">
            @{user.githubUsername || user.email}
          </span>{" "}
          back to the <span className="font-semibold text-slate-700">free plan</span> immediately,
          resetting all limits and clearing expiry.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-[1.1rem] bg-rose-600 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-700 disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
            Revoke
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Price edit row ────────────────────────────────────────────────────────────
const PriceRow = ({ plan, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(plan.amount / 100));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const rupees = parseFloat(inputVal);
    if (isNaN(rupees) || rupees < 0) {
      toast.error("Enter a valid price in rupees");
      return;
    }
    const paise = Math.round(rupees * 100);
    setSaving(true);
    try {
      await onSave(plan.planId, paise);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setInputVal(String(plan.amount / 100));
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between rounded-[1.35rem] border border-slate-200 bg-slate-50/70 px-5 py-4">
      <div>
        <p className="text-sm font-black uppercase tracking-tight text-slate-900">
          {plan.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {plan.interval} · {plan.billingDays} days
        </p>
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <div className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5">
              <IndianRupee size={13} className="text-slate-400" />
              <input
                type="number"
                min="0"
                step="1"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-20 text-sm font-semibold text-slate-900 outline-none bg-transparent"
                autoFocus
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button
              onClick={handleCancel}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-black text-slate-900">
              {formatPrice(plan.amount)}
            </span>
            <button
              onClick={() => setEditing(true)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AdminSubscriptionSection = ({ sectionNumber = "03" }) => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

  const fetchUsers = useCallback(async (targetPage = page) => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (planFilter) params.set("plan", planFilter);
      params.set("page", String(targetPage));
      const { data } = await api.get(`${ENDPOINTS.ADMIN_PAYMENT_USERS}?${params}`);
      setUsers(data.users || []);
      setMeta(data.meta || { total: 0, page: targetPage, pages: 1 });
    } catch {
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, [search, planFilter, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    fetchUsers(1);
  }, [search, planFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchUsers(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api.get(ENDPOINTS.PAYMENT_PLANS).then(({ data }) => {
      setPlans(data.plans.filter((p) => p.interval !== "free"));
    }).catch(() => toast.error("Failed to load plans")).finally(() => setPlansLoading(false));
  }, []);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevokeLoading(true);
    try {
      await api.post(ENDPOINTS.ADMIN_REVOKE_PLAN, { userId: revokeTarget._id });
      toast.success(`@${revokeTarget.githubUsername || revokeTarget.email} moved to free plan`);
      setRevokeTarget(null);
      fetchUsers(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke plan");
    } finally {
      setRevokeLoading(false);
    }
  };

  const handlePriceSave = async (planId, paise) => {
    try {
      await api.patch(ENDPOINTS.ADMIN_UPDATE_PLAN_PRICE, { planId, amount: paise });
      toast.success("Price updated");
      setPlans((prev) =>
        prev.map((p) => (p.planId === planId ? { ...p, amount: paise } : p))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update price");
      throw err;
    }
  };

  return (
    <section className="mt-16">
      <div className="mb-4">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
          Section {sectionNumber}
        </p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl">
          Subscriptions
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.32)] sm:p-8 space-y-10"
      >
        {/* Pricing editor */}
        <div>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
            <IndianRupee size={28} strokeWidth={1.5} />
          </div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
            Plan Pricing
          </p>
          <h3 className="mt-3 text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl">
            Edit Plan Prices
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Update the amount charged for each paid plan. Changes take effect for new purchases immediately.
          </p>
          <div className="mt-6 space-y-3">
            {plansLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 size={16} className="animate-spin" /> Loading plans…
              </div>
            ) : (
              plans.map((plan) => (
                <PriceRow key={plan.planId} plan={plan} onSave={handlePriceSave} />
              ))
            )}
          </div>
        </div>

        <div className="border-t border-dashed border-slate-200" />

        {/* User plan management */}
        <div>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500">
            <Crown size={28} strokeWidth={1.5} />
          </div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
            User Plans
          </p>
          <h3 className="mt-3 text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl">
            Manage User Access
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Search users and revoke pro access to move them back to the free plan.
          </p>

          {/* Filters */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by username or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="">All plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          {/* User list */}
          <div className={`mt-4 space-y-2 transition-opacity duration-200 ${usersLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            {/* Skeleton — shown only when there are no rows yet (initial load) */}
            {usersLoading && users.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-[1.35rem] border border-slate-200 bg-slate-50/70 px-5 py-3.5 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-slate-200 shrink-0 animate-pulse" />
                    <div className="space-y-1.5 min-w-0">
                      <div className="h-3 w-32 rounded-full bg-slate-200 animate-pulse" />
                      <div className="h-2.5 w-20 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-5 w-10 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-7 w-16 rounded-[0.9rem] bg-slate-100 animate-pulse" />
                  </div>
                </div>
              ))
            ) : !usersLoading && users.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No users found.</p>
            ) : (
              users.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between rounded-[1.35rem] border border-slate-200 bg-slate-50/70 px-5 py-3.5 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="h-9 w-9 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-xl bg-slate-200 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {u.githubUsername ? `@${u.githubUsername}` : u.email || "—"}
                      </p>
                      {u.email && u.githubUsername && (
                        <p className="truncate text-xs text-slate-400">{u.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                        u.plan === "pro"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {u.plan}
                    </span>
                    {u.plan === "pro" && (
                      <button
                        onClick={() => setRevokeTarget(u)}
                        className="inline-flex items-center gap-1.5 rounded-[0.9rem] border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <UserX size={13} />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="mt-5 flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
              <p className="text-xs text-slate-400">
                {meta.total} user{meta.total !== 1 ? "s" : ""} · page {meta.page} of {meta.pages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || usersLoading}
                  className="rounded-[0.9rem] border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: meta.pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === meta.pages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "…" ? (
                      <span key={`ellipsis-${idx}`} className="text-xs text-slate-400 px-1">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        disabled={usersLoading}
                        className={`rounded-[0.9rem] px-3 py-1.5 text-xs font-bold transition-colors ${
                          item === page
                            ? "bg-[#1d4ed8] text-white shadow-sm shadow-blue-500/20"
                            : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                  disabled={page >= meta.pages || usersLoading}
                  className="rounded-[0.9rem] border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
          {meta.pages <= 1 && meta.total > 0 && (
            <p className="mt-3 text-xs text-slate-400">
              {meta.total} user{meta.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </motion.div>

      {/* Revoke confirm modal */}
      <AnimatePresence>
        {revokeTarget && (
          <RevokeModal
            user={revokeTarget}
            onConfirm={handleRevoke}
            onClose={() => setRevokeTarget(null)}
            isLoading={revokeLoading}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default AdminSubscriptionSection;
