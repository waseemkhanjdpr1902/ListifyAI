import { NextResponse } from "next/server";
import { BillingService } from "@/lib/services/billing";

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!BillingService.verifyWebhook(rawBody, signature)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  await BillingService.processWebhook(JSON.parse(rawBody));
  return NextResponse.json({ received: true });
}
