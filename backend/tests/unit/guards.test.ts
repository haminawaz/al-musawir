import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";

// These requests are all refused before any database query, so no database is needed.
const app = createApp();

describe("public API is read-only", () => {
  const paths = ["/api/v1/site", "/api/v1/projects", "/api/v1/projects/family-house-5-marla", "/api/v1/pages/home", "/api/v1/anything"];

  for (const method of ["post", "put", "patch", "delete"] as const) {
    it(`refuses ${method.toUpperCase()} with 405 on every path`, async () => {
      for (const path of paths) {
        const res = await request(app)[method](path).send({ name: "hacked" });
        expect(res.status, path).toBe(405);
        expect(res.headers.allow).toBe("GET, HEAD, OPTIONS");
        expect(res.body.error).toMatch(/read-only/);
      }
    });
  }

  it("answers CORS preflight for GET without credentials", async () => {
    const res = await request(app)
      .options("/api/v1/projects")
      .set("Origin", "https://example.com")
      .set("Access-Control-Request-Method", "GET");
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("*");
    expect(res.headers["access-control-allow-methods"]).toBe("GET,HEAD,OPTIONS");
    expect(res.headers["access-control-allow-credentials"]).toBeUndefined();
  });
});

describe("admin API is protected", () => {
  it("needs a session for content", async () => {
    for (const [method, path] of [
      ["get", "/api/admin/content"],
      ["get", "/api/admin/site"],
      ["put", "/api/admin/site"],
      ["post", "/api/admin/projects"],
      ["delete", "/api/admin/projects/family-house-5-marla"],
      ["get", "/api/admin/auth/me"],
    ] as const) {
      const res = await request(app)[method](path).send({});
      expect(res.status, `${method} ${path}`).toBe(401);
      expect(res.body).toEqual({ error: "Not signed in." });
    }
  });

  it("rejects a forged or tampered session cookie", async () => {
    const forged = `${Buffer.from(JSON.stringify({ sub: 1, exp: 9_999_999_999, pwd: "x" })).toString("base64url")}.bad-signature`;
    const res = await request(app).get("/api/admin/site").set("Cookie", `am_admin_session=${forged}`);
    expect(res.status).toBe(401);
    expect(res.headers["set-cookie"]?.[0]).toMatch(/am_admin_session=;/);
  });

  it("refuses changes from another site's page (CSRF)", async () => {
    const res = await request(app).put("/api/admin/site").set("Origin", "https://evil.example").send({});
    expect(res.status).toBe(403);
  });

  it("refuses non-JSON bodies", async () => {
    const res = await request(app).post("/api/admin/auth/login").type("form").send("email=a&password=b");
    expect(res.status).toBe(415);
  });

  it("reports malformed JSON as 400", async () => {
    const res = await request(app).post("/api/admin/auth/login").type("json").send("{not json");
    expect(res.status).toBe(400);
  });

  it("validates sign-in before checking it", async () => {
    const res = await request(app).post("/api/admin/auth/login").send({ email: "" });
    expect(res.status).toBe(422);
    expect(res.body.details).toContain("Enter your email and password.");
  });

  it("only lets the dashboard's origin use cookies cross-origin", async () => {
    const allowed = await request(app)
      .options("/api/admin/site")
      .set("Origin", "http://localhost:3001")
      .set("Access-Control-Request-Method", "PUT");
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:3001");
    expect(allowed.headers["access-control-allow-credentials"]).toBe("true");

    const other = await request(app)
      .options("/api/admin/site")
      .set("Origin", "https://evil.example")
      .set("Access-Control-Request-Method", "PUT");
    expect(other.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("never lets admin responses be cached", async () => {
    const res = await request(app).get("/api/admin/site");
    expect(res.headers["cache-control"]).toBe("no-store");
  });
});

describe("general", () => {
  it("has a health check", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: "ok" } });
  });

  it("answers unknown endpoints with JSON 404", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No endpoint/);
  });

  it("does not advertise Express", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});
