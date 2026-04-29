import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthNavigation from "../../components/AuthNavigation";
import RepoCard from "../../components/RepoCard";
import {
  Loader2,
  Github,
  AlertCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import SEO from "../../components/SEO";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useRepos } from "../../hooks/useRepos";
import { useAuth } from "../../context/AuthContext";
import { api, ENDPOINTS } from "../api";
import { usePostHog } from "@posthog/react";

const FILTER_TABS = [
  { key: "all", label: "All Repositories" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

const REPOS_PER_PAGE = 12;

const Home = () => {
  const { user } = useRequireAuth();
  const { setUser } = useAuth();
  const { repos, setRepos, loading, error, fetchRepos } = useRepos(user);
  const posthog = usePostHog();
  const [filter, setFilter] = useState("all"); // all, active, inactive
  const [searchQuery, setSearchQuery] = useState("");
  const [reposPage, setReposPage] = useState(1);

  const handleDismissReposNotification = async () => {
    try {
      await api.post(ENDPOINTS.DISMISS_REPOS_NOTIFICATION);
      setUser((prev) => ({ ...prev, reposDeactivatedNotification: false }));
    } catch {
      // Non-critical — banner just stays visible if the request fails
    }
  };

  const handleSilentToggle = (repoId) => {
    setRepos((prevRepos) =>
      prevRepos.map((repo) =>
        repo.id === repoId ? { ...repo, activated: !repo.activated } : repo,
      ),
    );
  };

  const filteredRepos = repos.filter((repo) => {
    let matchesFilter = true;
    if (filter === "active") matchesFilter = repo.activated;
    if (filter === "inactive") matchesFilter = !repo.activated;

    const matchesSearch =
      searchQuery === "" ||
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.owner &&
        repo.owner.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const activeCount = repos.filter((r) => r.activated).length;

  const totalReposPages = Math.max(
    1,
    Math.ceil(filteredRepos.length / REPOS_PER_PAGE),
  );
  const paginatedRepos = filteredRepos.slice(
    (reposPage - 1) * REPOS_PER_PAGE,
    reposPage * REPOS_PER_PAGE,
  );
  const repoPaginationItems = Array.from(
    { length: totalReposPages },
    (_, index) => index + 1,
  )
    .filter(
      (page) =>
        page === 1 ||
        page === totalReposPages ||
        Math.abs(page - reposPage) <= 1,
    )
    .reduce((acc, page, index, pages) => {
      if (index > 0 && page - pages[index - 1] > 1) {
        acc.push("…");
      }
      acc.push(page);
      return acc;
    }, []);

  return (
    <>
      <SEO
        title="Dashboard - DaemonDoc | Manage Your Repositories"
        description="Manage AI-powered README updates for your GitHub repositories. View, enable, and configure automatic documentation generation."
        ogUrl="https://daemondoc.online/home"
        canonical="https://daemondoc.online/home"
      />
      <div className="min-h-screen overflow-x-hidden bg-linear-to-b from-white via-slate-50/70 to-white font-sans text-slate-900 selection:bg-indigo-100">
        <AuthNavigation />

        {/* One-time banner: shown when repos were auto-deactivated due to free plan limit */}
        <AnimatePresence>
          {user?.reposDeactivatedNotification && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative z-20 mx-4 mt-20 sm:mx-6 lg:mx-8"
            >
              <div className="mx-auto flex max-w-7xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-amber-500"
                />
                <div className="flex-1 text-sm text-amber-800">
                  <span className="font-bold">
                    Some repositories were deactivated.
                  </span>{" "}
                  Your free plan supports up to 5 active repos. Repos beyond
                  that limit were automatically deactivated.{" "}
                  <span className="font-semibold">Upgrade to Pro</span> for
                  unlimited active repositories.
                </div>
                <button
                  onClick={handleDismissReposNotification}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded-lg p-1 text-amber-500 transition-colors hover:bg-amber-100"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-24 left-[-8rem] h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute top-52 right-[-6rem] h-80 w-80 rounded-full bg-sky-100/40 blur-3xl" />
        </div>

        <div className="relative px-4 pt-22 pb-14 sm:px-6 sm:pt-24 sm:pb-16">
          <div className="mx-auto max-w-7xl">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-10"
            >
              <div className="mb-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-1 w-8 rounded-full bg-blue-600" />
                    <span className="font-mono text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                      Repository System
                    </span>
                  </div>
                  <h1 className="mb-3 text-3xl leading-none font-black tracking-tighter text-slate-900 uppercase sm:text-5xl">
                    Repositories
                  </h1>
                  <p className="max-w-2xl text-sm font-medium tracking-tight text-slate-500 sm:text-base">
                    Manage AI-powered README updates for your GitHub
                    repositories
                  </p>
                </div>
                <div className="w-full rounded-[1.5rem] border border-slate-200 bg-white/80 p-2 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:w-auto sm:rounded-[1.75rem]">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      posthog?.capture("repos_refreshed");
                      fetchRepos();
                    }}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#1d4ed8] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1e40af] disabled:opacity-50 sm:w-auto sm:rounded-[1.1rem] sm:px-5"
                  >
                    <RefreshCw
                      size={16}
                      className={loading ? "animate-spin" : ""}
                    />
                    Refresh list
                  </motion.button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                <div className="rounded-[1.5rem] border border-slate-200/60 bg-white/90 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] sm:rounded-[2rem] sm:p-5">
                  <p className="mb-1 font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
                    Total
                  </p>
                  <p className="text-xl font-black text-slate-900 sm:text-2xl">
                    {repos.length}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/80 p-4 shadow-[0_16px_40px_-28px_rgba(29,78,216,0.22)] sm:rounded-[2rem] sm:p-5">
                  <p className="mb-1 font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
                    Active
                  </p>
                  <p className="text-xl font-black text-blue-700 sm:text-2xl">
                    {activeCount}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/60 bg-slate-50/80 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.22)] sm:rounded-[2rem] sm:p-5">
                  <p className="mb-1 font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
                    Inactive
                  </p>
                  <p className="text-xl font-black text-slate-600 sm:text-2xl">
                    {repos.length - activeCount}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-sky-100 bg-sky-50/80 p-4 shadow-[0_16px_40px_-28px_rgba(14,165,233,0.2)] sm:rounded-[2rem] sm:p-5">
                  <p className="mb-1 font-mono text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase">
                    Private
                  </p>
                  <p className="text-xl font-black text-sky-600 sm:text-2xl">
                    {repos.filter((r) => r.private).length}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Filter Tabs and Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="mb-8 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white/75 p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:flex-row sm:items-center sm:rounded-[2rem] sm:p-4"
            >
              {/* Filter Tabs */}
              <div className="-mx-1 flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setFilter(tab.key);
                      setReposPage(1);
                    }}
                    className={`shrink-0 rounded-xl px-3 py-2.5 text-sm font-bold transition-all sm:px-4 ${
                      filter === tab.key
                        ? "bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full flex-1 sm:max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setReposPage(1);
                  }}
                  placeholder="Search repositories..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-10 pl-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setReposPage(1);
                    }}
                    className="absolute inset-y-0 right-0 flex items-center rounded-r-xl pr-3 transition-colors hover:bg-slate-50"
                  >
                    <X
                      size={18}
                      className="text-slate-400 hover:text-slate-600"
                    />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Content */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2
                  size={48}
                  className="mb-4 animate-spin text-blue-500"
                />
                <p className="font-medium text-slate-600">
                  Loading your repositories...
                </p>
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2rem] border border-rose-200 bg-white p-8 text-center shadow-[0_16px_40px_-30px_rgba(244,63,94,0.35)]"
              >
                <AlertCircle size={48} className="mx-auto mb-4 text-rose-500" />
                <h3 className="mb-2 text-lg font-semibold text-rose-900">
                  Failed to load repositories
                </h3>
                <p className="mb-4 text-rose-700">{error}</p>
                <button
                  onClick={fetchRepos}
                  className="rounded-full bg-[#1d4ed8] px-6 py-3 font-semibold text-white transition-all hover:bg-[#1e40af]"
                >
                  Try Again
                </button>
              </motion.div>
            ) : filteredRepos.length > 0 ? (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
                >
                  {paginatedRepos.map((repo, index) => (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(index * 0.03, 0.3),
                        ease: "easeOut",
                      }}
                      style={{ willChange: "transform, opacity" }}
                    >
                      <RepoCard
                        repo={repo}
                        showToggle={true}
                        onToggle={() => handleSilentToggle(repo.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination Bar */}
                <div className="mt-8 min-h-[3.5rem] border-t border-dashed border-slate-200 pt-4">
                  {totalReposPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400">
                        {filteredRepos.length} repo
                        {filteredRepos.length !== 1 ? "s" : ""} · page{" "}
                        {reposPage} of {totalReposPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setReposPage((p) => Math.max(1, p - 1))
                          }
                          disabled={reposPage <= 1}
                          className="rounded-[0.9rem] border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
                        >
                          ← Prev
                        </button>
                        {repoPaginationItems.map((item, index) =>
                          item === "…" ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-1 text-xs text-slate-400"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setReposPage(item)}
                              className={`rounded-[0.9rem] px-3 py-1.5 text-xs font-bold transition-colors ${
                                item === reposPage
                                  ? "bg-[#1d4ed8] text-white shadow-sm shadow-blue-500/20"
                                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {item}
                            </button>
                          ),
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setReposPage((p) =>
                              Math.min(totalReposPages, p + 1),
                            )
                          }
                          disabled={reposPage >= totalReposPages}
                          className="rounded-[0.9rem] border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      {filteredRepos.length} repo
                      {filteredRepos.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 p-12 text-center shadow-[0_16px_40px_-28px_rgba(15,23,42,0.25)]"
              >
                <Github size={64} className="mx-auto mb-4 text-blue-300" />
                <h3 className="mb-2 text-xl font-black tracking-tight text-slate-900 uppercase">
                  No repositories found
                </h3>
                <p className="text-slate-600">
                  {filter === "active"
                    ? "You haven't activated any repositories yet. Toggle the switch on a repository to enable AI updates."
                    : filter === "inactive"
                      ? "All your repositories have AI updates enabled!"
                      : "Connect your GitHub account to see your repositories here."}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
