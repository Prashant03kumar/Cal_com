import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import PageHeader from "../../components/PageHeader";

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

export default function EventTypeNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState<EventTypeFormState>({
    title: "",
    slug: "",
    description: "",
    durationMinutes: 30,
  });
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugEditedManually ? prev.slug : generateSlug(title),
    }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post("/event-types", {
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        durationMinutes: form.durationMinutes,
      });
      navigate("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create event type");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full">
      <PageHeader
        title="New Event Type"
        description="Create a new bookable event type"
        action={
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            Back
          </Link>
        }
      />

      <div className="p-6">
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
              placeholder="30 Min Meeting"
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
              placeholder="30-min-meeting"
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
              placeholder="A short description of this event"
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

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create event type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
