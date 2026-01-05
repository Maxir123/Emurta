"use client";
import Link from "next/link";
import React from "react";
import { FaCar, FaMotorcycle, FaShieldAlt, FaTools, FaTruck, FaUsers } from "react-icons/fa";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "David Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      bio: "Vehicle industry expert with 15+ years of experience.",
      social: {
        twitter: "#",
        linkedin: "#",
        instagram: "#"
      }
    },
    {
      name: "Sarah Williams",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      bio: "Technology innovator passionate about seamless user experiences.",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#"
      }
    },
    {
      name: "Michael Chen",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      bio: "Operations specialist ensuring smooth transactions for our customers.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Amina Okon",
      role: "Customer Relations",
      image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      bio: "Dedicated to providing exceptional support to our Nigerian customers.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    }
  ];

  const milestones = [
    { year: "2022", event: "Emurta Founded", description: "Started with a vision to transform vehicle commerce in Nigeria" },
    { year: "2023 Q1", event: "Beta Launch", description: "Initial platform release with 50+ vehicle listings" },
    { year: "2023 Q3", event: "1000+ Users", description: "Reached milestone of 1000 active users on the platform" },
    { year: "2024", event: "International Expansion", description: "Launched vehicle import services from USA and China" },
    { year: "2024 Q2", event: "Mobile App Launch", description: "Released iOS and Android apps for better accessibility" }
  ];

  const features = [
    {
      icon: "fas fa-search",
      title: "Advanced Search",
      description: "Find your perfect vehicle with our powerful filtering system"
    },
    {
      icon: "fas fa-shield-alt",
      title: "Verified Listings",
      description: "Every vehicle is thoroughly inspected and verified"
    },
    {
      icon: "fas fa-tools",
      title: "Customization",
      description: "Customize vehicles to your exact specifications"
    },
    {
      icon: "fas fa-hand-holding-usd",
      title: "Flexible Financing",
      description: "Multiple payment options including installment plans"
    },
    {
      icon: "fas fa-truck",
      title: "Nationwide Delivery",
      description: "We deliver vehicles to any location in Nigeria"
    },
    {
      icon: "fas fa-headset",
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your needs"
    }
  ];

  const stats = [
    { value: "1,000+", label: "Vehicles Listed" },
    { value: "1,200+", label: "Happy Customers" },
    { value: "8+", label: "Vehicle Categories" },
    { value: "4", label: "Countries Served" },
    { value: "95%", label: "Customer Satisfaction" },
    { value: "20+", label: "Verified Sellers" }
  ];

  const technologyStack = [
    { name: "Next.js", description: "React framework for production" },
    { name: "Spring Boot", description: "Java-based backend framework" },
    { name: "PostgreSQL", description: "Relational database system" },
    { name: "AWS", description: "Cloud infrastructure and hosting" },
    { name: "Three.js", description: "3D vehicle visualization" },
    { name: "Paystack", description: "Payment processing" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-4 sm:px-6 lg:px-32">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Emurta</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Revolutionizing vehicle commerce in Nigeria and beyond through technology, trust, and transparency.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg mb-6 leading-relaxed">
              At Emurta, we're transforming how Nigerians buy, sell, and rent vehicles. Our mission is to create a seamless, 
              trustworthy platform that connects vehicle owners, buyers, and renters across Nigeria and beyond.
            </p>
            <p className="text-lg mb-6 leading-relaxed">
              We're not just a marketplace - we're a comprehensive vehicle ecosystem that handles everything from local sales 
              to international imports, customization to financing.
            </p>
                  <div
            className="p-6 rounded-lg border-l-4"
            style={{
              backgroundColor: "#f5faff", // accent
              borderColor: "#2563eb",     // secondary
            }}
          >
            <p className="font-semibold" style={{ color: "#2563eb" }}>
              "To make vehicle ownership and access simple, affordable and convenient for every African."
            </p>
          </div>


          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img
              src="/erik-mclean-_OaxFZBHSx4-unsplash.jpg"
              alt="Emurta vehicle marketplace"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-32 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Emurta By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-32 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Emurta?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                  <i className={`${feature.icon} text-white text-lg`}></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-32 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Vehicle Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <Link
              href={{ pathname: "/vehicles?category=car"}}
              className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition block"
            >
              <FaCar className="text-4xl text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Cars</h3>
              <p className="text-sm text-gray-600">Sedans, SUVs, Hatchbacks</p>
            </Link>

            <Link
              href={{ pathname: "/vehicles?category=truck"}}
              className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition block"
            >
              <FaTruck className="text-4xl text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Trucks</h3>
              <p className="text-sm text-gray-600">Pickups, Lorries, Vans</p>
            </Link>

            <Link
              href={{ pathname: "/vehicles?category=motorcycle"}}
              className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition block"
            >
              <FaMotorcycle className="text-4xl text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Motorcycles</h3>
              <p className="text-sm text-gray-600">Bikes, Scooters, Tricycles</p>
            </Link>

            <Link
              href={{ pathname: "/vehicles?category=construction" }}
              className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition block"
            >
              <FaTools className="text-4xl text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Equipment</h3>
              <p className="text-sm text-gray-600">Construction, Agricultural</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4 sm:px-6 lg:px-32 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary"></div>
            
            {/* Timeline items */}
            {milestones.map((milestone, index) => (
              <div key={index} className={`mb-8 flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center`}>
                <div className="w-1/2 px-4">
                  <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-primary">{milestone.year}</h3>
                    <h4 className="text-lg font-semibold mb-2">{milestone.event}</h4>
                    <p>{milestone.description}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary border-4 border-white"></div>
                <div className="w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

    
   {/* Values Section */}
<section className="py-16 px-4 sm:px-6 lg:px-32 bg-blue-900 text-white">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <div className="text-center p-6 bg-gray-800 rounded-lg shadow-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
          <i className="fas fa-shield-alt text-2xl text-white"></i>
        </div>
        <h3 className="text-xl font-semibold mb-3">Trust & Security</h3>
        <p className="text-gray-300">
          Every transaction is protected with comprehensive verification and security measures.
        </p>
      </div>
      
      <div className="text-center p-6 bg-gray-800 rounded-lg shadow-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
          <i className="fas fa-users text-2xl text-white"></i>
        </div>
        <h3 className="text-xl font-semibold mb-3">Community First</h3>
        <p className="text-gray-300">
          Building lasting relationships between buyers, sellers, and service providers.
        </p>
      </div>
      
      <div className="text-center p-6 bg-gray-800 rounded-lg shadow-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
          <i className="fas fa-star text-2xl text-white"></i>
        </div>
        <h3 className="text-xl font-semibold mb-3">Quality Assurance</h3>
        <p className="text-gray-300">
          Rigorous quality checks ensure every vehicle meets our high standards.
        </p>
      </div>
    
    </div>
  </div>
</section>

  

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-32 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Emurta Community</h2>
          <p className="text-xl text-gray-600 mb-8">
            Become part of Nigeria's fastest growing vehicle marketplace community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition">
              Create Account
            </button>
            <button className="px-8 py-3 bg-white border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition">
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}