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
      toast.success(`Queued email for ${selectedRecipientIds.length} recipients`);
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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <AuthNavigation />
      
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-400/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-indigo-400/5 blur-[80px] rounded-full" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center sm:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
              <Shield size={14} />
              <span>Admin Access Only</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-4 tracking-tight">
              Control <span className="text-blue-600">Center</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl leading-relaxed">
              Elevate your workspace with advanced administration tools and seamless communication.
            </p>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Send Email Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <button
                onClick={() => setShowEmailModal(true)}
                className="relative flex flex-col h-full w-full bg-white rounded-3xl p-8 text-left shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="mb-8 w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Send size={32} strokeWidth={1.5} />
                </div>
                
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Broadcast</h2>
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                  Compose and dispatch feature updates to a selected email audience with full visibility.
                </p>

                <div className="mt-auto flex items-center gap-2 text-blue-600 font-bold">
                  <span className="text-sm uppercase tracking-widest">New Update</span>
                  <div className="h-0.5 w-12 bg-blue-600/20 group-hover:w-20 transition-all duration-300" />
                  <ChevronRight size={20} />
                </div>

                {/* Decorative background element */}
                <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-blue-50 rounded-full opacity-50 transition-transform duration-700" />
              </button>
            </motion.div>

            {/* Analytics Card (Coming Soon) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="group relative"
            >
              <div className="relative flex flex-col h-full w-full bg-slate-50/50 backdrop-blur-sm rounded-3xl p-8 text-left border border-dashed border-slate-200 overflow-hidden cursor-not-allowed">
                <div className="mb-8 w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <BarChart3 size={32} strokeWidth={1.5} />
                </div>
                
                <h2 className="text-3xl font-bold text-slate-400 mb-3">Analytics</h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Advanced insights and engagement metrics to track the heartbeat of your app.
                </p>

                <div className="mt-auto">
                  <span className="inline-flex px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest">
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
              className="bg-white rounded-[32px] shadow-2xl max-w-3xl w-full h-[90vh] overflow-hidden flex flex-col sm:flex-row"
            >
              {/* Sidebar/Progress */}
              <div className="sm:w-64 bg-slate-50 p-8 border-b sm:border-b-0 sm:border-r border-slate-100">
                <div className="mb-10 hidden sm:block">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4">
                    <Send size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900">Broadcast</h3>
                  <p className="text-xs text-slate-500">Configure your update</p>
                </div>
                
                <div className="flex sm:flex-col gap-4 sm:gap-6 justify-between sm:justify-start">
                  {steps.map((step) => (
                    <div key={step.number} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        currentStep >= step.number ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {currentStep > step.number ? <Check size={14} /> : step.number}
                      </div>
                      <div className="hidden sm:block">
                        <p className={`text-sm font-bold ${currentStep >= step.number ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Area */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-8 pb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900">{steps[currentStep-1].title}</h2>
                  <button onClick={closeEmailModal} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-4">
                  {/* Step 1: Email Basics */}
                  {currentStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-blue-600 transition-colors">Email Subject</label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="What's this update about?"
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white text-slate-900 transition-all outline-none"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-blue-600 transition-colors">Feature Name</label>
                        <input
                          type="text"
                          value={featureName}
                          onChange={(e) => setFeatureName(e.target.value)}
                          placeholder="The name of the highlight"
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white text-slate-900 transition-all outline-none"
                        />
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                              Audience
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                              {isRecipientsLoading
                                ? "Loading recipients..."
                                : `${selectedRecipientIds.length} of ${recipientOptions.length} recipients selected`}
                            </p>
                            <p className="text-sm text-slate-500">
                              Pick exactly who should receive this update before you send it.
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={selectAllRecipients}
                              disabled={isRecipientsLoading || recipientOptions.length === 0}
                              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-40"
                            >
                              Select all
                            </button>
                            <button
                              type="button"
                              onClick={clearAllRecipients}
                              disabled={isRecipientsLoading || selectedRecipientIds.length === 0}
                              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-40"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 max-h-72 overflow-y-auto space-y-3 pr-1">
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
                                  <p className="font-semibold text-slate-900 truncate">
                                    {recipient.githubUsername
                                      ? `@${recipient.githubUsername}`
                                      : recipient.email}
                                  </p>
                                  <p className="text-sm text-slate-500 truncate">
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
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-blue-600 transition-colors">Hook / Intro</label>
                        <textarea
                          value={intro}
                          onChange={(e) => setIntro(e.target.value)}
                          placeholder="Capture their attention..."
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white text-slate-900 transition-all outline-none resize-none h-24"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-blue-600 transition-colors">Detailed Description</label>
                        <textarea
                          value={heroDescription}
                          onChange={(e) => setHeroDescription(e.target.value)}
                          placeholder="Go into the details..."
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white text-slate-900 transition-all outline-none resize-none h-32"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Changes */}
                  {currentStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-500">Add granular changes to this update</p>
                        <button onClick={addChangeBlock} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                          Add Change
                        </button>
                      </div>

                      <div className="space-y-4">
                        {changes.map((change, index) => (
                          <div key={index} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative group/item">
                            {changes.length > 1 && (
                              <button onClick={() => removeChangeBlock(index)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                                <X size={16} />
                              </button>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type</label>
                                <select
                                  value={change.tagClass}
                                  onChange={(e) => handleChangeUpdate(index, "tagClass", e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-blue-600 transition-all"
                                >
                                  <option value="tag-new">New</option>
                                  <option value="tag-improved">Improved</option>
                                  <option value="tag-fixed">Fixed</option>
                                  <option value="tag-security">Security</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Label</label>
                                <input
                                  type="text"
                                  value={change.tag}
                                  onChange={(e) => handleChangeUpdate(index, "tag", e.target.value)}
                                  placeholder="e.g. HOT"
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-blue-600 transition-all"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={change.title}
                                onChange={(e) => handleChangeUpdate(index, "title", e.target.value)}
                                placeholder="Change title"
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-blue-600 transition-all font-bold"
                              />
                              <textarea
                                value={change.description}
                                onChange={(e) => handleChangeUpdate(index, "description", e.target.value)}
                                placeholder="Short explanation"
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-blue-600 transition-all resize-none h-16"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="group">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CTA Label</label>
                          <input
                            type="text"
                            value={primaryCTA}
                            onChange={(e) => setPrimaryCTA(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white text-slate-900 transition-all outline-none"
                          />
                        </div>
                        <div className="group">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Display Date</label>
                          <input
                            type="text"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white text-slate-900 transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                          <AlertCircle size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-blue-900 text-lg">Almost there!</p>
                          <p className="text-blue-700/70 text-sm">
                            You are about to send this update to {selectedRecipientIds.length} selected recipients. Double check the copy and the audience before you continue.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-8 pt-4 flex gap-4">
                  <button
                    onClick={goToPrevStep}
                    disabled={currentStep === 1}
                    className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={goToNextStep}
                    className="flex-2 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2"
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
              className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-10 text-center"
            >
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Check size={40} strokeWidth={2.5} />
              </div>

              <h2 className="text-3xl font-black text-slate-900 mb-4">Ready for Launch?</h2>
              <p className="text-slate-500 mb-10 leading-relaxed">
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
