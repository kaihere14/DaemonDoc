import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthNavigation from "../components/AuthNavigation";
import { api } from "../lib/api";
import { toast } from "sonner";
import {
  Send,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Check,
  Shield,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="mb-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
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
                  Run admin communications from the same clean operating surface as the rest of the app.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
            {/* Send Email Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative"
            >
              <button
                onClick={() => setShowEmailModal(true)}
                className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 text-left shadow-[0_20px_50px_-32px_rgba(15,23,42,0.35)] transition-all duration-200 hover:border-blue-200 sm:rounded-[2rem] sm:p-8"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white sm:mb-8 sm:h-16 sm:w-16">
                  <Send size={32} strokeWidth={1.5} />
                </div>
                
                <div className="mb-6 flex items-center gap-2">
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Broadcast Flow
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h2 className="mb-3 text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl">Broadcast</h2>
                <p className="mb-8 text-base leading-relaxed text-slate-500 sm:text-lg">
                  Compose and dispatch feature updates to a selected email audience with full visibility.
                </p>

                <div className="mt-auto flex items-center gap-2 font-bold text-blue-600">
                  <span className="text-sm uppercase tracking-widest">Open Composer</span>
                  <div className="h-0.5 w-12 bg-blue-600/20 transition-all duration-300 group-hover:w-20" />
                  <ChevronRight size={20} />
                </div>
              </button>
            </motion.div>

            {/* Analytics Card (Coming Soon) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="group relative"
            >
              <div className="relative flex h-full w-full cursor-not-allowed flex-col overflow-hidden rounded-[1.75rem] border border-dashed border-slate-200 bg-white/55 p-6 text-left shadow-[0_16px_40px_-32px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:rounded-[2rem] sm:p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 sm:mb-8 sm:h-16 sm:w-16">
                  <BarChart3 size={32} strokeWidth={1.5} />
                </div>
                <div className="mb-6 flex items-center gap-2">
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Next Module
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <h2 className="mb-3 text-2xl font-black uppercase tracking-tight text-slate-400 sm:text-3xl">Analytics</h2>
                <p className="mb-8 text-base leading-relaxed text-slate-400 sm:text-lg">
                  Advanced insights and engagement metrics to track the heartbeat of your app.
                </p>

                <div className="mt-auto">
                  <span className="inline-flex rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Coming Soon
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

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

export default Admin;
