"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaCarSide, FaHandshake, FaTools } from "react-icons/fa";
import Testimonials from "@/components/Testimonials";
import FeaturedVehicles from "@/components/FeaturedVehicles";
import CallToAction from "@/components/CallToAction";
import NewsletterSignup from "@/components/NewsletterSignup";




export default function Home() {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = videoRef.current;
          if (!video) return;

          if (entry.isIntersecting) {
            video.currentTime = 0;
            video.play().catch((err) => console.log("Autoplay error:", err));
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section
        ref={sectionRef}
        className="relative h-screen w-full overflow-hidden"
      >
        {/* Video */}
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
        >
          <source src="HomeBack.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay Content */}
        <div className="relative z-10 flex h-full items-center justify-start">
          <div className="px-4 sm:pl-12 max-w-2xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 text-white leading-tight">
              Buy, Sell & Discover Vehicles with Confidence
            </h1>
            <p className="text-base sm:text-lg mb-6 text-white/90">
              Your trusted marketplace to explore a wide range of cars, trucks, and SUVs—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 bg-blue-600 rounded text-white hover:bg-blue-700">
                Browse Listings
              </button>
              <button className="px-6 py-3 bg-black border border-white text-white rounded hover:bg-gray-200"
              >
                
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Dark overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 z-0"></div>
      </section>


      
          {/* About Section */}
    <section className="w-full bg-gray-100 px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-12">
      {/* Truck Image */}
      <motion.div
      initial={{ x: "-50%", scale: 0.8, opacity: 0 }}
      whileInView={{ x: 0, scale: 1, opacity: 1 }}
      
      transition={{
        type: "spring",
        stiffness: 50,
        damping: 20,
        duration: 1.2
      }}
      className="w-full md:w-1/2 flex justify-center"
    >
      <div className="relative">
        <img
          src="/car3.png"
          alt="Yellow truck"
          className="w-full max-w-md"
        />
        {/* Light glow */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-yellow-400 blur-2xl opacity-70"></div>
      </div>
    </motion.div>

      {/* Text */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        className="w-full md:w-1/2"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
          About Emurta
        </h2>
        <p className="text-gray-700 mb-6 text-base sm:text-lg leading-relaxed">
          Emurta connects you with a wide selection of vehicles available for sale
          or rent. Whether you need a reliable car, a commercial truck, or custom
          vehicle services, our platform makes it easy to browse, compare, and
          connect with trusted sellers. We also offer professional customization—
          from color changes to maintenance and upgrades—to ensure your vehicle
          meets your exact needs.
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
          Learn More About Us
        </button>
      </motion.div>
    </section>
 

      {/* Why Choose Us Section */}
      <section className="w-full bg-white px-6 py-16">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Why Choose Emurta
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            We go beyond listings to make your vehicle buying and selling experience smooth, transparent, and rewarding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 rounded-lg shadow hover:shadow-lg p-6 text-center border border-gray-200"
          >
            <FaCarSide className="text-blue-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Wide Selection
            </h3>
            <p className="text-gray-600">
              Discover cars, trucks, and commercial vehicles across all price ranges and categories.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-50 rounded-lg shadow hover:shadow-lg p-6 text-center border border-gray-200"
          >
            <FaHandshake className="text-blue-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Trusted Partners
            </h3>
            <p className="text-gray-600">
              We work with verified sellers and dealers to ensure every transaction is safe and reliable.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-50 rounded-lg shadow hover:shadow-lg p-6 text-center border border-gray-200"
          >
            <FaTools className="text-blue-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Customization & Support
            </h3>
            <p className="text-gray-600">
              From color changes to maintenance, our team helps you personalize and care for your vehicle.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="w-full bg-gray-50">
        <FeaturedVehicles />
      </section>
      <section>
        <Testimonials />
      </section>

      <section>
        <CallToAction />
      </section>
      <section> 
        <NewsletterSignup />
      </section>
    </main>
  );
}
