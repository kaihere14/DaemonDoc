import {
  enqueueFeatureUpdateBroadcast,
  getFeatureUpdateRecipientsList,
  getEmailQueueStats,
} from "../services/email.queue.js";

export const sendFeatureUpdateEmail = async (req, res) => {
  const { subject, content, recipientUserIds } = req.body;
  try {
    if (!subject || typeof subject !== "string") {
      return res.status(400).json({ message: "Missing subject" });
    }

    if (!content || typeof content !== "object") {
      return res.status(400).json({ message: "Missing content" });
    }

    if (
      recipientUserIds !== undefined &&
      (!Array.isArray(recipientUserIds) ||
        recipientUserIds.some(
          (recipientId) =>
            typeof recipientId !== "string" || !recipientId.trim(),
        ))
    ) {
      return res.status(400).json({ message: "Invalid recipient list" });
    }

    const result = await enqueueFeatureUpdateBroadcast({
      subject,
      content,
      recipientUserIds,
    });

    if (result.enqueued === 0) {
      return res.status(400).json({
        message: "No eligible recipients selected",
        ...result,
      });
    }

    res.status(202).json({
      message: "Email jobs queued successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};

export const getFeatureUpdateRecipients = async (_req, res) => {
  try {
    const audience = await getFeatureUpdateRecipientsList();
    return res.status(200).json(audience);
  } catch (error) {
    console.error("Error getting recipients:", error);
    return res.status(500).json({ message: "Failed to get recipients" });
  }
};

export const getEmailQueueStatus = async (_req, res) => {
  try {
    const stats = await getEmailQueueStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting queue stats:", error);
    return res.status(500).json({ message: "Failed to get queue stats" });
  }
};
