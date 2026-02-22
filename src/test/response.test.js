import { describe, it, expect, vi } from "vitest";
import { sendSuccess, sendError } from "../../api/_lib/utils/response.js";

function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(data) {
      res.body = data;
      return res;
    },
  };
  return res;
}

describe("sendSuccess", () => {
  it("sends 200 with data wrapper", () => {
    const res = createMockRes();
    sendSuccess(res, 200, { id: 1, name: "Test" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: { id: 1, name: "Test" } });
  });

  it("sends 201 for creation", () => {
    const res = createMockRes();
    sendSuccess(res, 201, { id: 42 });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.id).toBe(42);
  });

  it("wraps arrays", () => {
    const res = createMockRes();
    sendSuccess(res, 200, [1, 2, 3]);
    expect(res.body).toEqual({ data: [1, 2, 3] });
  });
});

describe("sendError", () => {
  it("sends error with code and message", () => {
    const res = createMockRes();
    sendError(res, 400, "VALIDATION_ERROR", "Invalid data");
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toBe("Invalid data");
    expect(res.body.error.details).toBeUndefined();
  });

  it("includes details when provided", () => {
    const res = createMockRes();
    const details = [{ field: "email", message: "required" }];
    sendError(res, 422, "VALIDATION_ERROR", "Validation failed", details);
    expect(res.body.error.details).toEqual(details);
  });

  it("sends 404", () => {
    const res = createMockRes();
    sendError(res, 404, "NOT_FOUND", "Contact not found");
    expect(res.statusCode).toBe(404);
  });

  it("sends 500", () => {
    const res = createMockRes();
    sendError(res, 500, "INTERNAL_ERROR", "Something went wrong");
    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
  });
});
