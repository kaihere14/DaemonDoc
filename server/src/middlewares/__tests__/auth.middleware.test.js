import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

const userFindById = vi.fn();
vi.mock("../../schema/user.schema.js", () => ({
  default: { findById: (...args) => userFindById(...args) },
}));

const { authenticate, requireAdmin } = await import("../auth.middleware.js");

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function tokenFor(payload, options) {
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

describe("authenticate", () => {
  it("401s with no Authorization header", () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("401s on a header that isn't a Bearer token", () => {
    const req = { headers: { authorization: "Basic abc" } };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("attaches userId and calls next() for a valid token", () => {
    const token = tokenFor({ userId: "user-123" });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(req.userId).toBe("user-123");
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("401s with a specific message for an expired token", () => {
    const token = tokenFor({ userId: "user-123" }, { expiresIn: -10 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token expired" });
  });

  it("401s with a specific message for a malformed token", () => {
    const req = { headers: { authorization: "Bearer not-a-real-jwt" } };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });

  it("401s for a token signed with the wrong secret", () => {
    const token = jwt.sign({ userId: "x" }, "not-the-real-secret");
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    userFindById.mockReset();
  });

  function mockQuery(result) {
    return {
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(result),
    };
  }

  it("401s when authenticate did not set req.userId", async () => {
    const res = mockRes();
    const next = vi.fn();
    await requireAdmin({}, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("404s when the user no longer exists", async () => {
    userFindById.mockReturnValue(mockQuery(null));
    const res = mockRes();
    const next = vi.fn();

    await requireAdmin({ userId: "u1" }, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("403s for a non-admin user", async () => {
    userFindById.mockReturnValue(mockQuery({ admin: false }));
    const res = mockRes();
    const next = vi.fn();

    await requireAdmin({ userId: "u1" }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("calls next() for an admin user", async () => {
    userFindById.mockReturnValue(mockQuery({ admin: true }));
    const res = mockRes();
    const next = vi.fn();

    await requireAdmin({ userId: "u1" }, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("500s when the lookup throws", async () => {
    userFindById.mockImplementation(() => {
      throw new Error("db down");
    });
    const res = mockRes();
    const next = vi.fn();

    await requireAdmin({ userId: "u1" }, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
