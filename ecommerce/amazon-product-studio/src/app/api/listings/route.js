import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserService } from "@/lib/services/user";
import config from "@/lib/config";

const MARKETPLACES = new Set(["Amazon", "Flipkart", "Meesho", "Shopify", "Generic"]);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.productListing.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 20 }));
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in to generate a listing" }, { status: 401 });
  const input = await request.json();
  const productName = String(input.productName || "").trim().slice(0, 160);
  const marketplace = MARKETPLACES.has(input.marketplace) ? input.marketplace : "Generic";
  const language = String(input.language || "English").slice(0, 40);
  if (productName.length < 2) return NextResponse.json({ error: "Enter a valid product name" }, { status: 400 });
  if (!config.gemini.apiKey) return NextResponse.json({ error: "Gemini API is not configured" }, { status: 503 });
  try {
    await UserService.deductCredits(session.user.id, 1);
  } catch {
    return NextResponse.json({ error: "You have no listing credits remaining" }, { status: 402 });
  }
  try {
    const prompt = `You are an ecommerce listing specialist. Create an accurate ${marketplace} listing in ${language}. Never invent certifications, specifications, warranties, ingredients or claims. Product name: ${productName}. Category: ${String(input.category || "Not provided")}. Audience: ${String(input.audience || "General")}. Seller-supplied features: ${String(input.features || "None")}. Keywords: ${String(input.keywords || "None")}. Return ONLY JSON with title (string), bullets (exactly 5 strings), description (string), seoKeywords (12 strings), socialCaption (string), warnings (array).`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.4 } }), cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || "AI generation failed");
    const output = JSON.parse(payload.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
    return NextResponse.json(await prisma.productListing.create({ data: { userId: session.user.id, productName, marketplace, language, input, output } }));
  } catch (error) {
    await UserService.addCredits(session.user.id, 1);
    return NextResponse.json({ error: error.message || "Generation failed; your credit was restored" }, { status: 502 });
  }
}
