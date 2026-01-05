"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaStar, FaUserCircle, FaQuoteLeft } from "react-icons/fa";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function Testimonials() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    async function loadTestimonials() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/testimonials");
        if (!response.ok) throw new Error("Failed to fetch testimonials");
        const data = await response.json();
        setTestimonials(data);
      } catch (error) {
        console.error("Error loading testimonials:", error);
        toast.error("Failed to load testimonials");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTestimonials();
  }, []);


  // Skeleton loader component
  const TestimonialSkeleton = () => (
    <div className="bg-gray-50 rounded-xl p-6 shadow">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
      <div className="flex justify-center mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gray-200 rounded-full mx-1 animate-pulse"></div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-16 md:px-8 md:py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Trusted by Happy Customers
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            See what our users are saying about their experience with Emurta.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {isLoading ? (
            // Skeleton loaders while testimonials are loading
            Array.from({ length: 3 }).map((_, index) => (
              <TestimonialSkeleton key={index} />
            ))
          ) : testimonials.length > 0 ? (
            testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="flex justify-center mb-4">
                  {testimonial.imageUrl ? (
                    <img
                      src={testimonial.imageUrl}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <FaUserCircle className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                
                <div className="flex justify-center mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                  {testimonial.name}
                </h3>
                
                <div className="relative mt-4 flex-grow">
                  <FaQuoteLeft className="text-blue-100 text-3xl absolute -top-2 -left-1" />
                  <p className="text-gray-600 text-sm relative z-10">"{testimonial.quote}"</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="bg-white rounded-xl p-8 max-w-md mx-auto shadow">
                <FaQuoteLeft className="text-4xl text-blue-100 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No testimonials yet.</p>
                <p className="text-gray-600 font-medium">Be the first to share your experience!</p>
              </div>
            </div>
          )}
        </div>

        {/* Testimonial form for logged-in users */}
        {isUserLoaded && user && (
          <a
        href="/add-testimonial"
        className="inline-block mt-6 text-blue-600 hover:underline"
      >
        Add your testimonial
      </a>
        )}

        {/* Call to action for non-logged-in users */}
        {isUserLoaded && !user && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mt-12"
          >
            <div className="bg-white rounded-xl p-8 max-w-md mx-auto shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Share Your Experience
              </h3>
              <p className="text-gray-600 mb-6">Want to share your experience with Emurta?</p>
              <a
                href="/sign-in?redirect_url=/testimonials"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign in to add your testimonial
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}