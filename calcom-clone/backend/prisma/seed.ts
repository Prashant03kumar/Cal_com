import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

async function main() {
  await prisma.booking.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.availabilityRule.deleteMany();
  await prisma.availabilitySchedule.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "alex@calcom.demo",
      timezone: "Asia/Kolkata",
    },
  });

  const thirtyMinuteMeeting = await prisma.eventType.create({
    data: {
      userId: user.id,
      title: "30 Min Meeting",
      slug: "30-min-meeting",
      description: "A quick 30-minute catch-up call",
      durationMinutes: 30,
      isActive: true,
    },
  });

  await prisma.eventType.createMany({
    data: [
      {
        userId: user.id,
        title: "60 Min Consultation",
        slug: "60-min-consultation",
        description: "In-depth consultation session",
        durationMinutes: 60,
        isActive: true,
      },
      {
        userId: user.id,
        title: "15 Min Intro Call",
        slug: "15-min-intro",
        description: "Quick intro to see if we are a good fit",
        durationMinutes: 15,
        isActive: true,
      },
    ],
  });

  const schedule = await prisma.availabilitySchedule.create({
    data: {
      userId: user.id,
      name: "Working Hours",
      timezone: "Asia/Kolkata",
      isDefault: true,
    },
  });

  await prisma.availabilityRule.createMany({
    data: [
      {
        scheduleId: schedule.id,
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
      },
      {
        scheduleId: schedule.id,
        dayOfWeek: 2,
        startTime: "09:00",
        endTime: "17:00",
      },
      {
        scheduleId: schedule.id,
        dayOfWeek: 3,
        startTime: "09:00",
        endTime: "17:00",
      },
      {
        scheduleId: schedule.id,
        dayOfWeek: 4,
        startTime: "09:00",
        endTime: "17:00",
      },
      {
        scheduleId: schedule.id,
        dayOfWeek: 5,
        startTime: "09:00",
        endTime: "17:00",
      },
    ],
  });

  const today = new Date();
  const tomorrowDate = formatDate(addDays(today, 1));
  const threeDaysDate = formatDate(addDays(today, 3));
  const pastDate = formatDate(addDays(today, -5));

  await prisma.booking.createMany({
    data: [
      {
        eventTypeId: thirtyMinuteMeeting.id,
        bookerName: "Rahul Sharma",
        bookerEmail: "rahul@test.com",
        bookingDate: tomorrowDate,
        startTime: "10:00",
        endTime: "10:30",
        status: "confirmed",
      },
      {
        eventTypeId: thirtyMinuteMeeting.id,
        bookerName: "Priya Patel",
        bookerEmail: "priya@test.com",
        bookingDate: threeDaysDate,
        startTime: "14:00",
        endTime: "14:30",
        status: "confirmed",
      },
      {
        eventTypeId: thirtyMinuteMeeting.id,
        bookerName: "Amit Singh",
        bookerEmail: "amit@test.com",
        bookingDate: pastDate,
        startTime: "11:00",
        endTime: "11:30",
        status: "confirmed",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
