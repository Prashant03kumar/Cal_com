import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import { SlotSkeleton } from "../../components/LoadingSkeleton";
import type { AvailabilityRule, Booking } from "../../types";

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

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [eventType, setEventType] = useState<PublicEventType | null>(null);
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookerName, setBookerName] = useState("");
  const [bookerEmail, setBookerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventTypeResponse, availabilityResponse] = await Promise.all([
          api.get<PublicEventType>(`/public/event-types/${slug}`),
          api.get<{ schedule: { timezone: string }; rules: AvailabilityRule[] }>("/availability"),
        ]);
        setEventType(eventTypeResponse.data);
        setAvailabilityRules(availabilityResponse.data.rules);
      } catch (error) {
        if (error instanceof Error && error.message.toLowerCase().includes("not found")) {
          setNotFound(true);
          return;
        }
        setNotFound(true);
      }
    };

    if (slug) {
      fetchData();
    } else {
      setNotFound(true);
    }
  }, [slug]);

  const today = new Date().toISOString().split("T")[0];
  const availableDays = useMemo(
    () => new Set(availabilityRules.map((rule) => rule.dayOfWeek)),
    [availabilityRules],
  );

  const firstDayOfMonth = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
  const totalCells = 42;

  const isCurrentMonth =
    calMonth.getFullYear() === new Date().getFullYear() &&
    calMonth.getMonth() === new Date().getMonth();

  const handleSelectDate = async (dateString: string) => {
    if (!slug) return;
    setSelectedDate(dateString);
    setSelectedSlot(null);
    setStep(2);
    setSlotsLoading(true);
    setSubmitError(null);
    try {
      const response = await api.get<{ slots: string[] }>(`/slots/${slug}?date=${dateString}`);
      setSlots(response.data.slots || []);
    } catch (error) {
      setSlots([]);
      setSubmitError(error instanceof Error ? error.message : "Failed to load slots");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (
      !eventType ||
      !selectedDate ||
      !selectedSlot ||
      !bookerName.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookerEmail.trim())
    ) {
      setSubmitError("Please fill in all required fields correctly");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post<Booking>("/bookings", {
        eventTypeId: eventType.id,
        bookerName: bookerName.trim(),
        bookerEmail: bookerEmail.trim(),
        bookingDate: selectedDate,
        startTime: selectedSlot,
      });
      navigate(`/book/${slug}/confirm`, {
        state: { booking: response.data, eventType },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("already booked")) {
        setSubmitError(
          "This slot was just booked by someone else. Please go back and select another time.",
        );
      } else {
        setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-700">
            This event type doesn't exist or has been deactivated.
          </p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
            Go to home
          </Link>
        </div>
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-5 md:sticky md:top-4">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
              AJ
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900">{eventType.title}</h1>
            <p className="mt-2 text-sm text-gray-600">🕒 {eventType.durationMinutes} mins</p>
            {eventType.description && (
              <p className="mt-3 text-sm text-gray-600">{eventType.description}</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2 rounded-lg border border-gray-200 bg-white p-5">
          {step === 1 && (
            <div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setCalMonth(
                      new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1),
                    )
                  }
                  disabled={isCurrentMonth}
                  className="text-sm text-gray-700 disabled:text-gray-300"
                >
                  {"< Previous"}
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {calMonth.toLocaleString("en-IN", { month: "long", year: "numeric" })}
                </h2>
                <button
                  onClick={() =>
                    setCalMonth(
                      new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1),
                    )
                  }
                  className="text-sm text-gray-700"
                >
                  {"Next >"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2 font-medium">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 mt-1">
                {Array.from({ length: totalCells }).map((_, index) => {
                  const dayNum = index - firstDayOfMonth + 1;
                  const isOutOfMonth = dayNum < 1 || dayNum > daysInMonth;
                  if (isOutOfMonth) {
                    return <div key={index} className="h-10" />;
                  }

                  const cellDate = new Date(
                    calMonth.getFullYear(),
                    calMonth.getMonth(),
                    dayNum,
                  );
                  const dateString = cellDate.toISOString().split("T")[0];
                  const dayOfWeek = cellDate.getDay();
                  const isPast = dateString < today;
                  const isAvailableDay = availableDays.has(dayOfWeek);
                  const isDisabled = isPast || !isAvailableDay;
                  const isToday = dateString === today;
                  const isSelected = selectedDate === dateString;

                  return (
                    <button
                      key={index}
                      onClick={() => !isDisabled && handleSelectDate(dateString)}
                      disabled={isDisabled}
                      className={`h-10 rounded-md text-sm transition ${
                        isSelected
                          ? "bg-black text-white"
                          : isDisabled
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                      } ${isToday && !isSelected ? "ring-1 ring-blue-500" : ""}`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {"< Back"}
              </button>
              {selectedDate && (
                <h2 className="mt-2 text-lg font-semibold text-gray-900">
                  {formatDate(selectedDate)}
                </h2>
              )}

              {slotsLoading && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SlotSkeleton key={i} />
                  ))}
                </div>
              )}

              {!slotsLoading && slots.length === 0 && (
                <p className="mt-4 text-sm text-gray-500">
                  No available times on this date. Please pick another day.
                </p>
              )}

              {!slotsLoading && slots.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep(3);
                      }}
                      className={`rounded-md px-3 py-2 text-sm ${
                        selectedSlot === slot
                          ? "bg-black text-white"
                          : "bg-white border border-gray-300 hover:border-black"
                      }`}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <button
                onClick={() => setStep(2)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {"< Back"}
              </button>

              <div className="mt-3 rounded-md bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-800">{eventType.title}</p>
                {selectedDate && selectedSlot && (
                  <p className="mt-1 text-sm text-gray-600">
                    {formatDate(selectedDate)} · {formatTime(selectedSlot)}
                  </p>
                )}
              </div>

              {submitError && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Your Name
                  </label>
                  <input
                    value={bookerName}
                    onChange={(e) => setBookerName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={bookerEmail}
                    onChange={(e) => setBookerEmail(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-md bg-black py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-60"
                >
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
