"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

export default function TestimonialsChatPage() {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef(null);
  const [quote, setQuote] = useState("");


  // Fetch testimonials on component mount
  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Auto scroll to bottom whenever testimonials change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [testimonials, isLoading]);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/testimonials");
      if (response.ok) {
        const data = await response.json();
        // ensure createdAt is present and convert if needed
        setTestimonials(
          Array.isArray(data)
            ? data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            : []
        );
      } else {
        console.error("Failed to fetch testimonials:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setIsLoading(false);
    }
  };

 // inside your component


const handleSubmit = async (e) => {
  e.preventDefault();
  if (!quote.trim()) return;

  if (!user) {
    alert("Please sign in to post a testimonial.");
    return;
  }

  setIsSubmitting(true);
  try {
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quote: quote.trim() }),
    });

    const body = await (async () => { try { return await res.json(); } catch { return null; } })();

    if (!res.ok) {
      const errMsg = (body && (body.error || body.message)) ? (body.error || body.message) : `Request failed: ${res.status}`;
      throw new Error(errMsg);
    }

    setTestimonials(prev => [...prev, body]);
    setQuote("");
  } catch (err) {
    console.error("Submission error:", err);
    alert("Submission failed: " + (err.message || "unknown error"));
  } finally {
    setIsSubmitting(false);
  }
};



  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:pt-25 md:pt-25 pt-25">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white">
          <h1 className="text-2xl font-bold">Community Testimonials</h1>
          <p className="text-blue-100 mt-1">Share your experience and see what others are saying</p>
        </div>

        {/* Testimonials Chat Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            // Testimonials list
            <div className="space-y-4">
              {testimonials.map((t) => {
                // Support different API shapes:
                // prefer server-enriched values (name/avatar), otherwise fallback
                const author = t.name || t.author || t.userName || null;
                const avatar = t.avatar || t.imageUrl || t.profileImage || null;
                const content = t.quote || t.message || t.content || "";
                return (
                  <div key={t.id} className="flex gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatar}
                          alt={author || "User"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                          {author ? author.charAt(0).toUpperCase() : (t.userId ? t.userId.charAt(0).toUpperCase() : "U")}
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-gray-800">
                          {author || t.userId || "User"}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(t.createdAt)}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm mt-1 border border-gray-100">
                        <p className="text-gray-700 break-words">{content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          ) : (
            // Empty state
            <div className="text-center py-10">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No testimonials yet</h3>
              <p className="text-gray-500">Be the first to share your experience!</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          {!user ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-gray-600">Sign in to post a testimonial.</p>
              <SignInButton>
                <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Sign in
                </button>
              </SignInButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 resize-none"
                  placeholder="Share your experience..."
                  rows={1}
                  required
                  disabled={isSubmitting}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                />
                <div className="absolute right-2 bottom-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !quote.trim()}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .testimonial-card {
            max-width: 70%;
            margin-left: auto;
            margin-right: 0;
            border-radius: 18px 18px 4px 18px;
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            color: white;
          }

          .testimonial-card:nth-child(even) {
            margin-left: 0;
            margin-right: auto;
            border-radius: 18px 18px 18px 4px;
            background: white;
            color: #374151;
            border: 1px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
}
