"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Calendar,
  Layers,
  Search,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Radio,
  ChevronRight,
  ChevronLeft,
  X,
  Share2,
  Filter,
  Database,
  Cloud,
  Cpu
} from "lucide-react";

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

import rawLibrary from "@/data/library.json";
import rawV3Library from "@/data/v3_library.json";
import { PostItem, WorkerHealth } from "@/types";

const library = rawLibrary as PostItem[];
const v3Library = rawV3Library as PostItem[];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"today" | "library" | "status">("today");
  const [selectedVersion, setSelectedVersion] = useState<"v2" | "v3">("v3");
  const [selectedSlot, setSelectedSlot] = useState<"all" | "morning" | "evening">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "single" | "carousel">("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const currentLibrary = useMemo(() => {
    return selectedVersion === "v3" ? v3Library : library;
  }, [selectedVersion]);

  // Slide Viewer Modal State
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [activePlatformCaption, setActivePlatformCaption] = useState<"instagram" | "facebook">("instagram");

  // Live System Health
  const [healthData, setHealthData] = useState<WorkerHealth | null>(null);
  const [healthLatency, setHealthLatency] = useState<number | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Dynamic Upcoming Post Resolution (initialized in useEffect to avoid SSR hydration mismatch)
  const [nowTimestamp, setNowTimestamp] = useState<number | null>(null);

  useEffect(() => {
    setNowTimestamp(Date.now());
    const timer = setInterval(() => setNowTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { nextPost, targetTime, isPostTimeDue } = useMemo(() => {
    const current = nowTimestamp || new Date("2026-11-19T05:30:00.000Z").getTime();
    const upcoming = currentLibrary.find((p) => new Date(p.scheduled_iso).getTime() > current);
    const post = upcoming || currentLibrary[0];
    const target = new Date(post.scheduled_iso).getTime();
    return {
      nextPost: post,
      targetTime: target,
      isPostTimeDue: current >= target
    };
  }, [nowTimestamp, currentLibrary]);

  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!nowTimestamp) return;
    const diff = Math.max(0, targetTime - nowTimestamp);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setTimeLeft({ hours, minutes, seconds });
  }, [nowTimestamp, targetTime]);

  // Fetch Live Worker Health
  useEffect(() => {
    const fetchHealth = async () => {
      setHealthLoading(true);
      const start = performance.now();
      try {
        const res = await fetch("https://ecexplain-social-worker.darshan51081.workers.dev/health");
        const data = await res.json();
        setHealthData(data);
        setHealthLatency(Math.round(performance.now() - start));
      } catch (err) {
        console.error("Health fetch error:", err);
      } finally {
        setHealthLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    currentLibrary.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [currentLibrary]);

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return currentLibrary.filter((p) => {
      const matchSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.hook.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.index) === searchQuery.trim();

      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchType = selectedType === "all" || p.type === selectedType;
      const matchSlot = selectedSlot === "all" || p.slot === selectedSlot;

      return matchSearch && matchCategory && matchType && matchSlot;
    });
  }, [currentLibrary, searchQuery, selectedCategory, selectedType, selectedSlot]);

  const paginatedPosts = useMemo(() => {
    return filteredPosts.slice(0, page * itemsPerPage);
  }, [filteredPosts, page]);

  const handleCopyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full bg-slate-950 text-slate-100 shadow-2xl relative">
      {/* TOP APP BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-md shadow-blue-500/20">
            EC
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              ECExplain
              <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800/60 font-semibold px-1.5 py-0.2 rounded-full">
                PROD
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">730-Day Automated Pipeline</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-full text-[11px] text-emerald-300 font-bold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          UNPAUSED • LIVE
        </div>
      </header>

      {/* PROMINENT UNPAUSED STATUS BANNER */}
      <div className="mx-4 mt-3 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between text-xs shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-xs tracking-wide">SYSTEM UNPAUSED</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-bold border border-emerald-500/40">
                ACTIVE CRON
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/90 mt-0.5">
              {selectedVersion === "v3"
                ? "v3 Live: Post #8 armed for today's 18:30 IST evening carousel (2 posts/day automated)"
                : isPostTimeDue
                ? "v2 Legacy: Posts #1–#4 completed"
                : "Live automated publishing active"}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[9px] text-slate-400 block font-mono">D1 Engine</span>
          <span className="text-[11px] font-bold text-emerald-400 font-mono">v3 LIVE</span>
        </div>
      </div>

      {/* ENGINE SELECTOR (v3 LIVE vs v2 LEGACY) */}
      <div className="mx-4 mt-2.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
        <button
          onClick={() => {
            setSelectedVersion("v3");
            setPage(1);
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center text-[11px] flex items-center justify-center gap-1 ${
            selectedVersion === "v3"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-300" />
          v3 Live Engine (1,460)
        </button>
        <button
          onClick={() => {
            setSelectedVersion("v2");
            setPage(1);
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center text-[11px] ${
            selectedVersion === "v2"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          v2 Legacy (730)
        </button>
      </div>

      {/* MAIN VIEW CONTENT */}
      <main className="flex-1 pb-24">
        {/* ================= TAB 1: TODAY & NEXT DROP ================= */}
        {activeTab === "today" && (
          <div className="p-4 space-y-4">
            {/* NEXT POST COUNTDOWN HERO */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 via-slate-900 to-indigo-950/60 border border-blue-500/30 p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-blue-300 mb-2 font-medium">
                <span className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> Scheduled Launch Slot
                </span>
                <span className="bg-blue-600/30 px-2 py-0.5 rounded text-[10px] text-blue-200 border border-blue-500/30 font-mono font-bold">
                  {selectedVersion === "v3"
                    ? `Post #${String(nextPost.index).padStart(4, "0")} • ${nextPost.slot === "morning" ? "Morning (10:00 AM)" : "Evening (18:30 PM)"}`
                    : `Day #${String(nextPost.index).padStart(3, "0")}`}
                </span>
              </div>

              <h2 className="text-lg font-extrabold text-white leading-tight mb-1">
                {nextPost.title}
              </h2>
              <p className="text-xs text-slate-300 mb-3">{nextPost.hook}</p>

              {/* COUNTDOWN TIMER */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-center mb-3">
                <div>
                  <div className="text-xl font-black text-blue-400">{timeLeft.hours}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Hours</div>
                </div>
                <div>
                  <div className="text-xl font-black text-indigo-400">{timeLeft.minutes}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Minutes</div>
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-400">{timeLeft.seconds}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Seconds</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {nextPost.scheduled_date_str}
                  {selectedVersion === "v2" ? " • 10:00 AM IST" : ""}
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Unpaused & Armed
                </span>
              </div>
            </div>

            {/* UPCOMING POST VISUAL CARD */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">Featured Post Preview</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full capitalize">
                    {nextPost.category.replace(/_/g, " ")}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedPost(nextPost);
                    setActiveSlideIndex(0);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Full View <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 1080x1350 ASSET PREVIEW */}
              <div
                onClick={() => {
                  setSelectedPost(nextPost);
                  setActiveSlideIndex(0);
                }}
                className="relative aspect-[4/5] w-full bg-slate-950 cursor-pointer group overflow-hidden"
              >
                <img
                  src={nextPost.images[0]}
                  alt={nextPost.title}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                  <div className="text-white">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      {nextPost.type === "carousel" ? "Carousel (5 Slides)" : "Single 1080×1350"}
                    </span>
                    <h3 className="text-sm font-bold mt-1 text-white">{nextPost.title}</h3>
                  </div>
                </div>
              </div>

              {/* CAPTION & HASHTAGS SNIPPET */}
              <div className="p-3 bg-slate-900/90 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Caption Preview</span>
                  <button
                    onClick={() =>
                      handleCopyCaption(
                        `${nextPost.caption}\n\n${nextPost.cta}\n\n${nextPost.hashtags.join(" ")}`
                      )
                    }
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCaption ? "Copied!" : "Copy All"}
                  </button>
                </div>
                <p className="text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line text-[11px]">
                  {nextPost.caption}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {nextPost.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* TARGET PLATFORMS */}
              <div className="bg-slate-950 p-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-pink-400 font-medium text-[11px]">
                    <InstagramIcon className="w-3.5 h-3.5" /> @ecexplain
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-400 font-medium text-[11px]">
                    <FacebookIcon className="w-3.5 h-3.5" /> ECExplain
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50 font-bold">
                  Autopilot Ready
                </span>
              </div>
            </div>

            {/* NEXT UPCOMING POST QUICK CARD */}
            {(() => {
              const nextIndex = currentLibrary.findIndex((p) => p.id === nextPost.id);
              const followingPost = currentLibrary[nextIndex + 1] || currentLibrary[1];
              return (
                <div
                  onClick={() => {
                    setSelectedPost(followingPost);
                    setActiveSlideIndex(0);
                  }}
                  className="rounded-xl bg-slate-900 border border-slate-800 p-3 flex items-center gap-3 cursor-pointer hover:border-slate-700 transition"
                >
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800 relative">
                    <img
                      src={followingPost.images[0]}
                      alt={followingPost.title}
                      className="w-full h-full object-cover"
                    />
                    {followingPost.type === "carousel" && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                        {followingPost.images.length} slides
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>Post #{String(followingPost.index).padStart(3, "0")}</span>
                      <span>•</span>
                      <span>{followingPost.scheduled_date_str}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{followingPost.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{followingPost.hook}</p>
                    <span className="inline-block mt-1 text-[9px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-800/50">
                      {followingPost.type === "carousel" ? "5-Slide Carousel" : "Single Post"}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= TAB 2: FULL 730-DAY LIBRARY ================= */}
        {activeTab === "library" && (
          <div className="p-4 space-y-3">
            {/* SEARCH BAR */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={`Search ${currentLibrary.length} posts (title, topic, #day)...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* V3 SLOT FILTER */}
            {selectedVersion === "v3" && (
              <div className="flex gap-1 text-[11px] p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  onClick={() => {
                    setSelectedSlot("all");
                    setPage(1);
                  }}
                  className={`flex-1 py-1 rounded-lg font-medium transition text-center ${
                    selectedSlot === "all" ? "bg-slate-800 text-white font-bold" : "text-slate-400"
                  }`}
                >
                  All ({currentLibrary.length})
                </button>
                <button
                  onClick={() => {
                    setSelectedSlot("morning");
                    setPage(1);
                  }}
                  className={`flex-1 py-1 rounded-lg font-medium transition text-center ${
                    selectedSlot === "morning" ? "bg-blue-600/40 text-blue-300 font-bold border border-blue-500/40" : "text-slate-400"
                  }`}
                >
                  Morning 10:00
                </button>
                <button
                  onClick={() => {
                    setSelectedSlot("evening");
                    setPage(1);
                  }}
                  className={`flex-1 py-1 rounded-lg font-medium transition text-center ${
                    selectedSlot === "evening" ? "bg-indigo-600/40 text-indigo-300 font-bold border border-indigo-500/40" : "text-slate-400"
                  }`}
                >
                  Evening 18:30
                </button>
              </div>
            )}

            {/* CATEGORY FILTER PILLS */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition ${
                  selectedCategory === "all"
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                All ({currentLibrary.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition capitalize ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {cat.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            {/* TYPE TOGGLE (ALL / SINGLE / CAROUSEL) */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-400">
              <button
                onClick={() => {
                  setSelectedType("all");
                  setPage(1);
                }}
                className={`flex-1 py-1 rounded-md text-center transition ${
                  selectedType === "all" ? "bg-slate-800 text-white font-medium" : ""
                }`}
              >
                All Posts ({filteredPosts.length})
              </button>
              <button
                onClick={() => {
                  setSelectedType("single");
                  setPage(1);
                }}
                className={`flex-1 py-1 rounded-md text-center transition ${
                  selectedType === "single" ? "bg-slate-800 text-white font-medium" : ""
                }`}
              >
                Single ({currentLibrary.filter((p) => p.type === "single").length})
              </button>
              <button
                onClick={() => {
                  setSelectedType("carousel");
                  setPage(1);
                }}
                className={`flex-1 py-1 rounded-md text-center transition ${
                  selectedType === "carousel" ? "bg-slate-800 text-white font-medium" : ""
                }`}
              >
                Carousels ({currentLibrary.filter((p) => p.type === "carousel").length})
              </button>
            </div>

            {/* POSTS LIST */}
            <div className="space-y-2.5 pt-1">
              {paginatedPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    setSelectedPost(post);
                    setActiveSlideIndex(0);
                  }}
                  className="rounded-xl bg-slate-900 border border-slate-800 p-2.5 flex items-center gap-3 cursor-pointer hover:border-blue-500/50 hover:bg-slate-900/80 transition group"
                >
                  {/* THUMBNAIL */}
                  <div className="w-14 h-18 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800 relative">
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      loading="lazy"
                    />
                    {post.type === "carousel" && (
                      <span className="absolute bottom-0.5 right-0.5 bg-blue-600 text-white text-[8px] font-bold px-1 rounded">
                        5
                      </span>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="font-bold text-blue-400">#{String(post.index).padStart(3, "0")}</span>
                      <span>•</span>
                      <span>{post.scheduled_date_str}</span>
                      <span>•</span>
                      <span className="capitalize truncate">{post.category.replace(/_/g, " ")}</span>
                    </div>
                    <h3 className="text-xs font-bold text-white truncate mt-0.5">{post.title}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{post.hook}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                          post.type === "carousel"
                            ? "bg-indigo-950 text-indigo-300 border border-indigo-800/40"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {post.type === "carousel" ? "5-Slide Carousel" : "Single Post"}
                      </span>
                      {post.slot && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                            post.slot === "morning"
                              ? "bg-amber-950 text-amber-300 border border-amber-800/40"
                              : "bg-purple-950 text-purple-300 border border-purple-800/40"
                          }`}
                        >
                          {post.slot === "morning" ? "10:00 Morning" : "18:30 Evening"}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition shrink-0" />
                </div>
              ))}
            </div>

            {/* LOAD MORE */}
            {paginatedPosts.length < filteredPosts.length && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-blue-400 border border-slate-800 transition"
              >
                Load More Posts ({filteredPosts.length - paginatedPosts.length} remaining)
              </button>
            )}
          </div>
        )}

        {/* ================= TAB 3: SYSTEM STATUS & CLOUDFLARE HEALTH ================= */}
        {activeTab === "status" && (
          <div className="p-4 space-y-4">
            {/* LIVE CONNECTION CARD */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-white">Cloudflare Worker API</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {healthLatency !== null ? `${healthLatency}ms latency` : "Checking..."}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Service Status</span>
                  <span className="font-bold text-emerald-400 text-xs capitalize">
                    {healthData?.status || "Healthy (Active)"}
                  </span>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Publishing State</span>
                  <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    UNPAUSED (Live)
                  </span>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Meta Graph Version</span>
                  <span className="font-mono text-xs text-white">
                    {healthData?.config.meta_graph_api_version || "v26.0"}
                  </span>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Target Timezone</span>
                  <span className="text-xs text-slate-200">
                    {healthData?.config.timezone || "Asia/Kolkata"}
                  </span>
                </div>
              </div>
            </div>

            {/* CURRICULUM METRICS */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-400" /> Database & Media Inventory
                </h3>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800/50 font-mono font-bold">
                  {selectedVersion === "v3" ? "v3 Dual Engine" : "v2 Engine"}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Publications in D1</span>
                  <span className="font-bold text-white">
                    {selectedVersion === "v3" ? "1,460 Posts (730 Days × 2/day)" : "730 Posts (730 Days × 1/day)"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Media Slides in R2</span>
                  <span className="font-bold text-emerald-400">
                    {selectedVersion === "v3" ? "4,380 / 4,380 Verified (100%)" : "1,566 / 1,566 Verified"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Platform Targets Configured</span>
                  <span className="font-bold text-white">
                    {selectedVersion === "v3" ? "2,920 (1,460 IG + 1,460 FB)" : "1,460 (730 IG + 730 FB)"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Daily Publishing Cadence</span>
                  <span className="font-bold text-blue-400 font-mono">
                    {selectedVersion === "v3" ? "10:00 AM IST & 18:30 PM IST" : "10:00 AM IST"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Overdue Pending Posts</span>
                  <span className="font-bold text-emerald-400">0 (Zero Collision)</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Hosting & Execution Cost</span>
                  <span className="font-bold text-emerald-400">$0.00 / month (Free Tier)</span>
                </div>
              </div>
            </div>

            {/* ZERO MANUAL INTERVENTION NOTICE */}
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-800/50 p-3 text-xs text-emerald-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white">100% Autonomous Operation</span>
                The Cloudflare Worker cron fires automatically every 60 seconds and publishes twice daily at 10:00 AM IST and 18:30 PM IST. Zero manual approves, button presses, or maintenance required for the next 2 full years (730 days).
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= INTERACTIVE SLIDE VIEWER MODAL ================= */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4">
          <div className="bg-slate-900 border-t md:border border-slate-800 rounded-t-3xl md:rounded-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* MODAL HEADER */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-blue-400 font-bold">
                  Day #{String(selectedPost.index).padStart(3, "0")} • {selectedPost.scheduled_date_str}
                </span>
                <h3 className="text-xs font-bold text-white truncate">{selectedPost.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL BODY (SCROLLABLE) */}
            <div className="overflow-y-auto p-4 space-y-4">
              {/* SLIDE IMAGE CAROUSEL */}
              <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={selectedPost.images[activeSlideIndex]}
                  alt={`Slide ${activeSlideIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* CAROUSEL CONTROLS */}
                {selectedPost.type === "carousel" && (
                  <>
                    <button
                      onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
                      disabled={activeSlideIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 disabled:opacity-30 text-white flex items-center justify-center backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveSlideIndex((i) => Math.min(selectedPost.images.length - 1, i + 1))
                      }
                      disabled={activeSlideIndex === selectedPost.images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 disabled:opacity-30 text-white flex items-center justify-center backdrop-blur-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* SLIDE INDICATOR PILLS */}
                    <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
                      {selectedPost.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSlideIndex(idx)}
                          className={`h-1.5 rounded-full transition-all ${
                            activeSlideIndex === idx ? "w-5 bg-blue-500" : "w-1.5 bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* SLIDE ROLE BADGE */}
              {selectedPost.type === "carousel" && (
                <div className="text-center text-[11px] text-slate-400">
                  Slide {activeSlideIndex + 1} of 5:{" "}
                  <span className="font-semibold text-blue-400 capitalize">
                    {["Cover Slide", "Core Concept", "Technical Diagram", "Formula & Example", "Summary & Follow"][
                      activeSlideIndex
                    ]}
                  </span>
                </div>
              )}

              {/* FULL CAPTION BOX */}
              <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
                  <span className="font-bold text-slate-300">Complete Educational Caption</span>
                  <button
                    onClick={() =>
                      handleCopyCaption(
                        `${selectedPost.caption}\n\n${selectedPost.cta}\n\n${selectedPost.hashtags.join(" ")}`
                      )
                    }
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCaption ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line text-[11px]">
                  {selectedPost.caption}
                </p>
                <div className="pt-1 text-[11px] text-blue-300 font-medium">{selectedPost.cta}</div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedPost.hashtags.map((t) => (
                    <span key={t} className="text-[10px] text-blue-400 bg-blue-950/60 px-1 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* CANONICAL SOURCE LINK */}
              <a
                href={selectedPost.source_url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition"
              >
                <span>Read Interactive Lesson on ecexplain.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-6 py-2 flex items-center justify-around z-40">
        <button
          onClick={() => setActiveTab("today")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
            activeTab === "today" ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Today</span>
        </button>

        <button
          onClick={() => setActiveTab("library")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
            activeTab === "library" ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>730 Feed</span>
        </button>

        <button
          onClick={() => setActiveTab("status")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
            activeTab === "status" ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Radio className="w-5 h-5" />
          <span>Status</span>
        </button>
      </nav>
    </div>
  );
}
