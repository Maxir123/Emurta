export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white text-gray-800 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
        <p className="mb-4 text-gray-700">
          We value your privacy and are committed to protecting your personal information.
        </p>
        <p className="mb-4 text-gray-700">
          This policy explains how we collect, use, and safeguard your data when you use our services.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>We collect information you provide when creating an account or listing a vehicle.</li>
          <li>We use cookies to enhance your experience.</li>
          <li>Your data is never sold to third parties.</li>
          <li>You can request deletion of your data at any time.</li>
        </ul>
        <p className="mt-4 text-gray-700">
          For questions, please contact us at privacy@emurta.com.
        </p>
      </div>
    </main>
  );
}
