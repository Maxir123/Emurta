export default function AffiliatePage() {
  return (
    <main className="bg-white text-gray-800 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Affiliate Program</h1>
        <p className="mb-6 text-gray-600">
          Become an Emurta affiliate partner and earn commissions by promoting our platform.
        </p>
        <div className="bg-gray-50 p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">How it Works</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Sign up for our affiliate program</li>
            <li>Get your unique tracking link</li>
            <li>Promote Emurta on your website or social media</li>
            <li>Earn up to 10% commission on each successful referral</li>
          </ul>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Join Now
          </button>
        </div>
      </div>
    </main>
  );
}
