/**
 * Centralized configuration for the Amazon Product Studio SaaS application.
 */

const config = {
  appName: "ListifyAI",
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    webhook_url: process.env.WEBHOOK_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
  razorpay: {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    plans: {
      starter: { id: "starter", name: "Starter", credits: 30, price: 499, planId: process.env.RAZORPAY_STARTER_PLAN_ID },
      seller: { id: "seller", name: "Seller Pro", credits: 150, price: 1499, planId: process.env.RAZORPAY_SELLER_PLAN_ID },
      agency: { id: "agency", name: "Agency", credits: 750, price: 4999, planId: process.env.RAZORPAY_AGENCY_PLAN_ID },
    }
  },
  ai: {
    apiKey: process.env.MUAPIAPP_API_KEY || process.env.MU_API_KEY,
    submitEndpoint: "https://api.muapi.ai/api/v1/nano-banana-2-edit",
    uploadEndpoint: "https://api.muapi.ai/api/v1/upload_file",
    pollEndpoint: (requestId) => `https://api.muapi.ai/api/v1/predictions/${requestId}/result`,
    creditCost: 1,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  },
  db: {
    url: process.env.DATABASE_URL,
  }
};

export default config;
