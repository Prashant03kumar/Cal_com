export interface User { id: string; name: string; email: string; timezone: string }
export interface EventType {
  id: string; userId: string; title: string; slug: string;
  description: string | null; durationMinutes: number; isActive: boolean; createdAt: string
}
export interface AvailabilityRule {
  id: string; scheduleId: string; dayOfWeek: number; startTime: string; endTime: string
}
export interface AvailabilitySchedule {
  id: string; userId: string; name: string; timezone: string; isDefault: boolean
}
export interface Booking {
  id: string; eventTypeId: string; bookerName: string; bookerEmail: string;
  bookingDate: string; startTime: string; endTime: string;
  status: 'confirmed' | 'cancelled'; cancelReason: string | null; createdAt: string;
  eventType?: EventType
}
