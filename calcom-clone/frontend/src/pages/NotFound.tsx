import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-900">404</p>
        <p className="mt-2 text-gray-600">Page not found</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          Back to home
        </Link>
      </div>
    </div>
  );
}
