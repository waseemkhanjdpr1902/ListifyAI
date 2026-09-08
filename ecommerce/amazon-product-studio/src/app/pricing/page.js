"use client";

import Script from "next/script";
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { FiCheck, FiLoader } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const plans = [
  { id: "starter", name: "Starter", price: 499, credits: 30, note: "For new and occasional sellers" },
  { id: "seller", name: "Seller Pro", price: 1499, credits: 150, note: "For growing ecommerce stores", popular: true },
  { id: "agency", name: "Agency", price: 4999, credits: 750, note: "For teams managing many products" },
];

export default function PricingPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState("");
  async function subscribe(planId) {
    if (!session) return signIn("google");
    if (!window.Razorpay) return toast.error("Payment checkout is still loading");
    setLoading(planId);
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const checkout = new window.Razorpay({
        key: data.keyId, subscription_id: data.subscriptionId, name: "ListifyAI", description: `${data.plan.name} monthly subscription`,
        prefill: { name: session.user.name || "", email: session.user.email || "" }, theme: { color: "#34d399" },
        handler: async (payment) => {
          const verify = await fetch("/api/billing/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payment) });
          if (!verify.ok) return toast.error("Payment verification failed");
          await update(); toast.success("Subscription started. Credits will appear after payment confirmation.");
        }, modal: { ondismiss: () => setLoading("") },
      });
      checkout.open();
    } catch (error) { toast.error(error.message || "Checkout failed"); setLoading(""); }
  }
  return <main className="min-h-screen bg-[#07110e] px-5 py-16 text-white"><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive"/><Toaster position="top-right"/><div className="mx-auto max-w-6xl"><div className="text-center"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-400">Simple monthly pricing</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">More listings. Less repetitive work.</h1><p className="mx-auto mt-4 max-w-xl text-zinc-400">Credits renew after each successful monthly payment. One complete listing uses one credit.</p></div><div className="mt-12 grid gap-6 md:grid-cols-3">{plans.map(plan=><article key={plan.id} className={`relative rounded-3xl border p-7 ${plan.popular ? "border-emerald-400 bg-emerald-400/10" : "border-zinc-800 bg-zinc-950"}`}>{plan.popular&&<span className="absolute -top-3 left-6 rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-emerald-950">MOST POPULAR</span>}<h2 className="text-xl font-black">{plan.name}</h2><p className="mt-2 text-sm text-zinc-400">{plan.note}</p><p className="mt-7 text-4xl font-black">₹{plan.price.toLocaleString("en-IN")}<span className="text-sm font-medium text-zinc-500"> /month</span></p><div className="my-7 border-y border-zinc-800 py-5"><p className="font-black text-emerald-300">{plan.credits} listing credits/month</p></div><ul className="space-y-3 text-sm text-zinc-300">{["All marketplaces","Titles, bullets and descriptions","SEO keywords and social caption","Generation history"].map(x=><li key={x} className="flex gap-2"><FiCheck className="mt-0.5 text-emerald-400"/>{x}</li>)}</ul><button onClick={()=>subscribe(plan.id)} disabled={Boolean(loading)} className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-black ${plan.popular ? "bg-emerald-400 text-emerald-950" : "bg-white text-zinc-950"}`}>{loading===plan.id?<><FiLoader className="animate-spin"/>Opening…</>:session?"Subscribe with Razorpay":"Sign in to subscribe"}</button></article>)}</div></div></main>;
}
