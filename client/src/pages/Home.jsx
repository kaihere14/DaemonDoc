/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { motion } from "framer-motion";
import AuthNavigation from "../components/AuthNavigation";
import RepoCard from "../components/RepoCard";
import {
  Loader2,
  Github,
  AlertCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import SEO from "../components/SEO";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useRepos } from "../hooks/useRepos";

const FILTER_TABS = [
  { key: "all", label: "All Repositories" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

const Home = () => {
  const { user } = useRequireAuth();
  const { repos, setRepos, loading, error, fetchRepos } = useRepos(user);
  const [filter, setFilter] = useState("all"); // all, active, inactive
  const [searchQuery, setSearchQuery] = useState("");

  const handleSilentToggle = (repoId) => {
    setRepos((prevRepos) =>
      prevRepos.map((repo) =>
        repo.id === repoId ? { ...repo, activated: !repo.activated } : repo,
      ),
    );
  };

  const filteredRepos = repos.filter((repo) => {
    // Apply status filter
    let matchesFilter = true;
    if (filter === "active") matchesFilter = repo.activated;
    if (filter === "inactive") matchesFilter = !repo.activated;

    // Apply search query
    const matchesSearch =
      searchQuery === "" ||
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.owner &&
        repo.owner.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const activeCount = repos.filter((r) => r.activated).length;

  return (
    <>
      <SEO
        title="Dashboard - DaemonDoc | Manage Your Repositories"
        description="Manage AI-powered README updates for your GitHub repositories. View, enable, and configure automatic documentation generation."
        ogUrl="https://daemondoc.online/home"
        canonical="https://daemondoc.online/home"
      />
      <div className="min-h-screen bg-linear-to-b from-white via-slate-50/70 to-white text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
        <AuthNavigation />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-24 left-[-8rem] h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute top-52 right-[-6rem] h-80 w-80 rounded-full bg-sky-100/40 blur-3xl" />
        </div>

        <div className="relative px-4 pb-14 pt-22 sm:px-6 sm:pb-16 sm:pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-10"
            >
              <div className="mb-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1 w-8 rounded-full bg-blue-600" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                      Repository System
                    </span>
                  </div>
                  <h1 className="mb-3 text-3xl font-black uppercase leading-none tracking-tighter text-slate-900 sm:text-5xl">
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
                    onClick={fetchRepos}
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
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">
                    Total
                  </p>
                  <p className="text-xl font-black text-slate-900 sm:text-2xl">
                    {repos.length}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/80 p-4 shadow-[0_16px_40px_-28px_rgba(29,78,216,0.22)] sm:rounded-[2rem] sm:p-5">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">
                    Active
                  </p>
                  <p className="text-xl font-black text-blue-700 sm:text-2xl">
                    {activeCount}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/60 bg-slate-50/80 p-4 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.22)] sm:rounded-[2rem] sm:p-5">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">
                    Inactive
                  </p>
                  <p className="text-xl font-black text-slate-600 sm:text-2xl">
                    {repos.length - activeCount}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-sky-100 bg-sky-50/80 p-4 shadow-[0_16px_40px_-28px_rgba(14,165,233,0.2)] sm:rounded-[2rem] sm:p-5">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-1">
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
                    onClick={() => setFilter(tab.key)}
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search repositories..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-slate-50 rounded-r-xl transition-colors"
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
                  className="text-blue-500 animate-spin mb-4"
                />
                <p className="text-slate-600 font-medium">
                  Loading your repositories...
                </p>
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-rose-200 rounded-[2rem] p-8 text-center shadow-[0_16px_40px_-30px_rgba(244,63,94,0.35)]"
              >
                <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-rose-900 mb-2">
                  Failed to load repositories
                </h3>
                <p className="text-rose-700 mb-4">{error}</p>
                <button
                  onClick={fetchRepos}
                  className="bg-[#1d4ed8] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1e40af] transition-all"
                >
                  Try Again
                </button>
              </motion.div>
            ) : filteredRepos.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
              >
                {filteredRepos.map((repo, index) => (
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
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 border border-dashed border-slate-300 rounded-[2rem] p-12 text-center shadow-[0_16px_40px_-28px_rgba(15,23,42,0.25)]"
              >
                <Github size={64} className="text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
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
