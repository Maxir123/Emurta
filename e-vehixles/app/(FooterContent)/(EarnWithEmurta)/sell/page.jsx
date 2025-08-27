export default function SellPage() {
  return (
    <main className="bg-white text-gray-800 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Sell Your Vehicle</h1>
        <p className="mb-6 text-gray-600">
          Easily list your vehicle on Emurta and reach thousands of buyers across Nigeria and beyond.
        </p>
        <form className="bg-gray-50 p-6 rounded shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Make</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              placeholder="e.g. Toyota"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              placeholder="e.g. Corolla"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded p-2"
              placeholder="e.g. 2018"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (₦)</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded p-2"
              placeholder="e.g. 3,500,000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded p-2"
              rows="4"
              placeholder="Describe your vehicle..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Submit Listing
          </button>
        </form>
      </div>
    </main>
  );
}
