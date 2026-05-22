export interface SlotGeneratorParams {
  availabilityStart: string
  availabilityEnd: string
  durationMinutes: number
  existingBookings: Array<{
    startTime: string
    endTime: string
    status: string
  }>
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return h + ':' + m
}

export function generateSlots(params: SlotGeneratorParams): string[] {
  const availabilityStart = timeToMinutes(params.availabilityStart)
  const availabilityEnd = timeToMinutes(params.availabilityEnd)
  const slots: string[] = []
  let cursor = availabilityStart

  while (cursor + params.durationMinutes <= availabilityEnd) {
    const slotStart = cursor
    const slotEnd = cursor + params.durationMinutes
    const hasOverlap = params.existingBookings
      .filter((booking) => booking.status === 'confirmed')
      .some((booking) => (
        slotStart < timeToMinutes(booking.endTime) && slotEnd > timeToMinutes(booking.startTime)
      ))

    if (!hasOverlap) {
      slots.push(minutesToTime(slotStart))
    }

    cursor += params.durationMinutes
  }

  return slots
}
