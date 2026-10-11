import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
const prisma = {
  trip: {
    findFirst: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  tripRider: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  $transaction: vi.fn(async (fn: (tx: typeof prisma) => Promise<void>) =>
    fn(prisma),
  ),
};

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma }));

describe("PATCH /api/trips/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.$transaction.mockImplementation(async (fn) => fn(prisma));
  });

  it("returns 401 without group", async () => {
    auth.mockResolvedValue({ user: { id: "u1", groupId: null } });
    const { PATCH } = await import("@/app/api/trips/[id]/route");
    const res = await PATCH(
      new Request("http://localhost/api/trips/t1", {
        method: "PATCH",
        body: JSON.stringify({ driverId: "drv-1" }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "t1" }) },
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when trip not in group", async () => {
    auth.mockResolvedValue({ user: { id: "u1", groupId: "g1" } });
    prisma.trip.findFirst.mockResolvedValue(null);
    const { PATCH } = await import("@/app/api/trips/[id]/route");
    const res = await PATCH(
      new Request("http://localhost/api/trips/t1", {
        method: "PATCH",
        body: JSON.stringify({ driverId: "drv-1" }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "t1" }) },
    );
    expect(res.status).toBe(404);
  });

  it("assigns a driver and promotes UNASSIGNED → PLANNED", async () => {
    auth.mockResolvedValue({ user: { id: "u1", groupId: "g1" } });
    prisma.trip.findFirst.mockResolvedValue({
      id: "t1",
      groupId: "g1",
      status: "UNASSIGNED",
      driverId: null,
      noSchool: false,
    });
    prisma.trip.findUniqueOrThrow.mockResolvedValue({
      id: "t1",
      groupId: "g1",
      date: new Date("2026-08-25T00:00:00.000Z"),
      direction: "PM",
      time: "3:15 PM",
      driverId: "drv-lucas",
      status: "PLANNED",
      noSchool: false,
      sheetNote: "(No A)",
      createdAt: new Date(),
      updatedAt: new Date(),
      driver: null,
      riders: [
        {
          tripId: "t1",
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
    });

    const { PATCH } = await import("@/app/api/trips/[id]/route");
    const res = await PATCH(
      new Request("http://localhost/api/trips/t1", {
        method: "PATCH",
        body: JSON.stringify({
          driverId: "drv-lucas",
          riderIds: ["kid-blake"],
        }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "t1" }) },
    );

    expect(res.status).toBe(200);
    expect(prisma.trip.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: expect.objectContaining({
        driverId: "drv-lucas",
        status: "PLANNED",
      }),
    });
    expect(prisma.tripRider.deleteMany).toHaveBeenCalledWith({
      where: { tripId: "t1" },
    });
    expect(prisma.tripRider.createMany).toHaveBeenCalledWith({
      data: [{ tripId: "t1", childId: "kid-blake" }],
    });
    const body = await res.json();
    expect(body.riderIds).toEqual(["kid-blake"]);
    expect(body.status).toBe("planned");
  });

  it("marks no-school as CANCELLED", async () => {
    auth.mockResolvedValue({ user: { id: "u1", groupId: "g1" } });
    prisma.trip.findFirst.mockResolvedValue({
      id: "t1",
      groupId: "g1",
      status: "PLANNED",
      driverId: "drv-1",
      noSchool: false,
    });
    prisma.trip.findUniqueOrThrow.mockResolvedValue({
      id: "t1",
      groupId: "g1",
      date: new Date("2026-09-07T00:00:00.000Z"),
      direction: "AM",
      time: "7:30 AM",
      driverId: "drv-1",
      status: "CANCELLED",
      noSchool: true,
      sheetNote: "No School",
      createdAt: new Date(),
      updatedAt: new Date(),
      driver: null,
      riders: [],
    });

    const { PATCH } = await import("@/app/api/trips/[id]/route");
    const res = await PATCH(
      new Request("http://localhost/api/trips/t1", {
        method: "PATCH",
        body: JSON.stringify({ noSchool: true }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "t1" }) },
    );
    expect(res.status).toBe(200);
    expect(prisma.trip.update).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: expect.objectContaining({
        status: "CANCELLED",
        noSchool: true,
      }),
    });
  });
});
