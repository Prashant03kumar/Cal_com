import { Link, useLocation, useParams } from "react-router-dom";
import type { Booking } from "../../types";

type PublicEventType = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr + "T00:00:00"));
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return displayH + ":" + String(m).padStart(2, "0") + " " + period;
}

export default function BookingConfirm() {
  const { slug } = useParams();
  const location = useLocation();
  const state = (location.state || {}) as {
    booking?: Booking;
    eventType?: PublicEventType;
  };

  if (!state.booking || !state.eventType) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">Booking not found</h1>
          <Link to="/" className="mt-3 inline-block text-blue-600 hover:text-blue-700">
            Go to home
          </Link>
        </div>
      </div>
    );
  }

  const { booking, eventType } = state;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700 text-2xl">
          ✓
        </div>

        <h1 className="mt-4 text-center text-2xl font-semibold text-gray-900">
          Booking Confirmed!
        </h1>

        <div className="mt-6 rounded-md border border-gray-200 p-4">
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-medium text-gray-900">Event:</span> {eventType.title}
            </p>
            <p>
              <span className="font-medium text-gray-900">Duration:</span> {eventType.durationMinutes} mins
            </p>
            <p>
              <span className="font-medium text-gray-900">Date:</span> {formatDate(booking.bookingDate)}
            </p>
            <p>
              <span className="font-medium text-gray-900">Time:</span>{" "}
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </p>
            <p>
              <span className="font-medium text-gray-900">Name:</span> {booking.bookerName}
            </p>
            <p>
              <span className="font-medium text-gray-900">Email:</span> {booking.bookerEmail}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Add to calendar
        </button>

        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <Link to={`/book/${slug || eventType.slug}`} className="text-blue-600 hover:text-blue-700">
            Book another time
          </Link>
          <Link to="/" className="text-gray-600 hover:text-gray-800">
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
