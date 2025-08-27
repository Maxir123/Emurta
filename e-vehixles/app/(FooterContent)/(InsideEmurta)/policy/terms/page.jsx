export default function TermsPage() {
  return (
    <main className="bg-white text-gray-800 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Terms & Conditions</h1>
        <p className="mb-4 text-gray-700">
          By using Emurta, you agree to comply with these terms and conditions.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>You must provide accurate information when listing vehicles.</li>
          <li>All transactions are subject to verification and approval.</li>
          <li>We reserve the right to suspend accounts violating our policies.</li>
          <li>These terms are subject to change without prior notice.</li>
        </ul>
        <p className="mt-4 text-gray-700">
          For full details, please contact legal@emurta.com.
        </p>
      </div>
    </main>
  );
}
