import { Schema, model } from "mongoose";

/**
 * Append-only audit ledger for every payment event.
 * Never update documents in this collection — only insert.
 * This is the source of truth for "what happened and when".
 */
const paymentLedgerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Razorpay IDs — store all three whenever available
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    razorpaySubscriptionId: { type: String, default: null },

    type: {
      type: String,
      enum: [
        "subscription_activated", // first payment of a subscription
        "subscription_renewed",   // recurring monthly/yearly charge
        "subscription_cancelled", // user or system cancelled
        "subscription_halted",    // payment failed after retries
        "payment_failed",         // individual payment failure
        "plan_downgraded",        // admin or system downgrade to free
        "admin_grant",            // manually upgraded by admin
      ],
      required: true,
    },

    // Plan snapshot at time of event
    planBefore: { type: String, enum: ["free", "pro"], default: null },
    planAfter: { type: String, enum: ["free", "pro"], default: null },

    // Amount in paise; null for non-payment events like downgrades
    amount: { type: Number, default: null },
    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      required: true,
    },

    note: { type: String, default: null },

    // Full Razorpay payload for debugging
    razorpayResponse: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
    // Prevent accidental updates — this collection is append-only
  },
);

const PaymentLedger = model("PaymentLedger", paymentLedgerSchema);

export default PaymentLedger;
