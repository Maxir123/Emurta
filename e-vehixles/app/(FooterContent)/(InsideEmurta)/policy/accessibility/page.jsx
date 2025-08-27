export default function AccessibilityPage() {
  return (
    <main className="bg-white text-gray-800 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Accessibility</h1>
        <p className="mb-4 text-gray-700">
          Emurta is committed to providing a website that is accessible to all users, including individuals with disabilities.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>We strive to follow WCAG 2.1 accessibility guidelines.</li>
          <li>Our website is compatible with screen readers and keyboard navigation.</li>
          <li>We regularly review and improve accessibility features.</li>
        </ul>
        <p className="mt-4 text-gray-700">
          If you experience any difficulty accessing our content, please contact us at accessibility@emurta.com so we can assist you.
        </p>
      </div>
    </main>
  );
}
