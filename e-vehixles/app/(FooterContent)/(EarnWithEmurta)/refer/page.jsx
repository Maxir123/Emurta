export default function ReferPage() {
  return (
    <main className="bg-white text-gray-800 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Refer & Earn</h1>
        <p className="mb-6 text-gray-600">
          Invite your friends to Emurta and earn rewards for every successful transaction they make.
        </p>
        <div className="bg-gray-50 p-6 rounded shadow space-y-4">
          <p className="text-gray-700">
            Share your unique referral link with friends:
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value="https://emurta.com/signup?ref=YOURCODE"
              className="flex-1 border border-gray-300 rounded p-2"
            />
            <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition">
              Copy
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            You will earn ₦5,000 when your referral completes their first purchase or sale.
          </p>
        </div>
      </div>
    </main>
  );
}
