import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
const prisma = {
  family: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  child: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma }));

describe("GET/PATCH /api/family", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns 401 without family membership", async () => {
    auth.mockResolvedValue({ user: { id: "u1", familyId: null } });
    const { GET } = await import("@/app/api/family/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET returns family with children", async () => {
    auth.mockResolvedValue({ user: { id: "u1", familyId: "fam-1" } });
    const family = {
      id: "fam-1",
      name: "Brewer",
      children: [{ id: "kid-anderson", name: "Anderson", shortName: "Andy" }],
    };
    prisma.family.findUnique.mockResolvedValue(family);

    const { GET } = await import("@/app/api/family/route");
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({
      name: "Brewer",
      children: [{ shortName: "Andy" }],
    });
  });

  it("GET returns 404 when family row missing", async () => {
    auth.mockResolvedValue({ user: { id: "u1", familyId: "fam-missing" } });
    prisma.family.findUnique.mockResolvedValue(null);
    const { GET } = await import("@/app/api/family/route");
    const res = await GET();
    expect(res.status).toBe(404);
  });

  it("PATCH rejects invalid body", async () => {
    auth.mockResolvedValue({ user: { id: "u1", familyId: "fam-1" } });
    const { PATCH } = await import("@/app/api/family/route");
    const res = await PATCH(
      new Request("http://localhost/api/family", {
        method: "PATCH",
        body: JSON.stringify({ name: "" }),
        headers: { "content-type": "application/json" },
      }),
    );
    expect(res.status).toBe(400);
    expect(prisma.family.update).not.toHaveBeenCalled();
  });

  it("PATCH updates family fields", async () => {
    auth.mockResolvedValue({ user: { id: "u1", familyId: "fam-1" } });
    prisma.family.update.mockResolvedValue({
      id: "fam-1",
      name: "Brewer",
      phone: "618-367-1329",
      children: [],
    });
    const { PATCH } = await import("@/app/api/family/route");
    const res = await PATCH(
      new Request("http://localhost/api/family", {
        method: "PATCH",
        body: JSON.stringify({ phone: "618-367-1329" }),
        headers: { "content-type": "application/json" },
      }),
    );
    expect(res.status).toBe(200);
    expect(prisma.family.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "fam-1" },
        data: { phone: "618-367-1329" },
      }),
    );
  });
});

describe("POST /api/family/kids", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a child for the session family", async () => {
    auth.mockResolvedValue({ user: { id: "u1", familyId: "fam-1" } });
    prisma.child.create.mockResolvedValue({
      id: "kid-new",
      familyId: "fam-1",
      name: "Anderson",
      shortName: "Andy",
    });

    const { POST } = await import("@/app/api/family/kids/route");
    const res = await POST(
      new Request("http://localhost/api/family/kids", {
        method: "POST",
        body: JSON.stringify({ name: "Anderson", shortName: "Andy" }),
        headers: { "content-type": "application/json" },
      }),
    );
    expect(res.status).toBe(201);
    expect(prisma.child.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        familyId: "fam-1",
        name: "Anderson",
        shortName: "Andy",
      }),
    });
  });

  it("rejects unauthenticated create", async () => {
    auth.mockResolvedValue(null);
    const { POST } = await import("@/app/api/family/kids/route");
    const res = await POST(
      new Request("http://localhost/api/family/kids", {
        method: "POST",
        body: JSON.stringify({ name: "X" }),
        headers: { "content-type": "application/json" },
      }),
    );
    expect(res.status).toBe(401);
  });
});
