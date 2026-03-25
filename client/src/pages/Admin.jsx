import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthNavigation from "../components/AuthNavigation";
import { api, ENDPOINTS } from "../lib/api";
import { toast } from "sonner";
import {
  Send,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Loader2,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  const [isRecipientsLoading, setIsRecipientsLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [isAnalyticsRefreshing, setIsAnalyticsRefreshing] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const shouldReduceMotion = useReducedMotion();

  // Form state
  const [subject, setSubject] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [intro, setIntro] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [primaryCTA, setPrimaryCTA] = useState("Try Now");
  const [date, setDate] = useState(new Date().toDateString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // Changes (unlimited)
  const [changes, setChanges] = useState([
    { tag: "", tagClass: "tag-improved", title: "", description: "" },
  ]);

  // Redirect if not admin
  React.useEffect(() => {
    if (user && !user.admin) {
      navigate("/home");
    }
  }, [user, navigate]);

  React.useEffect(() => {
    if (!showEmailModal || !user?.admin) {
      return;
    }

    const loadRecipients = async () => {
      setIsRecipientsLoading(true);

      try {
        const response = await api.get("/api/email/recipients");
        const recipients = Array.isArray(response.data?.recipients)
          ? response.data.recipients
          : [];

        setRecipientOptions(recipients);
        setSelectedRecipientIds(recipients.map((recipient) => recipient.id));
      } catch (error) {
        console.error("Error loading recipients:", error);
        toast.error(
          error.response?.data?.message || "Failed to load email recipients",
        );
      } finally {
        setIsRecipientsLoading(false);
      }
    };

    loadRecipients();
  }, [showEmailModal, user]);

  React.useEffect(() => {
    if (!user?.admin) {
      return;
    }

    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) {
      setIsAnalyticsRefreshing(true);
    } else {
      setIsAnalyticsLoading(true);
    }

    try {
      const { data } = await api.get(ENDPOINTS.ADMIN_ANALYTICS);
      setAnalytics(data);
      setAnalyticsError("");
    } catch (error) {
      console.error("Error loading analytics:", error);
      setAnalyticsError(
        error.response?.data?.message || "Failed to load analytics",
      );
    } finally {
      setIsAnalyticsLoading(false);
      setIsAnalyticsRefreshing(false);
    }
  };

  const handleChangeUpdate = (index, field, value) => {
    const newChanges = [...changes];
    newChanges[index][field] = value;
    setChanges(newChanges);
  };

  const addChangeBlock = () => {
    setChanges([
      ...changes,
      { tag: "", tagClass: "tag-improved", title: "", description: "" },
    ]);
  };

  const removeChangeBlock = (index) => {
    setChanges(changes.filter((_, i) => i !== index));
  };

  const resetEmailForm = () => {
    setSubject("");
    setFeatureName("");
    setIntro("");
    setHeroDescription("");
    setPrimaryCTA("Try Now");
    setDate(new Date().toDateString());
    setYear(new Date().getFullYear().toString());
    setChanges([
      { tag: "", tagClass: "tag-improved", title: "", description: "" },
    ]);
    setRecipientOptions([]);
    setSelectedRecipientIds([]);
    setShowConfirmModal(false);
    setShowEmailModal(false);
    setCurrentStep(1);
  };

  const toggleRecipient = (recipientId) => {
    setSelectedRecipientIds((currentRecipients) =>
      currentRecipients.includes(recipientId)
        ? currentRecipients.filter((id) => id !== recipientId)
        : [...currentRecipients, recipientId],
    );
  };

  const selectAllRecipients = () => {
    setSelectedRecipientIds(recipientOptions.map((recipient) => recipient.id));
  };

  const clearAllRecipients = () => {
    setSelectedRecipientIds([]);
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!subject.trim()) {
        toast.error("Subject is required");
        return false;
      }
      if (!featureName.trim()) {
        toast.error("Feature name is required");
        return false;
      }
      if (selectedRecipientIds.length === 0) {
        toast.error("Select at least one recipient");
        return false;
      }
    } else if (currentStep === 2) {
      if (!intro.trim()) {
        toast.error("Intro text is required");
        return false;
      }
      if (!heroDescription.trim()) {
        toast.error("Feature description is required");
        return false;
      }
    }
    return true;
  };

  const goToNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowConfirmModal(true);
      }
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate changes
    const validChanges = changes.filter(
      (c) => c.tag && c.title && c.description,
    );

    const payload = {
      subject: subject.trim(),
      recipientUserIds: selectedRecipientIds,
      content: {
        featureName: featureName.trim(),
        intro: intro.trim(),
        heroDescription: heroDescription.trim(),
        primaryCTA: primaryCTA.trim() || "Try Now",
        date: date || new Date().toDateString(),
        year: year || new Date().getFullYear().toString(),
        ...(validChanges.length > 0 && { changes: validChanges }),
      },
    };

    setIsLoading(true);

    try {
      await api.post("/api/email/send", payload);
      toast.success(`Queued email for ${selectedRecipientIds.length} recipients`, {
        closeButton: false,
        duration: 3500,
      });
      resetEmailForm();
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(error.response?.data?.message || "Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  const closeEmailModal = () => {
    resetEmailForm();
  };

  const selectedRecipients = recipientOptions.filter((recipient) =>
    selectedRecipientIds.includes(recipient.id),
  );

  const selectedRecipientPreview = selectedRecipients
    .slice(0, 3)
    .map((recipient) => recipient.githubUsername || recipient.email);

  const completedSteps = Math.max(currentStep - 1, 0);
  const analyticsOverview = analytics?.overview;
  const analyticsBreakdown = analytics?.breakdown;
  const analyticsActivity = analytics?.activity || [];
  const analyticsTopRepos = analytics?.topRepos || [];

  const steps = [
    {
      number: 1,
      title: "Email Basics",
      description: "Set the subject and feature name",
      color: "from-blue-50 to-blue-50",
      borderColor: "border-blue-200",
      dotColor: "bg-blue-500",
    },
    {
      number: 2,
      title: "Description",
      description: "Write the hook and feature details",
      color: "from-slate-50 to-slate-50",
      borderColor: "border-slate-200",
      dotColor: "bg-slate-900",
    },
    {
      number: 3,
      title: "Changes",
      description: "Add any additional improvements",
      color: "from-slate-50 to-slate-50",
      borderColor: "border-slate-200",
      dotColor: "bg-slate-600",
    },
    {
      number: 4,
      title: "Review",
      description: "Customize and send",
      color: "from-slate-50 to-slate-50",
      borderColor: "border-slate-200",
      dotColor: "bg-slate-400",
    },
  ];

  const analyticsStats = [
    {
      label: "Users",
      value: analyticsOverview?.totalUsers || 0,
      tone: "text-slate-900",
    },
    {
      label: "Active Repos",
      value: analyticsOverview?.activeRepos || 0,
      tone: "text-blue-700",
    },
    {
      label: "Runs",
      value: analyticsOverview?.totalRuns || 0,
      tone: "text-sky-700",
    },
    {
      label: "Success Rate",
      value: analyticsOverview?.successRate || 0,
      suffix: "%",
      tone: "text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-slate-50/70 to-white relative overflow-x-hidden">
      <AuthNavigation />
      
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-24 left-[-8rem] h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute top-48 right-[-6rem] h-80 w-80 rounded-full bg-sky-100/45 blur-3xl" />
      </div>

      <div className="relative z-10 px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.32)] backdrop-blur-sm sm:rounded-[2.5rem] sm:p-8">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-1 w-8 rounded-full bg-blue-600" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                      Admin System
                    </span>
                  </div>
                  <h1 className="mb-3 text-3xl font-black uppercase leading-none tracking-tighter text-slate-900 sm:text-5xl">
                    Control Center
                  </h1>
                  <p className="max-w-2xl text-sm font-medium tracking-tight text-slate-500 sm:text-base">
                    Review platform health first, then launch audience updates from a dedicated broadcast workspace.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <section className="mb-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                  Section 01
                </p>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl">
                  Analytics
                </h2>
              </div>
              <button
                type="button"
                onClick={() => fetchAnalytics(true)}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 transition-all hover:border-blue-200 hover:text-blue-600"
              >
                <RefreshCw
                  size={14}
                  className={isAnalyticsRefreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.32)] sm:p-8"
            >
              <div className="mb-8 flex flex-col gap-5 border-b border-dashed border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-600 sm:h-16 sm:w-16">
                    <BarChart3 size={32} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                      System Analytics
                    </p>
                    <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-900">
                      Platform Health
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                      Live operational insight across repository automation, run reliability, and current activity trends.
                    </p>
                  </div>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                  Latest Activity
                  <span className="text-slate-700">
                    {formatAnalyticsTimestamp(analyticsOverview?.latestActivityAt)}
                  </span>
                </div>
              </div>

              {isAnalyticsLoading ? (
                <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
                  <Loader2 size={28} className="animate-spin text-blue-600" />
                  <div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Loading Analytics
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Aggregating repository activity and admin metrics.
                    </p>
                  </div>
                </div>
              ) : analyticsError ? (
                <div className="flex min-h-[320px] flex-1 flex-col justify-between rounded-[1.5rem] border border-rose-100 bg-rose-50/60 p-5">
                  <div>
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-500">
                      <AlertCircle size={22} />
                    </div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-rose-500">
                      Analytics Error
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-rose-700">
                      {analyticsError}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchAnalytics(true)}
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-rose-700"
                  >
                    <RefreshCw size={14} />
                    Retry
                  </button>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: shouldReduceMotion ? 0 : 0.04,
                      },
                    },
                  }}
                  className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]"
                >
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {analyticsStats.map((stat) => (
                        <motion.div
                          key={stat.label}
                          variants={fadeUpVariant}
                          className="rounded-[1.35rem] border border-slate-200 bg-linear-to-b from-white to-slate-50/70 p-4"
                        >
                          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                            {stat.label}
                          </p>
                          <p className={`mt-2 text-2xl font-black ${stat.tone}`}>
                            <CountUpNumber
                              value={stat.value}
                              suffix={stat.suffix}
                            />
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      variants={fadeUpVariant}
                      className="rounded-[1.5rem] border border-slate-200 bg-linear-to-r from-blue-50/80 via-white to-white p-4 sm:p-5"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  boxShadow: [
                                    "0 8px 20px -12px rgba(59,130,246,0.20)",
                                    "0 10px 24px -12px rgba(59,130,246,0.28)",
                                    "0 8px 20px -12px rgba(59,130,246,0.20)",
                                  ],
                                }
                          }
                          transition={
                            shouldReduceMotion
                              ? undefined
                              : { repeat: Infinity, duration: 4.2, ease: "easeInOut" }
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200"
                        >
                          <Activity size={18} />
                        </motion.div>
                        <div>
                          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                            Live Pulse
                          </p>
                          <p className="text-lg font-black text-slate-900">
                            <CountUpNumber
                              value={analyticsOverview?.logsInLast24Hours || 0}
                            />{" "}
                            events in the last 24h
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {[
                          {
                            label: "Success",
                            value: analyticsBreakdown?.success || 0,
                            className: "bg-blue-50 text-blue-700",
                          },
                          {
                            label: "Failed",
                            value: analyticsBreakdown?.failed || 0,
                            className: "bg-rose-50 text-rose-600",
                          },
                          {
                            label: "Live",
                            value: analyticsOverview?.liveJobs || 0,
                            className: "bg-sky-50 text-sky-700",
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: shouldReduceMotion ? 0 : 0.12 + index * 0.04,
                              duration: shouldReduceMotion ? 0 : 0.24,
                            }}
                            className={`rounded-2xl px-3 py-3 ${item.className}`}
                          >
                            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                              {item.label}
                            </p>
                            <p className="mt-1 text-lg font-black">
                              <CountUpNumber value={item.value} />
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      variants={fadeUpVariant}
                      className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                            Weekly Activity
                          </p>
                          <p className="text-sm font-semibold text-slate-600">
                            Total log volume over the last 7 days
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          7 days
                        </span>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {analyticsActivity.map((day, index) => {
                          const height = Math.max(day.total * 16, 14);
                          return (
                            <motion.div
                              key={day.date}
                              initial={{ opacity: 0, y: 18 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: shouldReduceMotion ? 0 : 0.04 + index * 0.03,
                                duration: shouldReduceMotion ? 0 : 0.24,
                              }}
                              className="flex flex-col items-center gap-2"
                            >
                              <div className="flex h-28 w-full items-end rounded-2xl bg-slate-50 px-2 py-2">
                                <motion.div
                                  className="w-full rounded-xl bg-linear-to-t from-blue-600 to-sky-400"
                                  initial={{ height: "0%" }}
                                  animate={{ height: `${Math.min(height, 100)}%` }}
                                  transition={{
                                    delay: shouldReduceMotion ? 0 : 0.08 + index * 0.04,
                                    duration: shouldReduceMotion ? 0 : 0.4,
                                    ease: [0.2, 0.8, 0.2, 1],
                                  }}
                                />
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-black uppercase text-slate-700">
                                  <CountUpNumber value={day.total} duration={800} />
                                </p>
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                  {day.label}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>

                  <div className="space-y-5">
                    <motion.div
                      variants={fadeUpVariant}
                      className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5"
                    >
                      <div className="mb-4">
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                          Top Repositories
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-600">
                          Most active repos by automation events
                        </p>
                      </div>

                      <div className="space-y-3">
                        {analyticsTopRepos.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                            No repository activity has been recorded yet.
                          </div>
                        ) : (
                          analyticsTopRepos.map((repo, index) => (
                            <motion.div
                              key={`${repo.repoOwner}-${repo.repoName}`}
                              initial={{ opacity: 0, x: 18 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: shouldReduceMotion ? 0 : 0.08 + index * 0.04,
                                duration: shouldReduceMotion ? 0 : 0.22,
                              }}
                              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black uppercase tracking-tight text-slate-900">
                                  {repo.repoName}
                                </p>
                                <p className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                  {repo.repoOwner || "unknown owner"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-black text-blue-700">
                                  <CountUpNumber value={repo.count} duration={850} />
                                </p>
                                <p className="text-xs text-slate-400">
                                  {formatAnalyticsTimestamp(repo.lastEventAt)}
                                </p>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      variants={fadeUpVariant}
                      className="rounded-[1.5rem] border border-slate-200 bg-linear-to-b from-slate-50 to-white p-4 sm:p-5"
                    >
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                        Reliability Notes
                      </p>
                      <div className="mt-4 space-y-3">
                        {[
                          {
                            label: "Current queue",
                            value: `${analyticsOverview?.liveJobs || 0} live jobs`,
                          },
                          {
                            label: "Run health",
                            value: `${analyticsOverview?.successRate || 0}% success rate`,
                          },
                          {
                            label: "Recent pace",
                            value: `${analyticsOverview?.logsInLast24Hours || 0} events in 24h`,
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: shouldReduceMotion ? 0 : 0.08 + index * 0.04,
                              duration: shouldReduceMotion ? 0 : 0.22,
                            }}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                          >
                            <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                              {item.label}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              {item.value}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </section>

          <section>
            <div className="mb-4">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                Section 02
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl">
                Broadcast
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.32)] sm:p-8"
            >
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 sm:h-16 sm:w-16">
                    <Send size={32} strokeWidth={1.5} />
                  </div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                    Broadcast Flow
                  </p>
                  <h3 className="mt-3 text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl">
                    Send Product Updates
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                    Launch a polished feature announcement from a dedicated composer with audience selection, structured change blocks, and a final review pass before dispatch.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    "Select the exact audience before sending.",
                    "Structure the update with intro, detail, and change blocks.",
                    "Review delivery details before the queue is triggered.",
                  ].map((line) => (
                    <div
                      key={line}
                      className="rounded-[1.35rem] border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm font-semibold text-slate-700"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-dashed border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Open the composer when you’re ready to prepare the next announcement.
                </p>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-[1.1rem] bg-[#1d4ed8] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1e40af]"
                >
                  Open Composer
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          </section>

        </div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && !showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6"
            onClick={closeEmailModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.55)] sm:h-[90vh] lg:flex-row"
            >
              {/* Sidebar/Progress */}
              <div className="border-b border-slate-100 bg-linear-to-b from-slate-50 to-white p-5 sm:p-6 lg:w-72 lg:border-b-0 lg:border-r">
                <div className="mb-8 hidden lg:block">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <Send size={24} />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-slate-900">Broadcast</h3>
                  <p className="text-xs text-slate-500">Configure your update</p>
                </div>

                <div className="mb-5 rounded-[1.5rem] border border-blue-100 bg-blue-50/70 p-4">
                  <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    Progress
                  </p>
                  <p className="text-2xl font-black text-blue-700">
                    {currentStep}/4
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {completedSteps} steps completed
                  </p>
                </div>

                <div className="flex gap-3 overflow-x-auto lg:flex-col lg:gap-4">
                  {steps.map((step) => (
                    <div
                      key={step.number}
                      className={`min-w-[150px] rounded-2xl border p-3 transition-all lg:min-w-0 ${
                        currentStep >= step.number
                          ? "border-blue-100 bg-blue-50/70"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                          currentStep >= step.number ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-200 text-slate-400'
                        }`}>
                          {currentStep > step.number ? <Check size={14} /> : step.number}
                        </div>
                        <p className={`text-sm font-bold ${currentStep >= step.number ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.title}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Area */}
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6 sm:pb-4">
                  <div>
                    <p className="mb-1 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Step {currentStep}
                    </p>
                    <h2 className="text-xl font-black text-slate-900 sm:text-2xl">{steps[currentStep-1].title}</h2>
                  </div>
                  <button onClick={closeEmailModal} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
                  {/* Step 1: Email Basics */}
                  {currentStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 sm:space-y-6">
                      <div className="group">
                        <label className="mb-2 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 transition-colors group-focus-within:text-blue-600">Email Subject</label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="What's this update about?"
                          className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white sm:px-5 sm:py-4"
                        />
                      </div>

                      <div className="group">
                        <label className="mb-2 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 transition-colors group-focus-within:text-blue-600">Feature Name</label>
                        <input
                          type="text"
                          value={featureName}
                          onChange={(e) => setFeatureName(e.target.value)}
                          placeholder="The name of the highlight"
                          className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white sm:px-5 sm:py-4"
                        />
                      </div>

                      <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.28)] sm:rounded-[2rem] sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                              Audience
                            </p>
                            <p className="text-lg font-black text-slate-900">
                              {isRecipientsLoading
                                ? "Loading recipients..."
                                : `${selectedRecipientIds.length} of ${recipientOptions.length} recipients selected`}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Pick exactly who should receive this update before you send it.
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={selectAllRecipients}
                              disabled={isRecipientsLoading || recipientOptions.length === 0}
                              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                            >
                              Select all
                            </button>
                            <button
                              type="button"
                              onClick={clearAllRecipients}
                              disabled={isRecipientsLoading || selectedRecipientIds.length === 0}
                              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                          {!isRecipientsLoading && recipientOptions.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                              No eligible email recipients were found.
                            </div>
                          )}

                          {recipientOptions.map((recipient) => {
                            const isSelected = selectedRecipientIds.includes(recipient.id);

                            return (
                              <label
                                key={recipient.id}
                                className={`flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-blue-200 bg-blue-50/80"
                                    : "border-slate-200 bg-white"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleRecipient(recipient.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-slate-900">
                                    {recipient.githubUsername
                                      ? `@${recipient.githubUsername}`
                                      : recipient.email}
                                  </p>
                                  <p className="truncate text-sm text-slate-500">
                                    {recipient.email}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Description */}
                  {currentStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 sm:space-y-6">
                      <div className="group">
                        <label className="mb-2 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 transition-colors group-focus-within:text-blue-600">Hook / Intro</label>
                        <textarea
                          value={intro}
                          onChange={(e) => setIntro(e.target.value)}
                          placeholder="Capture their attention..."
                          className="h-24 w-full resize-none rounded-2xl border-2 border-transparent bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white sm:px-5 sm:py-4"
                        />
                      </div>

                      <div className="group">
                        <label className="mb-2 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 transition-colors group-focus-within:text-blue-600">Detailed Description</label>
                        <textarea
                          value={heroDescription}
                          onChange={(e) => setHeroDescription(e.target.value)}
                          placeholder="Go into the details..."
                          className="h-32 w-full resize-none rounded-2xl border-2 border-transparent bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white sm:px-5 sm:py-4"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Changes */}
                  {currentStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 sm:space-y-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">Add granular changes to this update</p>
                        <button onClick={addChangeBlock} className="rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-600 transition-all hover:bg-blue-600 hover:text-white">
                          Add Change
                        </button>
                      </div>

                      <div className="space-y-4">
                        {changes.map((change, index) => (
                          <div key={index} className="relative rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.2)] sm:p-5">
                            {changes.length > 1 && (
                              <button onClick={() => removeChangeBlock(index)} className="absolute right-4 top-4 text-slate-300 transition-colors hover:text-red-500">
                                <X size={16} />
                              </button>
                            )}
                            
                            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <label className="mb-1 block font-mono text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type</label>
                                <select
                                  value={change.tagClass}
                                  onChange={(e) => handleChangeUpdate(index, "tagClass", e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-blue-600"
                                >
                                  <option value="tag-new">New</option>
                                  <option value="tag-improved">Improved</option>
                                  <option value="tag-fixed">Fixed</option>
                                  <option value="tag-security">Security</option>
                                </select>
                              </div>
                              <div>
                                <label className="mb-1 block font-mono text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Label</label>
                                <input
                                  type="text"
                                  value={change.tag}
                                  onChange={(e) => handleChangeUpdate(index, "tag", e.target.value)}
                                  placeholder="e.g. HOT"
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-blue-600"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={change.title}
                                onChange={(e) => handleChangeUpdate(index, "title", e.target.value)}
                                placeholder="Change title"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none transition-all focus:border-blue-600"
                              />
                              <textarea
                                value={change.description}
                                onChange={(e) => handleChangeUpdate(index, "description", e.target.value)}
                                placeholder="Short explanation"
                                className="h-16 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-blue-600"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 sm:space-y-8">
                       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                        <div className="group">
                          <label className="mb-2 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">CTA Label</label>
                          <input
                            type="text"
                            value={primaryCTA}
                            onChange={(e) => setPrimaryCTA(e.target.value)}
                            className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white sm:px-5 sm:py-4"
                          />
                        </div>
                        <div className="group">
                          <label className="mb-2 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Display Date</label>
                          <input
                            type="text"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-2xl border-2 border-transparent bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white sm:px-5 sm:py-4"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4 sm:p-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                          <AlertCircle size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-blue-900">Almost there!</p>
                          <p className="text-sm text-blue-700/70">
                            You are about to send this update to {selectedRecipientIds.length} selected recipients. Double check the copy and the audience before you continue.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-slate-100 p-5 pt-4 sm:gap-4 sm:p-6 sm:pt-4">
                  <button
                    onClick={goToPrevStep}
                    disabled={currentStep === 1}
                    className="flex-1 rounded-2xl border-2 border-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 sm:px-6 sm:py-4"
                  >
                    Back
                  </button>
                  <button
                    onClick={goToNextStep}
                    className="flex-1 rounded-2xl bg-[#1d4ed8] px-4 py-3 text-sm font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-[#1e40af] hover:shadow-blue-300 sm:flex-[1.2] sm:px-6 sm:py-4 flex items-center justify-center gap-2"
                  >
                    {currentStep === 4 ? "Review Broadcast" : "Continue"}
                    {currentStep < 4 && <ChevronRight size={20} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-60 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_-36px_rgba(15,23,42,0.55)] sm:p-10"
            >
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                <Check size={40} strokeWidth={2.5} />
              </div>

              <h2 className="mb-4 text-3xl font-black uppercase tracking-tight text-slate-900">Ready for Launch?</h2>
              <p className="mb-10 leading-relaxed text-slate-500">
                You're about to dispatch <span className="text-slate-900 font-bold">"{subject}"</span> to {selectedRecipientIds.length} selected recipients{selectedRecipientPreview.length > 0 ? `, including ${selectedRecipientPreview.join(", ")}` : ""}. This action is irreversible.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={20} />
                      Confirm & Send
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-all"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const formatAnalyticsTimestamp = (timestamp) => {
  if (!timestamp) {
    return "No recent activity";
  }

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.2, 0.8, 0.2, 1],
    },
  },
};

const CountUpNumber = ({ value, suffix = "", duration = 1100 }) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const target = Number(value) || 0;
  const widthCh = Math.max(String(target).length + String(suffix).length, 2);

  React.useEffect(() => {
    let frameId;
    const startTime = performance.now();

    const tick = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * easedProgress));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    setDisplayValue(0);
    frameId = window.requestAnimationFrame(tick);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [target, duration]);

  return (
    <span
      className="inline-block tabular-nums"
      style={{ minWidth: `${widthCh}ch` }}
    >
      {displayValue}
      {suffix}
    </span>
  );
};

export default Admin;
