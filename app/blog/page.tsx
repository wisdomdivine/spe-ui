"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { IconChevronLeft, IconChevronRight, IconArrowUpRight, IconTag } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Blog {
  id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  slug: string;
  category: string;
  tags: string[];
  author_name: string;
  author_image_url: string | null;
  created_at: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;
  const [total, setTotal] = useState(0);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const getTags = (rawTags: any): string[] => {
    if (!rawTags) return [];
    if (Array.isArray(rawTags)) return rawTags.filter((t) => typeof t === "string" && t.trim().length > 0);
    if (typeof rawTags === "string") {
      return rawTags
        .replace(/^\{|\}$/g, "")
        .split(",")
        .map((t) => t.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
    }
    return [];
  };

  // Collect all unique tags from loaded blogs
  const allTags = Array.from(new Set((blogs || []).flatMap((b) => getTags(b.tags))));

  // Filter blogs by active tag (client-side)
  const filteredBlogs = activeTag
    ? (blogs || []).filter((b) => getTags(b.tags).includes(activeTag))
    : (blogs || []);

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * PER_PAGE;
      const to = from + PER_PAGE - 1;

      const { data, count, error } = await supabase
        .from("blog_posts")
        .select("id, title, description, cover_image_url, slug, category, tags, author_name, author_image_url, created_at", { count: "exact" })
        .eq("status", "Published")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching blogs:", error);
      }
      setBlogs(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setBlogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const getPaginationItems = (): (number | string)[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const items: (number | string)[] = [1];
    if (page > 3) items.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i);
    if (page < totalPages - 2) items.push("...");
    items.push(totalPages);
    return items;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF]">
      <Header />

      <main className="flex-grow pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="container mx-auto px-6">
          {/* Page Heading */}
          <div className="mb-16 md:mb-24 flex justify-center text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl text-[38px] font-bold leading-[1.1] tracking-tight text-black sm:text-6xl md:text-7xl lg:text-[84px]"
            >
              Insights, Events, and Energy Conversations
            </motion.h1>
          </div>

          {/* Blog Grid + Sidebar */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 px-6">
              <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8">
                {/* Notebook */}
                <rect x="50" y="30" width="120" height="140" rx="12" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2" />
                <rect x="70" y="30" width="100" height="140" rx="12" fill="white" stroke="#BFDBFE" strokeWidth="2" />
                {/* Spiral binding */}
                {[50, 70, 90, 110, 130].map((y, i) => (
                  <g key={i}>
                    <circle cx="70" cy={y} r="4" fill="white" stroke="#93C5FD" strokeWidth="1.5" />
                  </g>
                ))}
                {/* Lines */}
                <rect x="85" y="55" width="65" height="4" rx="2" fill="#DBEAFE" />
                <rect x="85" y="70" width="50" height="4" rx="2" fill="#EFF6FF" />
                <rect x="85" y="85" width="58" height="4" rx="2" fill="#DBEAFE" />
                <rect x="85" y="100" width="40" height="4" rx="2" fill="#EFF6FF" />
                {/* Pencil */}
                <g transform="translate(140, 20) rotate(30)">
                  <rect x="0" y="0" width="8" height="55" rx="2" fill="#3B82F6" />
                  <polygon points="0,55 8,55 4,65" fill="#FCD34D" />
                  <rect x="0" y="0" width="8" height="8" rx="2" fill="#2563EB" />
                </g>
                {/* Sparkles */}
                <circle cx="45" cy="45" r="3" fill="#93C5FD" opacity="0.6" />
                <circle cx="180" cy="75" r="2" fill="#BFDBFE" opacity="0.8" />
                <circle cx="175" cy="140" r="3.5" fill="#93C5FD" opacity="0.5" />
                <path d="M35 80l3-8 3 8-8-3 8-3z" fill="#60A5FA" opacity="0.4" />
                <path d="M190 50l2-6 2 6-6-2 6-2z" fill="#93C5FD" opacity="0.5" />
              </svg>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No stories yet</h3>
              <p className="text-gray-400 text-sm max-w-xs text-center">Our writers are brewing something great. Check back soon for fresh insights!</p>
            </div>
          ) : (
            <div className="mx-auto max-w-7xl flex gap-10">
              {/* Main Grid */}
              <div className="flex-1">
                <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBlogs.map((blog) => (
                    <Link
                      key={blog.id}
                      href={`/blog/${blog.slug}`}
                      className="group flex cursor-pointer flex-col overflow-hidden rounded-[2.5rem] bg-white p-2 shadow-sm transition-all hover:shadow-xl"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2.2rem] bg-gray-100">
                        {blog.cover_image_url ? (
                          <Image
                            src={blog.cover_image_url}
                            alt={blog.title || "Blog post"}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
                            <span className="text-4xl font-black text-blue-200">{(blog.title || "S").charAt(0)}</span>
                          </div>
                        )}
                        {/* Category Badge */}
                        <div className="absolute left-5 top-5">
                          <div className="rounded-full bg-[#2563eb] px-5 py-2 text-[11px] font-bold text-white shadow-lg backdrop-blur-sm">
                            {blog.category || "Article"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col p-6 pt-8">
                        <h3 className="mb-4 text-2xl font-bold leading-tight text-gray-900 line-clamp-2 md:text-[26px]">
                          {blog.title || "Untitled"}
                        </h3>
                        <p className="mb-4 text-sm font-medium leading-relaxed text-gray-500 line-clamp-3">
                          {blog.description || ""}
                        </p>

                        {/* Tags on card */}
                        {(() => {
                          const cardTags = getTags(blog.tags);
                          if (!cardTags.length) return null;
                          return (
                            <div className="mb-4 flex flex-wrap gap-1.5">
                              {cardTags.slice(0, 3).map((tag, tIdx) => (
                                <span key={`${tag}-${tIdx}`} className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                                  {tag}
                                </span>
                              ))}
                              {cardTags.length > 3 && (
                                <span className="rounded-full bg-gray-50 px-3 py-1 text-[10px] font-bold text-gray-400">
                                  +{cardTags.length - 3}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                        
                        <div className="mt-auto flex items-center gap-2 text-sm font-bold text-[#2563eb]">
                          <span>Read More</span>
                          <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {filteredBlogs.length === 0 && activeTag && (
                  <div className="text-center py-16">
                    <p className="text-gray-400 font-bold">No posts tagged &quot;{activeTag}&quot;</p>
                    <button onClick={() => setActiveTag(null)} className="mt-2 text-blue-600 font-bold text-sm hover:underline">Clear filter</button>
                  </div>
                )}
              </div>

              {/* Tags Sidebar */}
              {allTags.length > 0 && (
                <aside className="hidden lg:block w-64 shrink-0">
                  <div className="sticky top-36 space-y-6">
                    <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-5">
                        <IconTag className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Tags</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeTag && (
                          <button
                            onClick={() => setActiveTag(null)}
                            className="rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            All
                          </button>
                        )}
                        {allTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                            className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                              activeTag === tag
                                ? "bg-blue-600 text-white"
                                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-24 flex justify-center">
              <nav className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition-colors hover:border-blue-600 hover:text-blue-600 disabled:opacity-40"
                >
                  <IconChevronLeft className="h-5 w-5" />
                </button>
                
                {getPaginationItems().map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof p === 'number' && setPage(p)}
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold transition-all ${
                      p === page 
                        ? "bg-[#2563eb] text-white shadow-lg" 
                        : typeof p === 'number' 
                          ? "text-gray-500 hover:bg-gray-100 cursor-pointer" 
                          : "cursor-default text-gray-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-blue-600 hover:text-blue-600 disabled:opacity-40"
                >
                  <IconChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </main>

      {/* CTA Section */}
      <section className="bg-[#6366F1] py-24 text-white md:py-32">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-8"
          >
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-[80px] leading-[1.1]">
              Grow Skills. Build Networks.<br />
              Shape Futures.
            </h2>
            <p className="max-w-2xl text-lg font-medium text-white/90 md:text-xl">
              Connect with peers, professionals, and opportunities through SPE University of Ibadan.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 flex items-center gap-4 rounded-full border border-white/40 bg-white/10 px-10 py-4 text-xl font-bold backdrop-blur-sm transition-all hover:bg-white hover:text-[#6366F1]"
            >
              <span>Join SPE</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 group-hover:bg-[#6366F1]/20">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[3px]">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
