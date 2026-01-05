"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CallToAction() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, []);

  // generate particles only after mount (client-only randomness)
  useEffect(() => {
    if (!mounted) return;
    const generated = Array.from({ length: 8 }).map(() => ({
      y: Math.random() * 100,
      x: Math.random() * 100,
      width: Math.random() * 20 + 5,
      height: Math.random() * 20 + 5,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }));
    setParticles(generated);
  }, [mounted]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black text-white py-24 md:py-32 overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/images/tires.jpg')" }}
      />

      {/* Gradient overlay: avoid initial mismatch by setting initial={false} */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-black via-blue-900/30 to-black"
        initial={false}
        animate={{ opacity: isVisible ? 0.8 : 0 }}
        transition={{ duration: 1 }}
      />

      {/* Floating particles (render only after mount) */}
      {mounted &&
        particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5 border border-white/10"
            initial={false}
            animate={{
              y: isVisible ? p.y : p.y * 0.2,
              x: isVisible ? p.x : p.x * 0.2,
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              top: p.top,
              left: p.left,
              width: `${p.width}px`,
              height: `${p.height}px`,
            }}
          />
        ))}

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={false}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Join Our <span className="text-blue-400">Premium</span> Vehicle Marketplace Today
          </h2>

          <motion.p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-gray-200"
            initial={false}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Sign up now to start buying, selling, or renting vehicles with unmatched ease and
            confidence.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={false}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* If browser extensions keep injecting attributes and causing warnings,
                you can add suppressHydrationWarning={true} to the smallest wrapper. */}
            <motion.button
              onClick={() => router.push("/sign-up")}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Sign Up Free"
              initial={false}
            >
              Sign Up Free
            </motion.button>

            <motion.button
              onClick={() => router.push("/about")}
              className="px-8 py-3.5 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Learn More"
              initial={false}
            >
              Learn More
            </motion.button>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-6 text-gray-300 text-sm md:text-base"
            initial={false}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Premium vehicles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Verified sellers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Secure transactions</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative floating elements (no initial animation) */}
      <motion.div
        className="absolute bottom-10 left-10 w-20 h-20 rounded-full bg-blue-500/20 blur-xl"
        animate={{ scale: isVisible ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 4, repeat: Infinity }}
        initial={false}
      />
      <motion.div
        className="absolute top-10 right-10 w-24 h-24 rounded-full bg-blue-500/20 blur-xl"
        animate={{ scale: isVisible ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        initial={false}
      />
    </section>
  );
}
