import crypto from "node:crypto";
import config from "../config";
import { prisma } from "../prisma";

function razorpayAuth() {
  if (!config.razorpay.keyId || !config.razorpay.keySecret) throw new Error("Razorpay is not configured");
  return `Basic ${Buffer.from(`${config.razorpay.keyId}:${config.razorpay.keySecret}`).toString("base64")}`;
}

export const BillingService = {
  async createSubscription(userId, planId) {
    const plan = config.razorpay.plans[planId];
    if (!plan?.planId) throw new Error("Selected Razorpay plan is not configured");
    const response = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: { Authorization: razorpayAuth(), "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: plan.planId, total_count: 120, quantity: 1, customer_notify: 1, notes: { userId, planId } }),
      cache: "no-store",
    });
    const subscription = await response.json();
    if (!response.ok) throw new Error(subscription?.error?.description || "Unable to create subscription");
    await prisma.subscription.create({ data: { userId, planId, razorpaySubscriptionId: subscription.id, status: subscription.status || "created" } });
    return { subscriptionId: subscription.id, keyId: config.razorpay.keyId, plan };
  },
  verifyCheckoutSignature({ paymentId, subscriptionId, signature }) {
    const expected = crypto.createHmac("sha256", config.razorpay.keySecret).update(`${paymentId}|${subscriptionId}`).digest("hex");
    return Boolean(signature) && signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  },
  verifyWebhook(rawBody, signature) {
    const expected = crypto.createHmac("sha256", config.razorpay.webhookSecret).update(rawBody).digest("hex");
    return Boolean(signature) && signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  },
  async processWebhook(event) {
    const entity = event.payload?.subscription?.entity;
    const payment = event.payload?.payment?.entity;
    const subscriptionId = entity?.id || payment?.subscription_id;
    if (!subscriptionId) return;
    const record = await prisma.subscription.findUnique({ where: { razorpaySubscriptionId: subscriptionId } });
    if (!record) return;
    const status = entity?.status || (event.event === "subscription.charged" ? "active" : undefined);
    await prisma.subscription.update({ where: { id: record.id }, data: { ...(status ? { status } : {}), ...(entity?.current_end ? { currentPeriodEnd: new Date(entity.current_end * 1000) } : {}) } });
    if (event.event === "subscription.charged" && payment?.id && record.lastCreditedChargeId !== payment.id) {
      const plan = config.razorpay.plans[record.planId];
      if (!plan) return;
      await prisma.$transaction(async (tx) => {
        const fresh = await tx.subscription.findUnique({ where: { id: record.id } });
        if (fresh.lastCreditedChargeId === payment.id) return;
        await tx.user.update({ where: { id: record.userId }, data: { credits: { increment: plan.credits } } });
        await tx.subscription.update({ where: { id: record.id }, data: { lastCreditedChargeId: payment.id, status: "active" } });
      });
    }
  },
};
