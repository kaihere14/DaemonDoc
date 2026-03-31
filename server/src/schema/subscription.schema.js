import { Schema, model } from "mongoose";

/**
 * Stores Razorpay subscription records for pro plan users.
 * One document per active/historical subscription per user.
 */
const subscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Razorpay identifiers
    razorpaySubscriptionId: { type: String, unique: true, required: true },
    razorpayPlanId: { type: String, required: true },

    // Plan metadata
    planName: { type: String, default: "pro" },
    interval: { type: String, enum: ["monthly", "yearly"], required: true },

    // Amount stored in paise (₹499 = 49900)
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["created", "active", "paused", "cancelled", "expired", "halted"],
      default: "created",
    },

    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },

    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },

    // Raw Razorpay response stored for debugging / reconciliation
    razorpayResponse: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

const Subscription = model("Subscription", subscriptionSchema);

export default Subscription;
