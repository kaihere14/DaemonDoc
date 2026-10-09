import User from "../schema/user.schema.js";
import {
  ONBOARDING_EVENTS,
  allStepsDone,
  getOnboardingState,
} from "../services/onboarding.service.js";
import { authLog as log } from "../utils/logger.js";

// Each event writes one timestamp. Resuming clears the snooze so the
// checklist reopens on the next visit as well as this one.
const EVENT_UPDATES = {
  snoozed: () => ({ "onboarding.snoozedAt": new Date() }),
  resumed: () => ({ "onboarding.snoozedAt": null }),
  dismissed: () => ({ "onboarding.dismissedAt": new Date() }),
  completed: () => ({ "onboarding.completedAt": new Date() }),
};

export const getOnboarding = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).select(
      "onboarding preferredCommitType",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const onboarding = await getOnboardingState(user);
    return res.status(200).json({ onboarding });
  } catch (error) {
    log.error("Failed to load onboarding state", {
      userId,
      detail: error.message,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOnboarding = async (req, res) => {
  const userId = req.userId;
  const { event } = req.body ?? {};

  if (!ONBOARDING_EVENTS.includes(event)) {
    return res.status(400).json({
      message: `event must be one of: ${ONBOARDING_EVENTS.join(", ")}`,
    });
  }

  try {
    const user = await User.findById(userId).select(
      "onboarding preferredCommitType",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const current = await getOnboardingState(user);
    if (!current.active) {
      return res.status(409).json({ message: "Onboarding is not active" });
    }
    if (event === "completed" && !allStepsDone(current)) {
      return res
        .status(409)
        .json({ message: "Finish every step before completing onboarding" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: EVENT_UPDATES[event]() },
      { new: true, runValidators: true },
    ).select("onboarding preferredCommitType");

    const onboarding = await getOnboardingState(updated);
    return res.status(200).json({ onboarding });
  } catch (error) {
    log.error("Failed to update onboarding state", {
      userId,
      event,
      detail: error.message,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
};
