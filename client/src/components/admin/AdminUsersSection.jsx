import React, { useState, useEffect, useCallback } from "react";
import { Users, Search, Shield, GitBranch } from "lucide-react";
import { motion } from "framer-motion";
import { api, ENDPOINTS } from "../../lib/api";
import { toast } from "sonner";

const formatJoinDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const AdminUsersSection = ({ sectionNumber = "03" }) => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(true);

  // Debounce the search box so typing doesn't fire a request per keystroke.
  // Resetting the page here (rather than in a second effect) keeps both updates
  // in one render, so a search change triggers exactly one fetch.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = useCallback(
    async (targetPage) => {
      setUsersLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        params.set("page", String(targetPage));
        const { data } = await api.get(`${ENDPOINTS.ADMIN_USERS}?${params}`);
        setUsers(data.users || []);
        setMeta(data.meta || { total: 0, page: targetPage, pages: 1 });
      } catch {
        toast.error("Failed to load users");
      } finally {
        setUsersLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    // Fetching on mount/page/search change is the intent here; the loading flag
    // it sets is the standard pattern used elsewhere in the app (see useRepos).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers(page);
  }, [page, fetchUsers]);

  return (
    <section className="mt-16">
      <div className="mb-4">
        <p className="font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
          Section {sectionNumber}
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
          All Users
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-panel-lg shadow-raised overflow-hidden border border-slate-200 bg-white/90 p-6 sm:p-8"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
          <Users size={28} strokeWidth={1.5} />
        </div>
        <p className="font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
          User Directory
        </p>
        <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 uppercase sm:text-3xl">
          Browse All Users
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Every registered account, newest first. Search by GitHub username or
          email.
        </p>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by username or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="rounded-action w-full border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-sm text-slate-800 placeholder-slate-400 transition outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* User list */}
        <div
          className={`mt-4 space-y-2 transition-opacity duration-200 ${usersLoading ? "pointer-events-none opacity-50" : "opacity-100"}`}
        >
          {/* Skeleton — shown only when there are no rows yet (initial load) */}
          {usersLoading && users.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-tile flex items-center justify-between gap-3 border border-slate-200 bg-slate-50/70 px-5 py-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-slate-200" />
                  <div className="min-w-0 space-y-1.5">
                    <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-2.5 w-20 animate-pulse rounded-full bg-slate-100" />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="h-5 w-10 animate-pulse rounded-full bg-slate-200" />
                  <div className="rounded-control h-7 w-16 animate-pulse bg-slate-100" />
                </div>
              </div>
            ))
          ) : !usersLoading && users.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No users found.
            </p>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                className="rounded-tile flex items-center justify-between gap-3 border border-slate-200 bg-slate-50/70 px-5 py-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {u.avatarUrl ? (
                    <img
                      src={u.avatarUrl}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-200" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {u.githubUsername
                        ? `@${u.githubUsername}`
                        : u.email || "—"}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {u.email && u.githubUsername
                        ? `${u.email} · joined ${formatJoinDate(u.createdAt)}`
                        : `Joined ${formatJoinDate(u.createdAt)}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {u.admin && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black tracking-wider text-blue-700 uppercase">
                      <Shield size={11} />
                      Admin
                    </span>
                  )}
                  <span className="rounded-control inline-flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                    <GitBranch size={13} className="text-slate-400" />
                    {u.activeRepoCount}
                    <span className="hidden sm:inline">
                      {u.activeRepoCount === 1 ? "repo" : "repos"}
                    </span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="mt-5 flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
            <p className="text-xs text-slate-400">
              {meta.total} user{meta.total !== 1 ? "s" : ""} · page {meta.page}{" "}
              of {meta.pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || usersLoading}
                className="rounded-control border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
              >
                ← Prev
              </button>
              {Array.from({ length: meta.pages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === meta.pages || Math.abs(p - page) <= 1,
                )
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-xs text-slate-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      disabled={usersLoading}
                      className={`rounded-control px-3 py-1.5 text-xs font-bold transition-colors ${
                        item === page
                          ? "bg-primary text-white shadow-sm shadow-blue-500/20"
                          : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              <button
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                disabled={page >= meta.pages || usersLoading}
                className="rounded-control border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
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
      </motion.div>
    </section>
  );
};

export default AdminUsersSection;
