export default function FAQPage() {
  const faqs = [
    {
      question: "How do I list my vehicle for sale?",
      answer: "Navigate to the 'Sell Your Vehicle' page and fill out the listing form with your vehicle details."
    },
    {
      question: "How does the referral program work?",
      answer: "Share your unique referral link. When someone signs up and makes a transaction, you earn rewards."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach us via the Contact Us page or email support@emurta.com."
    },
  ];

  return (
    <main className="bg-white text-gray-800 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded shadow">
              <h2 className="text-lg font-semibold text-gray-900">{faq.question}</h2>
              <p className="text-gray-700 mt-2">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
