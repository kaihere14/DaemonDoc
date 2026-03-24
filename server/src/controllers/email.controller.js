import {
  enqueueFeatureUpdateBroadcast,
  getEmailQueueStats,
} from "../services/email.queue.js";

export const sendFeatureUpdateEmail = async (req, res) => {
  const { subject, content } = req.body;
  try {
    if (!subject || typeof subject !== "string") {
      return res.status(400).json({ message: "Missing subject" });
    }

    if (!content || typeof content !== "object") {
      return res.status(400).json({ message: "Missing content" });
    }

    const result = await enqueueFeatureUpdateBroadcast({ subject, content });
    res.status(202).json({
      message: "Broadcast email jobs queued successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
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
