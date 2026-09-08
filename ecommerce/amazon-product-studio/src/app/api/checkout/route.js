import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { BillingService } from "@/lib/services/billing";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
    const { planId } = await request.json();
    return NextResponse.json(await BillingService.createSubscription(session.user.id, planId));
  } catch (error) {
    return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 400 });
  }
}
