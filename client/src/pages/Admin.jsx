import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthNavigation from "../components/AuthNavigation";
import { api, ENDPOINTS } from "../lib/api";
import { toast } from "sonner";
import { useReducedMotion } from "framer-motion";
import AdminHero from "../components/admin/AdminHero";
import AdminAnalyticsSection from "../components/admin/AdminAnalyticsSection";
import AdminPaymentsSection from "../components/admin/AdminPaymentsSection";
import AdminBroadcastSection from "../components/admin/AdminBroadcastSection";
import AdminSubscriptionSection from "../components/admin/AdminSubscriptionSection";
import EmailComposerModal from "../components/admin/EmailComposerModal";
import ConfirmBroadcastModal from "../components/admin/ConfirmBroadcastModal";

const ADMIN_TABS = [
  { key: "analytics", label: "Analytics" },
  { key: "broadcast", label: "Broadcast" },
  { key: "subscriptions", label: "Subscriptions" },
  { key: "paid-users", label: "Paid Users" },
];

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");
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

  const [subject, setSubject] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [intro, setIntro] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [primaryCTA, setPrimaryCTA] = useState("Try Now");
  const [date, setDate] = useState(new Date().toDateString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const [changes, setChanges] = useState([
    { tag: "", tagClass: "tag-improved", title: "", description: "" },
  ]);

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
      toast.success(
        `Queued email for ${selectedRecipientIds.length} recipients`,
        {
          closeButton: false,
          duration: 3500,
        },
      );
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
  const recentLogsData = analytics?.recentLogs || [];

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
          <AdminHero />

          {/* Tab bar */}
          <div className="-mx-1 mb-10 flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 w-fit">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "analytics" && (
            <AdminAnalyticsSection
              analyticsOverview={analyticsOverview}
              analyticsBreakdown={analyticsBreakdown}
              analyticsActivity={analyticsActivity}
              analyticsTopRepos={analyticsTopRepos}
              analyticsStats={analyticsStats}
              isAnalyticsLoading={isAnalyticsLoading}
              analyticsError={analyticsError}
              recentLogsData={recentLogsData}
              isAnalyticsRefreshing={isAnalyticsRefreshing}
              onRefresh={() => fetchAnalytics(true)}
              shouldReduceMotion={shouldReduceMotion}
            />
          )}

          {activeTab === "broadcast" && (
            <AdminBroadcastSection
              onOpenComposer={() => setShowEmailModal(true)}
            />
          )}

          {activeTab === "subscriptions" && (
            <AdminSubscriptionSection />
          )}

          {activeTab === "paid-users" && (
            <AdminPaymentsSection
              sectionNumber="04"
              shouldReduceMotion={shouldReduceMotion}
            />
          )}
        </div>
      </div>

      <EmailComposerModal
        isOpen={showEmailModal}
        showConfirmModal={showConfirmModal}
        currentStep={currentStep}
        steps={steps}
        completedSteps={completedSteps}
        isRecipientsLoading={isRecipientsLoading}
        subject={subject}
        setSubject={setSubject}
        featureName={featureName}
        setFeatureName={setFeatureName}
        recipientOptions={recipientOptions}
        selectedRecipientIds={selectedRecipientIds}
        toggleRecipient={toggleRecipient}
        selectAllRecipients={selectAllRecipients}
        clearAllRecipients={clearAllRecipients}
        intro={intro}
        setIntro={setIntro}
        heroDescription={heroDescription}
        setHeroDescription={setHeroDescription}
        changes={changes}
        addChangeBlock={addChangeBlock}
        removeChangeBlock={removeChangeBlock}
        handleChangeUpdate={handleChangeUpdate}
        primaryCTA={primaryCTA}
        setPrimaryCTA={setPrimaryCTA}
        date={date}
        setDate={setDate}
        goToPrevStep={goToPrevStep}
        goToNextStep={goToNextStep}
        onClose={closeEmailModal}
      />

      <ConfirmBroadcastModal
        isOpen={showConfirmModal}
        subject={subject}
        selectedRecipientIds={selectedRecipientIds}
        selectedRecipientPreview={selectedRecipientPreview}
        isLoading={isLoading}
        onConfirm={handleSubmit}
        onClose={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default Admin;
