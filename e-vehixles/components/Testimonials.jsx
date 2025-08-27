"use client";

import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

const testimonials = [
  {
    id: 1,
    name: "Chinedu Okoro",
    image: "/images/customers/customer1.jpg",
    quote:
      "Emurta made selling my car so easy. Within a week, I had multiple offers and sold it at a great price.",
    rating: 5,
  },
  {
    id: 2,
    name: "Aisha Bello",
    image: "/images/customers/customer2.jpg",
    quote:
      "I found the perfect SUV for my family on Emurta. The process was smooth and transparent.",
    rating: 5,
  },
  {
    id: 3,
    name: "Tunde Johnson",
    image: "/images/customers/customer3.jpg",
    quote:
      "Renting a van for my business was quick and hassle-free. Highly recommend this platform.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="w-full bg-white px-6 py-20">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          Trusted by Happy Customers
        </h2>
        <p className="text-gray-600 text-base sm:text-lg">
          See what our users are saying about their experience with Emurta.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="bg-gray-50 rounded-lg p-6 shadow hover:shadow-md transition"
          >
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {testimonial.name}
            </h3>
            <div className="flex justify-center mb-3">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <FaStar key={i} className="text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-600 text-sm">
              "{testimonial.quote}"
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
