import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { BillingService } from "@/lib/services/billing";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await request.json();
  const valid = BillingService.verifyCheckoutSignature({ paymentId: data.razorpay_payment_id, subscriptionId: data.razorpay_subscription_id, signature: data.razorpay_signature });
  return NextResponse.json({ valid }, { status: valid ? 200 : 400 });
}
