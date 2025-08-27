"use client";
import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function AboutPage() {
  const services = [
    {
      icon: "fas fa-car",
      title: "Vehicle Sales",
      description:
        "Connect buyers and sellers across all vehicle categories—from cars to construction equipment.",
    },
    {
      icon: "fas fa-calendar-alt",
      title: "Vehicle Rentals",
      description:
        "Short-term and long-term rental solutions for personal and commercial vehicle needs.",
    },
    {
      icon: "fas fa-wrench",
      title: "Customization Services",
      description:
        "Professional vehicle modification and customization to meet your specific requirements.",
    },
    {
      icon: "fas fa-exchange-alt",
      title: "Vehicle Flipping",
      description:
        "We buy, restore, and resell quality vehicles from our curated inventory.",
    },
  ];

  const values = [
    {
      icon: "fas fa-shield-alt",
      title: "Trust & Security",
      description:
        "Every transaction is protected with our comprehensive verification and security measures.",
    },
    {
      icon: "fas fa-users",
      title: "Community First",
      description:
        "Building lasting relationships between buyers, sellers, and service providers.",
    },
    {
      icon: "fas fa-star",
      title: "Quality Assurance",
      description:
        "Rigorous quality checks ensure every vehicle meets our high standards.",
    },
    {
      icon: "fas fa-globe",
      title: "Innovation",
      description:
        "Leveraging technology to make vehicle transactions seamless and efficient.",
    },
  ];

  
  return (
    <div className={`min-h-screen transition-colors duration-300 `}>
      
      {/* Hero */}
      
      <section className="py-20 px-4 sm:px-6 lg:px-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg mb-6 leading-relaxed">
              We revolutionize the vehicle marketplace by connecting buyers, sellers, and
              service providers across all categories. From everyday cars to specialized
              equipment, we make transactions simple, secure, and efficient.
            </p>
            <p className="text-lg leading-relaxed">
              As both marketplace facilitator and active participant, we bring unique
              insights and quality assurance to every transaction.
            </p>
          </div>
          <div className={`rounded-lg p-8  border shadow-lg`}>
            <img
              src="https://source.unsplash.com/500x300/?cars,showroom"
              alt="Vehicle showroom"
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">All Vehicles, One Platform</h3>
              <p className="text-gray-600 dark:text-gray-300">
                From personal cars to industrial equipment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className={` py-20 px-4 sm:px-6 lg:px-32`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Comprehensive solutions for all your vehicle needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-lg border shadow-lg hover:shadow-xl transition`}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <i className={`${service.icon} text-2xl text-white`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-32">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            The principles that drive everything we do.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-lg  border shadow-lg text-center hover:shadow-xl transition`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <i className={`${value.icon} text-2xl text-white`} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands who trust VehicleHub for their vehicle needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
              Browse Vehicles
            </button>
            <button
              className={`px-8 py-3 rounded-lg font-semibold transition `}
            >
              List Your Vehicle
            </button>
          </div>
        </div>
      </section>
    </div>
    
  );
}

