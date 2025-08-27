"use client";
import React, { useState } from "react";
import Head from "next/head";

function SupportPage() {
  const [activeTab, setActiveTab] = useState("faq");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const faqData = [
    {
      category: "Vehicle Sales",
      questions: [
        {
          question: "How do I list my vehicle for sale?",
          answer: 'To list your vehicle, create an account, click "Sell Vehicle", fill out the vehicle details form with photos, set your price, and submit for review. Our team will verify the listing within 24 hours.',
        },
        {
          question: "What fees are involved in selling a vehicle?",
          answer: "We charge a 3% commission fee only when your vehicle sells successfully. There are no upfront listing fees or hidden charges.",
        },
        {
          question: "How long does it take to sell a vehicle?",
          answer: "Average selling time varies by vehicle type and price. Most vehicles sell within 2-4 weeks. Premium listings get priority placement and sell faster.",
        },
        {
          question: "Can I negotiate prices with buyers?",
          answer: "Yes, our platform includes a secure messaging system where you can communicate and negotiate with potential buyers directly.",
        },
      ],
    },
    {
      category: "Vehicle Rentals",
      questions: [
        {
          question: "What documents do I need to rent a vehicle?",
          answer: "You need a valid driver's license, credit card, and proof of insurance. International renters may need an International Driving Permit.",
        },
        {
          question: "What is your cancellation policy?",
          answer: "Free cancellation up to 24 hours before rental start time. Cancellations within 24 hours incur a 25% fee.",
        },
        {
          question: "Are there mileage restrictions?",
          answer: "Most rentals include 200 miles per day. Additional miles are charged at $0.25 per mile. Unlimited mileage packages are available.",
        },
        {
          question: "What happens if the vehicle breaks down?",
          answer: "Contact our 24/7 roadside assistance immediately. We'll arrange repairs or provide a replacement vehicle at no extra cost.",
        },
      ],
    },
    {
      category: "Financing",
      questions: [
        {
          question: "What financing options are available?",
          answer: "We offer loans through partner banks with rates starting at 3.9% APR. Terms range from 12-84 months depending on vehicle age and your credit score.",
        },
        {
          question: "How do I apply for financing?",
          answer: 'Click "Get Financing" on any vehicle listing, fill out the pre-approval form, and receive instant decisions for most applications.',
        },
        {
          question: "What credit score do I need?",
          answer: "We work with all credit scores. Minimum score for prime rates is 650, but we have options for scores as low as 500.",
        },
        {
          question: "Can I pay off my loan early?",
          answer: "Yes, all our loans allow early payoff without prepayment penalties. You can save on interest by paying early.",
        },
      ],
    },
    {
      category: "Insurance",
      questions: [
        {
          question: "Do you provide insurance coverage?",
          answer: "We partner with leading insurance providers to offer competitive rates. Get quotes instantly through our platform.",
        },
        {
          question: "What types of coverage are available?",
          answer: "We offer liability, comprehensive, collision, gap coverage, and extended warranties for all vehicle types.",
        },
        {
          question: "How do I file an insurance claim?",
          answer: "Contact our insurance partner directly at the number provided in your policy, or use our online claim filing system.",
        },
      ],
    },
    {
      category: "General",
      questions: [
        {
          question: "How do I create an account?",
          answer: 'Click "Sign Up" in the top right corner, enter your email and create a password, then verify your email address.',
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes, we use bank-level encryption and never share your personal information with third parties without your consent.",
        },
        {
          question: "How do I reset my password?",
          answer: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions in the reset email.',
        },
        {
          question: "Can I delete my account?",
          answer: "Yes, go to Account Settings > Privacy > Delete Account. Note that this action is permanent and cannot be undone.",
        },
      ],
    },
  ];

  const supportCategories = [
    {
      icon: "fas fa-tools",
      title: "Technical Support",
      description: "Website issues, app problems, account access",
      color: "bg-blue-500",
    },
    {
      icon: "fas fa-credit-card",
      title: "Billing & Payments",
      description: "Payment issues, refunds, billing questions",
      color: "bg-green-500",
    },
    {
      icon: "fas fa-car-crash",
      title: "Vehicle Issues",
      description: "Vehicle problems, warranty claims, recalls",
      color: "bg-red-500",
    },
    {
      icon: "fas fa-file-contract",
      title: "Legal & Compliance",
      description: "Terms of service, privacy policy, legal matters",
      color: "bg-purple-500",
    },
    {
      icon: "fas fa-handshake",
      title: "Sales Support",
      description: "Buying/selling assistance, pricing questions",
      color: "bg-orange-500",
    },
    {
      icon: "fas fa-calendar-alt",
      title: "Rental Support",
      description: "Booking issues, rental modifications, returns",
      color: "bg-teal-500",
    },
  ];

  const knowledgeBaseArticles = [
    {
      title: "Complete Guide to Buying Your First Vehicle",
      category: "Buying Guide",
      readTime: "8 min read",
      description: "Everything you need to know about purchasing a vehicle through our platform.",
    },
    {
      title: "How to Prepare Your Vehicle for Sale",
      category: "Selling Guide",
      readTime: "5 min read",
      description: "Tips to maximize your vehicle's value and sell faster.",
    },
    {
      title: "Understanding Vehicle Financing Options",
      category: "Financing",
      readTime: "6 min read",
      description: "Compare loan types, rates, and find the best financing for you.",
    },
    {
      title: "Rental Vehicle Inspection Checklist",
      category: "Rentals",
      readTime: "4 min read",
      description: "What to check before and after your rental period.",
    },
    {
      title: "Vehicle Insurance Basics",
      category: "Insurance",
      readTime: "7 min read",
      description: "Understanding coverage types and choosing the right policy.",
    },
    {
      title: "Troubleshooting Common Account Issues",
      category: "Account Help",
      readTime: "3 min read",
      description: "Quick solutions for login, password, and profile problems.",
    },
  ];

  const filteredFaqs = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  const filteredArticles = knowledgeBaseArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";
    if (!formData.subject.trim()) errors.subject = "Subject is required";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.message.trim()) errors.message = "Message is required";
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          category: "",
          message: "",
        });
        setTimeout(() => setSubmitSuccess(false), 5000);
      }, 2000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <>

      <div className="min-h-screen bg-white text-gray-900 mt-19">
        <header className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex justify-center items-center mb-6">
                <i className="fas fa-car text-5xl text-blue-400 mr-4"></i>
                <h1 className="text-4xl md:text-6xl font-bold font-inter">Support Center</h1>
              </div>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-roboto">
                We're here to help you with all your vehicle needs
              </p>
            </div>

            <div className="mb-12">
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search FAQs and articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-6 py-4 pl-12 rounded-lg border text-lg font-roboto bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button
                  onClick={() => setActiveTab("faq")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 font-inter ${
                    activeTab === "faq" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <i className="fas fa-question-circle mr-2"></i>
                  FAQ
                </button>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 font-inter ${
                    activeTab === "contact" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <i className="fas fa-envelope mr-2"></i>
                  Contact
                </button>
                <button
                  onClick={() => setActiveTab("knowledge")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 font-inter ${
                    activeTab === "knowledge" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <i className="fas fa-book mr-2"></i>
                  Knowledge Base
                </button>
                <button
                  onClick={() => setActiveTab("emergency")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 font-inter ${
                    activeTab === "emergency" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <i className="fas fa-ambulance mr-2"></i>
                  Emergency
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "faq" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {supportCategories.map((category, index) => (
                    <div
                      key={index}
                      className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                    >
                      <div className="text-center">
                        <div
                          className={`w-16 h-16 mx-auto mb-4 ${category.color} rounded-full flex items-center justify-center`}
                        >
                          <i className={`${category.icon} text-2xl text-white`}></i>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 font-inter">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-roboto">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredFaqs.map((category, categoryIndex) => (
                  <div
                    key={categoryIndex}
                    className="rounded-lg bg-white border border-gray-200 shadow-lg p-6 mb-8"
                  >
                    <h3 className="text-2xl font-bold mb-6 font-inter text-blue-600">
                      {category.category}
                    </h3>
                    <div className="space-y-4">
                      {category.questions.map((faq, faqIndex) => {
                        const faqId = `${categoryIndex}-${faqIndex}`;
                        const isExpanded = expandedFaq === faqId;
                        return (
                          <div
                            key={faqIndex}
                            className="border rounded-lg border-gray-200"
                          >
                            <button
                              onClick={() =>
                                setExpandedFaq(isExpanded ? null : faqId)
                              }
                              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                            >
                              <span className="font-semibold font-inter">
                                {faq.question}
                              </span>
                              <i
                                className={`fas fa-chevron-${
                                  isExpanded ? "up" : "down"
                                } text-gray-400`}
                              ></i>
                            </button>
                            {isExpanded && (
                              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <p className="text-gray-600 font-roboto leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-phone text-2xl text-white"></i>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-inter">
                      Phone Support
                    </h3>
                    <p className="text-gray-600 font-roboto mb-3">
                      1-800-VEHICLE
                      <br />
                      (1-800-834-4253)
                    </p>
                    <p className="text-sm text-gray-500 font-roboto">
                      Mon-Fri: 8AM-8PM EST
                      <br />
                      Sat-Sun: 9AM-6PM EST
                    </p>
                  </div>

                  <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-envelope text-2xl text-white"></i>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-inter">
                      Email Support
                    </h3>
                    <p className="text-gray-600 font-roboto mb-3">
                      support@vehiclehub.com
                    </p>
                    <p className="text-sm text-gray-500 font-roboto">
                      Response within 24 hours
                    </p>
                  </div>

                  <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-comments text-2xl text-white"></i>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-inter">
                      Live Chat
                    </h3>
                    <p className="text-gray-600 font-roboto mb-3">
                      Instant messaging support
                    </p>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300 font-inter">
                      Start Chat
                    </button>
                  </div>

                  <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                    <div className="w-16 h-16 mx-auto mb-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-ticket-alt text-2xl text-white"></i>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-inter">
                      Support Ticket
                    </h3>
                    <p className="text-gray-600 font-roboto mb-3">
                      Track your support requests
                    </p>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-300 font-inter">
                      View Tickets
                    </button>
                  </div>
                </div>

                <div className="rounded-lg bg-white border border-gray-200 shadow-lg p-8">
                  <h3 className="text-2xl font-bold mb-6 font-inter">
                    Contact Form
                  </h3>
                  {submitSuccess && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                      <i className="fas fa-check-circle mr-2"></i>
                      Your message has been sent successfully! We'll get back to
                      you within 24 hours.
                    </div>
                  )}
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2 font-inter">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border font-roboto bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.name ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-sm mt-1 font-roboto">
                            {formErrors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 font-inter">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border font-roboto bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.email ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-sm mt-1 font-roboto">
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2 font-inter">
                          Subject *
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border font-roboto bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.subject ? "border-red-500" : ""
                          }`}
                        />
                        {formErrors.subject && (
                          <p className="text-red-500 text-sm mt-1 font-roboto">
                            {formErrors.subject}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 font-inter">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border font-roboto bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.category ? "border-red-500" : ""
                          }`}
                        >
                          <option value="">Select a category</option>
                          <option value="technical">Technical Support</option>
                          <option value="billing">Billing & Payments</option>
                          <option value="vehicle">Vehicle Issues</option>
                          <option value="legal">Legal & Compliance</option>
                          <option value="sales">Sales Support</option>
                          <option value="rental">Rental Support</option>
                        </select>
                        {formErrors.category && (
                          <p className="text-red-500 text-sm mt-1 font-roboto">
                            {formErrors.category}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 font-inter">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="6"
                        className={`w-full px-4 py-3 rounded-lg border font-roboto bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.message ? "border-red-500" : ""
                        }`}
                        placeholder="Please describe your issue in detail..."
                      ></textarea>
                      {formErrors.message && (
                        <p className="text-red-500 text-sm mt-1 font-roboto">
                          {formErrors.message}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 font-inter"
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane mr-2"></i>
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "knowledge" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article, index) => (
                    <div
                      key={index}
                      className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                    >
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-roboto">
                          {article.category}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 font-roboto">
                          {article.readTime}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-3 font-inter">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 font-roboto mb-4">
                        {article.description}
                      </p>
                      <button className="text-blue-600 hover:text-blue-700 font-semibold font-inter">
                        Read Article <i className="fas fa-arrow-right ml-1"></i>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-white border border-gray-200 shadow-lg p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4 font-inter">
                    Can't Find What You're Looking For?
                  </h3>
                  <p className="text-gray-600 mb-6 font-roboto">
                    Our support team is here to help with any questions not
                    covered in our knowledge base.
                  </p>
                  <button
                    onClick={() => setActiveTab("contact")}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 font-inter"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            )}

            {activeTab === "emergency" && (
              <div className="space-y-8">
                <div className="rounded-lg bg-red-50 border border-red-200 p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-3xl text-white"></i>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-red-800 font-inter">
                    24/7 Emergency Roadside Assistance
                  </h2>
                  <p className="text-xl text-red-700 mb-6 font-roboto">
                    For immediate roadside assistance, call our emergency
                    hotline
                  </p>
                  <div className="text-4xl font-bold text-red-800 mb-6 font-inter">
                    1-800-HELP-NOW
                  </div>
                  <p className="text-red-600 font-roboto">
                    Available 24 hours a day, 7 days a week
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-tools text-2xl text-white"></i>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-inter">
                      Mechanical Breakdown
                    </h3>
                    <p className="text-gray-600 font-roboto">
                      Engine problems, flat tires, battery issues
                    </p>
                  </div>

                  <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-key text-2xl text-white"></i>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-inter">
                      Lockout Service
                    </h3>
                    <p className="text-gray-600 font-roboto">
                      Locked out of your vehicle or lost keys
                    </p>
                  </div>

                  <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-truck text-2xl text-white"></i>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-inter">
                      Towing Service
                    </h3>
                    <p className="text-gray-600 font-roboto">
                      Emergency towing to nearest service center
                    </p>
                  </div>

                  <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-gas-pump text-2xl text-white"></i>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-inter">
                      Fuel Delivery
                    </h3>
                    <p className="text-gray-600 font-roboto">
                      Emergency fuel delivery service
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-white border border-gray-200 shadow-lg p-8">
                  <h3 className="text-2xl font-bold mb-6 font-inter">
                    What to Do in an Emergency
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold mb-4 font-inter">
                        Before Calling:
                      </h4>
                      <ul className="space-y-2 text-gray-600 font-roboto">
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          Move to a safe location if possible
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          Turn on hazard lights
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          Note your exact location
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mr-2 mt-1"></i>
                          Have your vehicle information ready
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-4 font-inter">
                        Information Needed:
                      </h4>
                      <ul className="space-y-2 text-gray-600 font-roboto">
                        <li className="flex items-start">
                          <i className="fas fa-info-circle text-blue-500 mr-2 mt-1"></i>
                          Your name and phone number
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-info-circle text-blue-500 mr-2 mt-1"></i>
                          Vehicle make, model, and year
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-info-circle text-blue-500 mr-2 mt-1"></i>
                          License plate number
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-info-circle text-blue-500 mr-2 mt-1"></i>
                          Description of the problem
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-clock text-2xl text-white"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2 font-inter">
                  Business Hours
                </h3>
                <div className="text-gray-600 font-roboto">
                  <p>Monday - Friday: 8AM - 8PM EST</p>
                  <p>Saturday - Sunday: 9AM - 6PM EST</p>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-reply text-2xl text-white"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2 font-inter">
                  Response Times
                </h3>
                <div className="text-gray-600 font-roboto">
                  <p>Live Chat: Instant</p>
                  <p>Phone: Immediate</p>
                  <p>Email: Within 24 hours</p>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-lg text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-user-cog text-2xl text-white"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2 font-inter">
                  Self-Service
                </h3>
                <div className="text-gray-600 font-roboto">
                  <p>Account Management</p>
                  <p>Order Tracking</p>
                  <p>Payment History</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default SupportPage;