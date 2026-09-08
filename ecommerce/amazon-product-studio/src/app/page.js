"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { FiCheck, FiCopy, FiLoader, FiPackage, FiZap } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const initialForm = { productName: "", category: "", marketplace: "Amazon", audience: "", features: "", keywords: "", language: "English" };

function CopyButton({ value }) {
  return <button type="button" onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied"); }} className="rounded-lg border border-divider px-3 py-2 text-xs font-bold hover:border-primary"><FiCopy /></button>;
}

export default function HomePage() {
  const { data: session, update } = useSession();
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const generate = async (event) => {
    event.preventDefault();
    if (!session) return signIn("google");
    setLoading(true);
    try {
      const response = await fetch("/api/listings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to generate listing");
      setResult(data.output);
      await update();
      toast.success("Marketplace listing created");
    } catch (error) { toast.error(error.message); } finally { setLoading(false); }
  };

  return <main className="min-h-screen bg-[#07110e] text-white"><Toaster position="top-right" />
    <section className="border-b border-emerald-900/60 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,.18),_transparent_38%)] px-5 py-16">
      <div className="mx-auto max-w-6xl text-center">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-emerald-300"><FiZap /> Built for ecommerce sellers</div>
        <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Turn product details into listings that are ready to sell.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-300">Create accurate titles, persuasive bullets, SEO keywords, descriptions and social captions for Amazon, Flipkart, Meesho and Shopify.</p>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-7 px-5 py-10 lg:grid-cols-[.9fr_1.1fr]">
      <form onSubmit={generate} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Listing brief</p><h2 className="mt-1 text-2xl font-black">Describe your product</h2></div><div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300"><FiPackage size={22}/></div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm font-bold">Product name<input required name="productName" value={form.productName} onChange={change} placeholder="e.g. Stainless steel insulated bottle" className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-normal outline-none focus:border-emerald-400" /></label>
          <label className="text-sm font-bold">Marketplace<select name="marketplace" value={form.marketplace} onChange={change} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-normal">{["Amazon","Flipkart","Meesho","Shopify","Generic"].map(x=><option key={x}>{x}</option>)}</select></label>
          <label className="text-sm font-bold">Language<select name="language" value={form.language} onChange={change} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-normal">{["English","Hindi","Arabic"].map(x=><option key={x}>{x}</option>)}</select></label>
          <label className="text-sm font-bold">Category<input name="category" value={form.category} onChange={change} placeholder="Home & Kitchen" className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold">Target buyer<input name="audience" value={form.audience} onChange={change} placeholder="Office professionals" className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-normal" /></label>
          <label className="sm:col-span-2 text-sm font-bold">Features and specifications<textarea required name="features" value={form.features} onChange={change} rows="5" placeholder="Only enter facts: material, dimensions, capacity, colour, benefits…" className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-normal outline-none focus:border-emerald-400" /></label>
          <label className="sm:col-span-2 text-sm font-bold">Preferred keywords<input name="keywords" value={form.keywords} onChange={change} placeholder="insulated bottle, leakproof flask" className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-normal" /></label>
        </div>
        <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-4 font-black text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-60">{loading ? <><FiLoader className="animate-spin"/> Creating listing…</> : session ? "Generate listing · 1 credit" : "Sign in to generate"}</button>
        <p className="mt-3 text-center text-xs text-zinc-500">AI output should be reviewed before publishing. We avoid unsupported product claims.</p>
      </form>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {!result ? <div className="flex min-h-[560px] flex-col items-center justify-center text-center"><div className="rounded-3xl bg-zinc-900 p-6 text-emerald-300"><FiPackage size={42}/></div><h2 className="mt-6 text-2xl font-black">Your optimized listing appears here</h2><p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">Complete the brief with factual product details. ListifyAI will organize them into marketplace-ready content.</p><div className="mt-7 grid gap-3 text-left text-sm text-zinc-300 sm:grid-cols-2">{["SEO-focused title","Five benefit bullets","Conversion description","Search keywords"].map(x=><div key={x} className="flex items-center gap-2"><FiCheck className="text-emerald-400"/>{x}</div>)}</div></div> : <div className="space-y-6">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Optimized title</p><h2 className="mt-2 text-2xl font-black leading-tight">{result.title}</h2></div><CopyButton value={result.title}/></div>
          <div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-400">Benefit bullets</p><ul className="space-y-3">{result.bullets?.map((x,i)=><li key={i} className="flex gap-3 rounded-xl bg-zinc-900 p-4 text-sm leading-6"><FiCheck className="mt-1 shrink-0 text-emerald-400"/>{x}</li>)}</ul></div>
          <div><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Description</p><CopyButton value={result.description}/></div><p className="whitespace-pre-wrap rounded-xl bg-zinc-900 p-4 text-sm leading-7 text-zinc-300">{result.description}</p></div>
          <div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-400">SEO keywords</p><div className="flex flex-wrap gap-2">{result.seoKeywords?.map(x=><span key={x} className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">{x}</span>)}</div></div>
          <div className="flex gap-3"><CopyButton value={JSON.stringify(result, null, 2)}/><button onClick={()=>setResult(null)} className="flex-1 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-bold hover:border-emerald-400">Create another listing</button></div>
        </div>}
      </div>
    </section>
    <section className="mx-auto max-w-5xl px-5 pb-16 text-center"><h2 className="text-3xl font-black">Ready to list products faster?</h2><p className="mt-3 text-zinc-400">Every new account starts with free credits.</p><Link href="/pricing" className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 font-black text-zinc-950">View subscription plans</Link></section>
  </main>;
}
