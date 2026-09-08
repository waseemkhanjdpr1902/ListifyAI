"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiClock, FiCopy, FiLoader } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function ListingHistoryPage() {
  const { status } = useSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (status !== "authenticated") { if (status === "unauthenticated") setTimeout(() => setLoading(false), 0); return; }
    let active = true;
    fetch("/api/listings").then((response) => response.json()).then((data) => { if (active) setItems(Array.isArray(data) ? data : []); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status]);
  return <main className="min-h-screen bg-[#07110e] px-5 py-12 text-white"><Toaster position="top-right"/><div className="mx-auto max-w-6xl"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-400">Your workspace</p><h1 className="mt-2 text-4xl font-black">Listing history</h1><p className="mt-3 text-zinc-400">Reopen and copy your recent marketplace content.</p>
    {loading ? <div className="flex min-h-80 items-center justify-center"><FiLoader className="animate-spin text-3xl text-emerald-400"/></div> : status !== "authenticated" ? <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center"><p>Sign in to see your listings.</p><Link href="/login" className="mt-5 inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-black text-emerald-950">Sign in</Link></div> : items.length === 0 ? <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center"><FiClock className="mx-auto text-3xl text-emerald-400"/><h2 className="mt-4 text-xl font-black">No listings yet</h2><Link href="/" className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-black text-zinc-950">Create your first listing</Link></div> : <div className="mt-10 grid gap-5 md:grid-cols-2">{items.map(item=><article key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"><div className="flex justify-between gap-3"><div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">{item.marketplace}</span><h2 className="mt-4 text-xl font-black leading-snug">{item.output.title}</h2></div><button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(item.output,null,2));toast.success("Listing copied");}} className="h-fit rounded-lg border border-zinc-700 p-3 hover:border-emerald-400" aria-label="Copy listing"><FiCopy/></button></div><ul className="mt-5 space-y-2 text-sm text-zinc-400">{item.output.bullets?.slice(0,3).map((bullet,index)=><li key={index}>• {bullet}</li>)}</ul><p className="mt-5 text-xs text-zinc-600">{new Date(item.createdAt).toLocaleDateString()}</p></article>)}</div>}
  </div></main>;
}
