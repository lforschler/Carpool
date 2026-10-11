import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
const prisma = {
  carpoolGroup: { findUnique: vi.fn() },
  user: { findUnique: vi.fn(), findMany: vi.fn() },
  family: { findMany: vi.fn() },
  child: { findMany: vi.fn() },
  trip: { findMany: vi.fn() },
};

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma }));

describe("GET /api/schedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);
    const { GET } = await import("@/app/api/schedule/route");
    const res = await GET();
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({ error: "Unauthorized" });
  });

  it("returns 401 with re-seed hint when group missing", async () => {
    auth.mockResolvedValue({
      user: { id: "u1", groupId: "stale-group" },
    });
    prisma.carpoolGroup.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({
      membership: null,
    });

    const { GET } = await import("@/app/api/schedule/route");
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
    expect(body.hint).toMatch(/re-seed/i);
  });

  it("returns schedule payload for a valid group", async () => {
    auth.mockResolvedValue({
      user: { id: "u1", groupId: "g1" },
    });
    prisma.carpoolGroup.findUnique.mockResolvedValue({ id: "g1" });
    prisma.family.findMany.mockResolvedValue([
      {
        id: "fam-1",
        name: "Forschler",
        homeAddress: "123",
        phone: null,
        memberships: [
          {
            user: {
              id: "drv-1",
              name: "Lucas Forschler",
              email: "lucas@carpool.local",
              passwordHash: "x",
              phone: null,
              canDrive: true,
              seatCapacity: 5,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
        children: [
          {
            id: "kid-blake",
            familyId: "fam-1",
            name: "Blake",
            shortName: "Blake",
            school: null,
            grade: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ]);
    prisma.user.findMany.mockResolvedValue([
      {
        id: "drv-1",
        name: "Lucas Forschler",
        email: "lucas@carpool.local",
        passwordHash: "x",
        phone: null,
        canDrive: true,
        seatCapacity: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    prisma.child.findMany.mockResolvedValue([
      {
        id: "kid-blake",
        familyId: "fam-1",
        name: "Blake",
        shortName: "Blake",
        school: null,
        grade: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    prisma.trip.findMany.mockResolvedValue([
      {
        id: "trip-1",
        groupId: "g1",
        date: new Date("2026-08-25T00:00:00.000Z"),
        direction: "AM",
        time: "7:30 AM",
        driverId: "drv-1",
        status: "PLANNED",
        noSchool: false,
        sheetNote: "Lucas",
        createdAt: new Date(),
        updatedAt: new Date(),
        driver: null,
        riders: [
          {
            tripId: "trip-1",
            childId: "kid-blake",
            child: {
              id: "kid-blake",
              familyId: "fam-1",
              name: "Blake",
              shortName: "Blake",
              school: null,
              grade: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      },
    ]);

    const { GET } = await import("@/app/api/schedule/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("database");
    expect(body.trips).toHaveLength(1);
    expect(body.trips[0].riderIds).toEqual(["kid-blake"]);
    expect(body.kids[0].name).toBe("Blake");
  });
});
