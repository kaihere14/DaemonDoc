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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
      content: {
        featureName: featureName.trim(),
        intro: intro.trim(),
        heroDescription: heroDescription.trim(),
        primaryCTA: primaryCTA.trim() || "Try Now",
        date: date || new Date().toDateString(),
        year: year || new Date().getFullYear().toString(),
        ...(validChanges.length > 0 && { changes: validChanges.slice(0, 2) }),
      },
    };

    setIsLoading(true);

    try {
      await api.post("/api/email/send", payload);
      toast.success("Email broadcast queued successfully!");

      // Reset form
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
      setShowConfirmModal(false);
      setShowEmailModal(false);
      setCurrentStep(1);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(error.response?.data?.message || "Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setCurrentStep(1);
  };

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
    <div>
      <AuthNavigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl font-bold text-slate-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-slate-600">
              Manage your application settings and communications
            </p>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Send Email Card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, shadowLg: true }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEmailModal(true)}
              className="relative h-80 rounded-2xl shadow-lg overflow-hidden group text-left hover:shadow-2xl transition-shadow"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-50 z-0" />

              {/* Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400" />

              {/* Content */}
              <div className="relative h-full p-8 flex flex-col justify-between z-10 bg-white/80 backdrop-blur-sm">
                <div>
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                    <Send
                      className="text-blue-600"
                      size={28}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    Send Email
                  </h2>
                  <p className="text-slate-600 text-base leading-relaxed">
                    Broadcast feature announcements to all users with
                    notifications enabled.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                  <span>Get Started</span>
                  <ChevronRight size={20} />
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity z-0" />
            </motion.button>

            {/* Analytics Card (Coming Soon) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative h-80 rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 z-0" />

              {/* Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-slate-300" />

              {/* Content */}
              <div className="relative h-full p-8 flex flex-col justify-between z-10 bg-white/60 backdrop-blur-sm">
                <div>
                  <div className="w-14 h-14 bg-slate-200 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3
                      className="text-slate-500"
                      size={28}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-500 mb-2">
                    Analytics
                  </h2>
                  <p className="text-slate-500 text-base leading-relaxed">
                    Track email performance, user engagement, and campaign
                    metrics.
                  </p>
                </div>

                {/* Coming Soon Badge */}
                <div className="inline-flex px-4 py-2 bg-slate-200 text-slate-600 rounded-lg font-semibold text-sm w-fit">
                  Coming Soon
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeEmailModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Send Email Broadcast
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Step {currentStep} of 4
                  </p>
                </div>
                <button
                  onClick={closeEmailModal}
                  className="text-slate-500 hover:text-slate-900 transition text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pt-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 h-1 rounded-full transition-all ${
                        step <= currentStep ? "bg-blue-500" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Step 1: Email Basics */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        Email Basics
                      </h3>
                      <p className="text-slate-600">
                        Set the subject and main feature name
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Email Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="e.g., New Feature: Patch Mode Available"
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Feature Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={featureName}
                          onChange={(e) => setFeatureName(e.target.value)}
                          placeholder="e.g., Patch Mode"
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Description */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        Feature Description
                      </h3>
                      <p className="text-slate-600">
                        Write the hook and detailed description
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Hook / Intro <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={intro}
                          onChange={(e) => setIntro(e.target.value)}
                          placeholder="1-2 sentence hook. Why does this matter?"
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none h-20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Feature Description{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={heroDescription}
                          onChange={(e) => setHeroDescription(e.target.value)}
                          placeholder="How does it work? What problem does it solve?"
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none h-24"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Changes */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          Additional Changes
                        </h3>
                        <p className="text-slate-600">
                          Add other improvements (optional)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addChangeBlock}
                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg font-medium transition text-sm"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {changes.map((change, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900">
                              Change {index + 1}
                            </span>
                            {changes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeChangeBlock(index)}
                                className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 rounded transition"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Type
                              </label>
                              <select
                                value={change.tagClass}
                                onChange={(e) =>
                                  handleChangeUpdate(
                                    index,
                                    "tagClass",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-1.5 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                              >
                                <option value="tag-new">New</option>
                                <option value="tag-improved">Improved</option>
                                <option value="tag-fixed">Fixed</option>
                                <option value="tag-security">Security</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Label
                              </label>
                              <input
                                type="text"
                                value={change.tag}
                                onChange={(e) =>
                                  handleChangeUpdate(
                                    index,
                                    "tag",
                                    e.target.value,
                                  )
                                }
                                placeholder="NEW"
                                className="w-full px-3 py-1.5 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={change.title}
                              onChange={(e) =>
                                handleChangeUpdate(
                                  index,
                                  "title",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., Better Performance"
                              className="w-full px-3 py-1.5 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={change.description}
                              onChange={(e) =>
                                handleChangeUpdate(
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Brief description"
                              className="w-full px-3 py-1.5 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none h-12"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        Customize & Review
                      </h3>
                      <p className="text-slate-600">
                        Finalize your broadcast settings
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-2">
                            CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={primaryCTA}
                            onChange={(e) => setPrimaryCTA(e.target.value)}
                            placeholder="Try Now"
                            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-2">
                            Date
                          </label>
                          <input
                            type="text"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            placeholder={new Date().toDateString()}
                            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-2">
                            Year
                          </label>
                          <input
                            type="text"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder={new Date().getFullYear().toString()}
                            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
                        <AlertCircle
                          size={20}
                          className="text-blue-600 flex-shrink-0 mt-0.5"
                        />
                        <div className="text-sm text-blue-900">
                          <p className="font-semibold mb-1">Ready to Send?</p>
                          <p>
                            This will broadcast to all users with notifications
                            enabled.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex gap-3 justify-end">
                <button
                  onClick={goToPrevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-2.5 text-slate-900 font-semibold border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                <button
                  onClick={goToNextStep}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
                >
                  {currentStep === 4 ? "Review & Send" : "Next"}
                  {currentStep < 4 && <ChevronRight size={18} />}
                </button>
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-blue-600" size={32} strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Confirm Broadcast?
              </h2>
              <p className="text-slate-600 mb-6">
                You're about to send emails to all users with notifications
                enabled. This action cannot be undone.
              </p>

              {/* Summary */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subject:</span>
                  <span className="font-semibold text-slate-900">
                    {subject}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Feature:</span>
                  <span className="font-semibold text-slate-900">
                    {featureName}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
                  <span className="text-slate-600">Changes:</span>
                  <span className="font-semibold text-slate-900">
                    {
                      changes.filter((c) => c.tag && c.title && c.description)
                        .length
                    }
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 text-slate-900 font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Now
                    </>
                  )}
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
