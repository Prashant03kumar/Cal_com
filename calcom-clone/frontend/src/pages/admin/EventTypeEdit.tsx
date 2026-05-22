import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import PageHeader from "../../components/PageHeader";
import type { EventType } from "../../types";

type EventTypeFormState = {
  title: string;
  slug: string;
  description: string;
  durationMinutes: number;
};

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function EventTypeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<EventTypeFormState>({
    title: "",
    slug: "",
    description: "",
    durationMinutes: 30,
  });
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEventType = async () => {
      if (!id) {
        setError("Missing event type id");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get<EventType>(`/event-types/${id}`);
        setForm({
          title: response.data.title,
          slug: response.data.slug,
          description: response.data.description || "",
          durationMinutes: response.data.durationMinutes,
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load event type");
      } finally {
        setLoading(false);
      }
    };

    fetchEventType();
  }, [id]);

  const onTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugEditedManually ? prev.slug : generateSlug(title),
    }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.put(`/event-types/${id}`, {
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        durationMinutes: form.durationMinutes,
        isActive: true,
      });
      navigate("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update event type");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await api.delete(`/event-types/${id}`);
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete";
      alert(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-full">
      <PageHeader
        title="Edit Event Type"
        description="Update your event type settings"
        action={
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            Back
          </Link>
        }
      />

      <div className="p-6">
        {loading && (
          <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
            <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-10 w-full animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-10 w-full animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-20 w-full animate-pulse rounded bg-gray-200" />
          </div>
        )}

        {!loading && (
          <form onSubmit={onSubmit} className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6 space-y-5">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input
                value={form.title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugEditedManually(true);
                  setForm((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Your booking link: /book/{form.slug || "your-slug"}</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Duration</label>
              <select
                value={form.durationMinutes}
                onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              >
                {[15, 30, 45, 60, 90].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutes
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save changes"}
              </button>
            </div>

            <div className="border-t border-gray-200 pt-5">
              <p className="text-sm font-medium text-red-700">Delete this event type</p>
              <p className="mt-1 text-xs text-gray-500">
                This action cannot be undone and will remove this event type permanently.
              </p>

              {!deleteConfirm && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  className="mt-3 rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  Delete event type
                </button>
              )}

              {deleteConfirm && (
                <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">Delete this event type?</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={onDelete}
                      disabled={deleting}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {deleting ? "Deleting..." : "Yes, delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(false)}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
