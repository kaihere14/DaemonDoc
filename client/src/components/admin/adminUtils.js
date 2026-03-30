export const formatAnalyticsTimestamp = (timestamp) => {
  if (!timestamp) {
    return "No recent activity";
  }

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const fadeUpVariant = {
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
