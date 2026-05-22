import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import { CardSkeleton } from "../../components/LoadingSkeleton";
import PageHeader from "../../components/PageHeader";
import type { EventType } from "../../types";

const stripeColors = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3.75 5h12.5" />
      <path d="M8 5V3.75A1.25 1.25 0 0 1 9.25 2.5h1.5A1.25 1.25 0 0 1 12 3.75V5" />
      <path d="M6 5l.6 10.2A1.25 1.25 0 0 0 7.85 16.4h4.3a1.25 1.25 0 0 0 1.25-1.2L14 5" />
      <path d="M8.75 8.2v5.6M11.25 8.2v5.6" />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const fetchEventTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<EventType[]>("/event-types");
      setEventTypes(response.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load event types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventTypes();
  }, [fetchEventTypes]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/event-types/${id}`);
      setEventTypes((prev) => prev.filter((eventType) => eventType.id !== id));
      setDeletingId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete";
      alert(message);
    }
  };

  const handleCopy = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`);
      setCopiedSlug(slug);
      setTimeout(() => {
        setCopiedSlug((current) => (current === slug ? null : current));
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to copy link";
      alert(message);
    }
  };

  return (
    <div className="min-h-full">
      <PageHeader
        title="Event Types"
        description="Manage your bookable event types"
        action={
          <Link
            to="/event-types/new"
            className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800"
          >
            + New event type
          </Link>
        }
      />

      <div className="p-6">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <CardSkeleton key={item} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchEventTypes}
              className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && eventTypes.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
              📅
            </div>
            <p className="text-base font-medium text-gray-900">No event types yet</p>
            <Link
              to="/event-types/new"
              className="mt-4 inline-flex rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              Create your first event type
            </Link>
          </div>
        )}

        {!loading && !error && eventTypes.length > 0 && (
          <div className="space-y-4">
            {eventTypes.map((eventType, index) => (
              <div
                key={eventType.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-4"
              >
                <div
                  className="w-1 self-stretch rounded-full"
                  style={{ backgroundColor: stripeColors[index % stripeColors.length] }}
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{eventType.title}</h3>
                  <p className="text-sm text-gray-500">{eventType.durationMinutes} mins</p>
                  <p className="mt-1 text-sm text-gray-600 truncate">
                    {eventType.description || "No description"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-400">{`calcom.demo/book/${eventType.slug}`}</span>
                    <button
                      onClick={() => handleCopy(eventType.slug)}
                      className="text-xs rounded border border-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-50"
                    >
                      {copiedSlug === eventType.slug ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  {deletingId === eventType.id && (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
                      <p className="text-sm text-red-700">Delete this event type?</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleDelete(eventType.id)}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
                        >
                          Yes, delete
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/event-types/${eventType.id}/edit`)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingId(eventType.id)}
                    className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    aria-label="Delete event type"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
