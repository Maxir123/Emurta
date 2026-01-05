"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function NewsletterSignup() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState([]);
  const [isClient, setIsClient] = useState(false);
 

  // NEW STATES
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // === EXISTING EFFECTS (your animation & observer code) ===
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // === HANDLE SUBMIT ===
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setMessage("✅ Successfully subscribed!");
      setEmail("");
      setName("");
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }



  useEffect(() => {
    setIsClient(true);
    
    // Generate icons only on client side
    setFloatingIcons(
      [...Array(12)].map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        scale: Math.random() * 0.5 + 0.5,
        y: Math.random() * 100,
      }))
    );
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full bg-gradient-to-br from-yellow-50 to-amber-50 py-20 px-4 overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-yellow-200/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-amber-200/20 to-transparent"></div>
      
      {/* Floating Mail Icons - Only render on client side */}
      {isClient && floatingIcons.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-300/30 z-0"
          initial={{ y: icon.y, x: Math.random() * 100, scale: icon.scale }}
          animate={{
            y: isVisible ? [icon.y, icon.y + 30, icon.y] : icon.y,
            rotate: isVisible ? [0, 15, -15, 0] : 0,
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: icon.top, left: icon.left }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </motion.div>
      ))}

      <div className="relative max-w-4xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
            Stay Updated With Our Newsletter
          </h2>
          <motion.p 
            className="text-gray-700 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Get the latest listings, exclusive offers, and industry insights delivered to your inbox!
          </motion.p>
        </motion.div>

<motion.form 
  className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
  transition={{ duration: 0.6, delay: 0.4 }}
  onSubmit={handleSubmit}
>
  <motion.div 
    className="relative flex-grow"
    whileHover={{ scale: 1.02 }}
    whileFocus={{ scale: 1.02 }}
  >
    <input
      type="email"
      placeholder="Your Email Address"
      className="w-full px-5 py-4 rounded-xl border-2 border-amber-200 bg-white shadow-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-300 focus:outline-none transition-all"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-400" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  </motion.div>
  
  <motion.button
    type="submit"
    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all transform hover:-translate-y-0.5 hover:shadow-xl"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    disabled={loading}
  >
    {loading ? "Subscribing..." : "Subscribe Now"}
  </motion.button>
</motion.form>

{message && (
  <motion.p 
    className="mt-4 text-sm font-medium"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {message}
  </motion.p>
)}

        <motion.p 
          className="text-xs text-gray-500 mt-4 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          By subscribing, you agree to our <a href="#" className="text-amber-700 hover:underline">Terms of Service</a> and <a href="#" className="text-amber-700 hover:underline">Privacy Policy</a>. You can unsubscribe at any time.
        </motion.p>

        <motion.div 
          className="mt-10 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-gray-700">Exclusive vehicle deals</span>
          </div>
          <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-gray-700">Market insights</span>
          </div>
          <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-gray-700">No spam, ever</span>
          </div>
        </motion.div>
      </div>
      
      {/* Floating elements */}
      <motion.div 
        className="absolute top-10 left-10 w-20 h-20 rounded-full bg-amber-300/20 blur-xl"
        animate={{ 
          scale: isVisible ? [1, 1.2, 1] : 1,
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity
        }}
      />
      <motion.div 
        className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-orange-300/20 blur-xl"
        animate={{ 
          scale: isVisible ? [1, 1.3, 1] : 1,
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          delay: 1
        }}
      />
    </section>
  );
}