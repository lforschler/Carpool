import { PrismaClient, TripDirection, TripStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import mock from "../src/lib/mock-schedule.json";

const prisma = new PrismaClient();

type MockTrip = (typeof mock.trips)[number];

/**
 * Upsert seed: keep the Westwood group + demo users (same emails/ids when
 * possible) so JWT sessions survive re-seeds. Only schedule rows are replaced.
 */
async function main() {
  const passwordHash = await hash("carpool123", 10);

  let group = await prisma.carpoolGroup.findFirst({
    where: { name: "Westwood Carpool" },
  });
  if (!group) {
    group = await prisma.carpoolGroup.create({
      data: { name: "Westwood Carpool" },
    });
  }

  // Replace schedule graph for this group; do not delete demo users.
  await prisma.tripRider.deleteMany({
    where: { trip: { groupId: group.id } },
  });
  await prisma.trip.deleteMany({ where: { groupId: group.id } });
  await prisma.child.deleteMany({ where: { family: { groupId: group.id } } });
  await prisma.membership.deleteMany({
    where: { family: { groupId: group.id } },
  });
  await prisma.family.deleteMany({ where: { groupId: group.id } });

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
    const user = await prisma.user.upsert({
      where: { email },
      create: {
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
      update: {
        passwordHash,
        name: drv.fullName,
        phone: family.phone,
        canDrive: true,
        seatCapacity: drv.seatCapacity,
        membership: {
          upsert: {
            create: { familyId: family.id, role: "DRIVER" },
            update: { familyId: family.id, role: "DRIVER" },
          },
        },
      },
    });
    users.push({ mockId: drv.id, user });
  }

  const nicola = await prisma.user.upsert({
    where: { email: "nicola@carpool.local" },
    create: {
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
    update: {
      passwordHash,
      name: "Nicola",
      canDrive: true,
      seatCapacity: 5,
      membership: {
        upsert: {
          create: { familyId: families[0].id, role: "DRIVER" },
          update: { familyId: families[0].id, role: "DRIVER" },
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

  const dates = (mock.trips as MockTrip[]).map((t) => t.date).sort();
  console.log("Seeded Westwood Carpool (upsert; demo user ids preserved)");
  console.log(
    `Schedule: ${mock.schoolYearLabel ?? "sample"} — ${mock.trips.length} trips` +
      (dates.length ? ` (${dates[0]} → ${dates[dates.length - 1]})` : ""),
  );
  if ("sheetTab" in mock && mock.sheetTab) {
    console.log(`Sheet tab: ${mock.sheetTab}`);
  }
  console.log(`Group id (stable): ${group.id}`);
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
