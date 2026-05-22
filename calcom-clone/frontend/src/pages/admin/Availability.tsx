import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import PageHeader from "../../components/PageHeader";

const DAYS = [
  { dayOfWeek: 0, label: "Sunday" },
  { dayOfWeek: 1, label: "Monday" },
  { dayOfWeek: 2, label: "Tuesday" },
  { dayOfWeek: 3, label: "Wednesday" },
  { dayOfWeek: 4, label: "Thursday" },
  { dayOfWeek: 5, label: "Friday" },
  { dayOfWeek: 6, label: "Saturday" },
];

type DaySetting = {
  dayOfWeek: number;
  label: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

type AvailabilityResponse = {
  schedule: { id: string; name: string; timezone: string; isDefault: boolean };
  rules: Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string }>;
};

export default function Availability() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [daySettings, setDaySettings] = useState<DaySetting[]>(
    DAYS.map((d) => ({ ...d, enabled: false, startTime: "09:00", endTime: "17:00" })),
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const timeOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of [0, 30]) {
        const value = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
        const period = h < 12 ? "AM" : "PM";
        const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const label = displayH + ":" + String(m).padStart(2, "0") + " " + period;
        options.push({ value, label });
      }
    }
    return options;
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const response = await api.get<AvailabilityResponse>("/availability");
        const { schedule, rules } = response.data;
        setTimezone(schedule.timezone);
        setDaySettings(
          DAYS.map((day) => {
            const rule = rules.find((r) => r.dayOfWeek === day.dayOfWeek);
            return {
              ...day,
              enabled: Boolean(rule),
              startTime: rule?.startTime || "09:00",
              endTime: rule?.endTime || "17:00",
            };
          }),
        );
      } catch (error) {
        setSaveMessage(error instanceof Error ? error.message : "Failed to load availability.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const handleToggleDay = (dayOfWeek: number) => {
    setDaySettings((prev) =>
      prev.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, enabled: !day.enabled } : day)),
    );
  };

  const handleTimeChange = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
    setDaySettings((prev) =>
      prev.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const rules = daySettings
        .filter((day) => day.enabled)
        .map((day) => ({
          dayOfWeek: day.dayOfWeek,
          startTime: day.startTime,
          endTime: day.endTime,
        }));

      await api.post("/availability", { timezone, rules });
      setSaveMessage("Availability saved!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full">
      <PageHeader title="Availability" description="Set when you're available for bookings" />

      <div className="p-6">
        <div className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div className="mt-6">
            {daySettings.map((day) => (
              <div key={day.dayOfWeek} className="flex items-center gap-4 py-3 border-b border-gray-100">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={() => handleToggleDay(day.dayOfWeek)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div className="min-w-[80px] text-sm text-gray-800">{day.label}</div>

                {day.enabled ? (
                  <>
                    <select
                      value={day.startTime}
                      onChange={(e) => handleTimeChange(day.dayOfWeek, "startTime", e.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    >
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-400">-</span>
                    <select
                      value={day.endTime}
                      onChange={(e) => handleTimeChange(day.dayOfWeek, "endTime", e.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    >
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">Unavailable</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {saveMessage && <p className="text-sm text-gray-600">{saveMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
