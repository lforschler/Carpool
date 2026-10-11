import { PrismaClient, TripDirection, TripStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import mock from "../src/lib/mock-schedule.json";

const prisma = new PrismaClient();

type MockTrip = (typeof mock.trips)[number];

async function main() {
  await prisma.tripRider.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.child.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.family.deleteMany();
  await prisma.user.deleteMany();
  await prisma.carpoolGroup.deleteMany();

  const passwordHash = await hash("carpool123", 10);

  const group = await prisma.carpoolGroup.create({
    data: { name: "Westwood Carpool" },
  });

  const families = await Promise.all(
    mock.families.map((f) =>
      prisma.family.create({
        data: {
          groupId: group.id,
          name: f.name,
          homeAddress: f.address,
          phone: f.phone,
        },
      }),
    ),
  );

  const familyByMockId = Object.fromEntries(
    mock.families.map((f, i) => [f.id, families[i]]),
  );

  const users = [];
  for (const drv of mock.drivers) {
    if (!drv.familyId) continue;
    const family = familyByMockId[drv.familyId];
    if (!family) continue;
    const email = `${drv.name.toLowerCase()}@carpool.local`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: drv.fullName,
        phone: family.phone,
        canDrive: true,
        seatCapacity: drv.seatCapacity,
        membership: {
          create: {
            familyId: family.id,
            role: "DRIVER",
          },
        },
      },
    });
    users.push({ mockId: drv.id, user });
  }

  // Guest driver Nicola (no family in sheet headers)
  const nicola = await prisma.user.create({
    data: {
      email: "nicola@carpool.local",
      passwordHash,
      name: "Nicola",
      canDrive: true,
      seatCapacity: 5,
      membership: {
        create: {
          familyId: families[0].id,
          role: "DRIVER",
        },
      },
    },
  });
  users.push({ mockId: "drv-nicola", user: nicola });

  const driverByMock = Object.fromEntries(
    users.map((u) => [u.mockId, u.user.id]),
  );

  const children = [];
  for (const kid of mock.kids) {
    const familyId = kid.familyId
      ? familyByMockId[kid.familyId]?.id
      : families[0].id;
    if (!familyId) continue;
    const child = await prisma.child.create({
      data: {
        familyId,
        name: kid.name,
        shortName: kid.short,
      },
    });
    children.push({ mockId: kid.id, child });
  }
  const childByMock = Object.fromEntries(
    children.map((c) => [c.mockId, c.child.id]),
  );

  for (const t of mock.trips as MockTrip[]) {
    const status = t.noSchool
      ? TripStatus.CANCELLED
      : t.status === "confirmed"
        ? TripStatus.CONFIRMED
        : t.status === "unassigned" || !t.driverId
          ? TripStatus.UNASSIGNED
          : TripStatus.PLANNED;

    const trip = await prisma.trip.create({
      data: {
        groupId: group.id,
        date: new Date(`${t.date}T00:00:00.000Z`),
        direction: t.direction as TripDirection,
        time: t.time,
        driverId: t.driverId ? (driverByMock[t.driverId] ?? null) : null,
        status,
        noSchool: t.noSchool,
        sheetNote: t.sheetNote || null,
      },
    });

    const riderIds = t.riderIds
      .map((id) => childByMock[id])
      .filter(Boolean) as string[];
    if (riderIds.length) {
      await prisma.tripRider.createMany({
        data: riderIds.map((childId) => ({ tripId: trip.id, childId })),
        skipDuplicates: true,
      });
    }
  }

  console.log("Seeded Westwood Carpool");
  console.log("Demo logins (password: carpool123):");
  for (const u of users) {
    console.log(`  ${u.user.email}`);
  }
  console.log(`Invite token: ${group.inviteToken}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
