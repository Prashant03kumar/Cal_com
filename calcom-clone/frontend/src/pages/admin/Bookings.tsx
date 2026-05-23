import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import { RowSkeleton } from "../../components/LoadingSkeleton";
import PageHeader from "../../components/PageHeader";
import type { Booking } from "../../types";

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr + "T00:00:00"));
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return displayH + ":" + String(m).padStart(2, "0") + " " + period;
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await api.get<Booking[]>("/bookings");
        setBookings(response.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load bookings";
        alert(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const today = formatDateInput(new Date());
  const upcoming = useMemo(
    () => bookings.filter((b) => b.bookingDate >= today && b.status === "confirmed"),
    [bookings, today],
  );
  const past = useMemo(
    () => bookings.filter((b) => b.bookingDate < today || b.status === "cancelled"),
    [bookings, today],
  );

  const visibleBookings = activeTab === "upcoming" ? upcoming : past;

  const openCancelDialog = (bookingId: string) => {
    setCancellingId(bookingId);
    setCancelReason("");
    setShowCancelDialog(true);
  };

  const closeCancelDialog = () => {
    setShowCancelDialog(false);
    setCancellingId(null);
    setCancelReason("");
  };

  const handleCancel = async () => {
    if (!cancellingId) return;

    try {
      await api.patch(`/bookings/${cancellingId}/cancel`, { reason: cancelReason || undefined });
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === cancellingId
            ? { ...booking, status: "cancelled", cancelReason: cancelReason || null }
            : booking,
        ),
      );
      closeCancelDialog();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel booking";
      alert(message);
    }
  };

  return (
    <div className="min-h-full">
      <PageHeader
        title="Bookings"
        description="View and manage your scheduled meetings"
      />

      <div className="px-6 pt-4 border-b border-gray-200 bg-white">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`pb-3 text-sm ${
              activeTab === "upcoming"
                ? "border-b-2 border-black text-black font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`pb-3 text-sm ${
              activeTab === "past"
                ? "border-b-2 border-black text-black font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Past ({past.length})
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="space-y-3">
                  <RowSkeleton />
                  <RowSkeleton />
                  <RowSkeleton />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && visibleBookings.length === 0 && activeTab === "upcoming" && (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-500">
            <div className="text-3xl">📅</div>
            <p className="mt-3">No upcoming bookings</p>
          </div>
        )}

        {!loading && visibleBookings.length === 0 && activeTab === "past" && (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-500">
            No past bookings
          </div>
        )}

        {!loading &&
          visibleBookings.map((booking) => (
            <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {booking.eventType?.title || "Untitled event"}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {booking.status === "confirmed" ? "Confirmed" : "Cancelled"}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                {formatDate(booking.bookingDate)} · {formatTime(booking.startTime)} –{" "}
                {formatTime(booking.endTime)}
              </p>

              <p className="mt-1 text-sm">
                <span className="font-medium text-gray-800">{booking.bookerName}</span>
                <span className="text-gray-500"> · {booking.bookerEmail}</span>
              </p>

              {activeTab === "upcoming" && booking.status === "confirmed" && (
                <div className="mt-3">
                  <button
                    onClick={() => openCancelDialog(booking.id)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    Cancel booking
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {showCancelDialog && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Cancel Booking</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to cancel this booking? This cannot be undone.
            </p>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeCancelDialog}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Keep booking
              </button>
              <button
                onClick={handleCancel}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
              >
                Cancel booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
