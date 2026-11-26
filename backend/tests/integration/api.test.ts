import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { db, disconnectDatabases, readDb } from "../../src/db/client.js";
import { loadSeedData, seedContent } from "../../src/db/seed.js";
import { publicCache } from "../../src/middleware/public-cache.js";
import { setAdmin } from "../../src/modules/auth/auth.service.js";

// End-to-end through HTTP, against a real database. Run with:
//   TEST_DATABASE_URL=postgresql://.../al_musawir_test npx prisma migrate deploy   (once)
//   TEST_DATABASE_URL=postgresql://.../al_musawir_test npm test
// The database's content is replaced, so its name must contain "test".

const url = process.env.TEST_DATABASE_URL;
const safe = !!url && /test/i.test(new URL(url).pathname);

const SEED_DIR = fileURLToPath(new URL("../../prisma/seed-data", import.meta.url));
const seedFile = (f: string) => JSON.parse(readFileSync(`${SEED_DIR}/${f}`, "utf8"));
const ADMIN = { email: "admin@test.local", name: "Test Admin", password: "correct-horse-battery" };

describe.runIf(safe)("API against a database", () => {
  const app = createApp();
  let admin: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    await seedContent(db, await loadSeedData(SEED_DIR), { reset: true });
    await setAdmin(ADMIN);
    admin = request.agent(app);
    const res = await admin.post("/api/admin/auth/login").send({ email: ADMIN.email, password: ADMIN.password });
    expect(res.status).toBe(200);
  });
  beforeEach(() => publicCache.clear());
  afterAll(disconnectDatabases);

  describe("seeded content matches the admin panel's JSON exactly", () => {
    for (const [path, file] of [
      ["/site", "site.json"],
      ["/navigation", "navigation.json"],
      ["/services", "services.json"],
      ["/process-steps", "process-steps.json"],
      ["/survey-specs", "survey-specs.json"],
      ["/categories", "categories.json"],
      ["/projects", "projects.json"],
      ["/pages", "pages.json"],
    ] as const) {
      it(path, async () => {
        const res = await admin.get(`/api/admin${path}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(seedFile(file));
      });
    }
  });

  describe("public API", () => {
    it("site: settings and menu for the layout", async () => {
      const res = await request(app).get("/api/v1/site");
      expect(res.status).toBe(200);
      expect(res.body.data.site.name).toBe("Al-Musawir");
      expect(res.body.data.navigation).toHaveLength(6);
    });

    it("projects: light cards without doors and windows", async () => {
      const res = await request(app).get("/api/v1/projects");
      expect(res.body.data).toHaveLength(4);
      const card = res.body.data[0];
      expect(card).not.toHaveProperty("openings");
      expect(card).not.toHaveProperty("client");
      expect(card.plotArea).toBe(25 * 45);
      expect(card.coveredArea).toBeGreaterThan(0);
      expect(Object.keys(card.rooms[0]).sort()).toEqual(["d", "name", "w", "x", "y"]);
    });

    it("projects: filter and limit", async () => {
      expect((await request(app).get("/api/v1/projects?category=5-marla")).body.data).toHaveLength(1);
      expect((await request(app).get("/api/v1/projects?limit=2")).body.data).toHaveLength(2);
      expect((await request(app).get("/api/v1/projects?limit=abc")).status).toBe(422);
    });

    it("project: full plan with previous and next", async () => {
      const res = await request(app).get("/api/v1/projects/family-house-10-marla");
      expect(res.status).toBe(200);
      expect(res.body.data.project.openings.length).toBeGreaterThan(0);
      expect(res.body.data.previous).toMatchObject({ slug: "family-house-5-marla", name: "Family house, 5 Marla", plotArea: 25 * 45 });
      expect(res.body.data.previous).not.toHaveProperty("openings");
      expect(res.body.data.next.slug).toBe("residence-1-kanal");
      expect((await request(app).get("/api/v1/projects/no-such-project")).status).toBe(404);
    });

    it("slugs, categories with counts, page text", async () => {
      expect((await request(app).get("/api/v1/projects/slugs")).body.data).toHaveLength(4);
      const categories = (await request(app).get("/api/v1/categories")).body.data;
      expect(categories[0]).toEqual({ id: "5-marla", label: "5 Marla", projectCount: 1 });
      expect((await request(app).get("/api/v1/pages/home")).body.data.hero.featuredProject).toBe("family-house-10-marla");
      expect((await request(app).get("/api/v1/pages/admin")).status).toBe(404);
    });

    it("caches in memory and answers 304 to a repeat with the same ETag", async () => {
      const first = await request(app).get("/api/v1/services");
      expect(first.headers["x-cache"]).toBe("MISS");
      expect(first.headers["cache-control"]).toMatch(/public, max-age=60/);
      const second = await request(app).get("/api/v1/services");
      expect(second.headers["x-cache"]).toBe("HIT");
      expect(second.body).toEqual(first.body);
      const notModified = await request(app).get("/api/v1/services").set("If-None-Match", first.headers.etag!);
      expect(notModified.status).toBe(304);
    });

    it("its database connection cannot write, even if code tried", async () => {
      await expect(readDb.category.create({ data: { id: "sneaky", label: "Sneaky", position: 99 } })).rejects.toThrow(/read-only/);
    });
  });

  describe("admin API", () => {
    it("rejects a wrong password with the same message as a wrong email", async () => {
      const wrongPassword = await request(app).post("/api/admin/auth/login").send({ email: ADMIN.email, password: "nope" });
      const wrongEmail = await request(app).post("/api/admin/auth/login").send({ email: "x@test.local", password: "nope" });
      expect(wrongPassword.status).toBe(401);
      expect(wrongEmail.body).toEqual(wrongPassword.body);
    });

    it("sets an HTTP-only session cookie and knows who is signed in", async () => {
      const res = await request(app).post("/api/admin/auth/login").send({ email: ADMIN.email.toUpperCase(), password: ADMIN.password });
      expect(res.headers["set-cookie"]?.[0]).toMatch(/am_admin_session=.+; .*HttpOnly/);
      expect((await admin.get("/api/admin/auth/me")).body).toEqual({ data: { user: { email: ADMIN.email, name: ADMIN.name } } });
    });

    it("returns readable problems for invalid input", async () => {
      const res = await admin.put("/api/admin/site").send({ ...seedFile("site.json"), name: "", whatsappNumber: "abc" });
      expect(res.status).toBe(422);
      expect(res.body.details).toEqual([
        "Business name is required.",
        "WhatsApp number (link) must be 8 to 15 digits with the country code, no spaces or +, e.g. 923001234567.",
      ]);
    });

    it("saves, logs the change, and the website shows it straight away", async () => {
      await request(app).get("/api/v1/services"); // now cached
      const services = seedFile("services.json");
      services[0].name = "Floor plans (updated)";
      expect((await admin.put("/api/admin/services").send(services)).status).toBe(200);

      const pub = await request(app).get("/api/v1/services");
      expect(pub.headers["x-cache"]).toBe("MISS");
      expect(pub.body.data[0].name).toBe("Floor plans (updated)");
      const [latest] = (await admin.get("/api/admin/activity")).body.data;
      expect(latest).toMatchObject({ user: ADMIN.name, action: "updated", target: "Services", href: "/services" });
    });

    it("keeps the fixed sets: menu pages and service ids", async () => {
      const nav = seedFile("navigation.json").slice(1);
      expect((await admin.put("/api/admin/navigation").send(nav)).status).toBe(422);
      const services = seedFile("services.json").map((s: { id: string }, i: number) => (i === 0 ? { ...s, id: "other" } : s));
      expect((await admin.put("/api/admin/services").send(services)).status).toBe(422);
    });

    it("refuses to remove a category that projects use", async () => {
      const res = await admin.put("/api/admin/categories").send(seedFile("categories.json").slice(1));
      expect(res.status).toBe(422);
      expect(res.body.details).toEqual(['"5-marla" is used by 1 project. Move it to another category first.']);
    });

    it("creates, renames and deletes a project; the home hero follows a rename", async () => {
      const base = seedFile("projects.json")[0];
      const created = await admin.post("/api/admin/projects").send({ ...base, slug: "new-house", name: "New house" });
      expect(created.status).toBe(201);
      expect((await admin.post("/api/admin/projects").send({ ...base, slug: "new-house" })).body.details).toEqual([
        'Another project already uses the web address "new-house".',
      ]);
      expect((await admin.post("/api/admin/projects").send({ ...base, slug: "x", category: "nope" })).body.details).toEqual([
        "Choose a category.",
      ]);

      // Rename the hero project: the home page follows.
      const hero = (await admin.get("/api/admin/projects/family-house-10-marla")).body.data;
      expect((await admin.put("/api/admin/projects/family-house-10-marla").send({ ...hero, slug: "house-10-marla" })).status).toBe(200);
      expect((await admin.get("/api/admin/pages/home")).body.data.hero.featuredProject).toBe("house-10-marla");

      // The hero project cannot be deleted; another one can.
      expect((await admin.delete("/api/admin/projects/house-10-marla")).status).toBe(409);
      expect((await admin.delete("/api/admin/projects/new-house")).body).toEqual({ data: { deleted: "new-house" } });
      expect((await admin.get("/api/admin/projects/new-house")).status).toBe(404);
    });

    it("page text: validated per page, hero must point at a real project", async () => {
      const home = (await admin.get("/api/admin/pages/home")).body.data;
      const res = await admin.put("/api/admin/pages/home").send({ ...home, hero: { ...home.hero, featuredProject: "ghost" } });
      expect(res.body.details).toEqual(["Hero: choose a project that exists."]);
      const footer = (await admin.get("/api/admin/pages/footer")).body.data;
      const saved = await admin.put("/api/admin/pages/footer").send({ ...footer, cta: { ...footer.cta, title: "New title", junk: 1 } });
      expect(saved.body.data.cta).toEqual({ ...footer.cta, title: "New title" });
    });

    it("overview returns everything at once", async () => {
      const res = await admin.get("/api/admin/content");
      expect(Object.keys(res.body.data).sort()).toEqual(
        ["categories", "navigation", "pages", "processSteps", "projects", "services", "site", "surveySpecs"].sort(),
      );
    });

    it("a new password signs out existing sessions", async () => {
      const other = request.agent(app);
      await other.post("/api/admin/auth/login").send({ email: ADMIN.email, password: ADMIN.password });
      expect((await other.get("/api/admin/auth/me")).status).toBe(200);
      await setAdmin({ ...ADMIN, password: "a-brand-new-password" });
      expect((await other.get("/api/admin/auth/me")).status).toBe(401);
      await setAdmin(ADMIN);
    });

    it("there can only be one admin", async () => {
      await expect(db.admin.create({ data: { id: 2, email: "second@test.local", name: "Second", passwordHash: "x" } })).rejects.toThrow();
      expect(await db.admin.count()).toBe(1);
    });

    it("logout clears the cookie", async () => {
      const agent = request.agent(app);
      await agent.post("/api/admin/auth/login").send({ email: ADMIN.email, password: ADMIN.password });
      const res = await agent.post("/api/admin/auth/logout").send({});
      expect(res.body).toEqual({ data: { signedOut: true } });
      expect((await agent.get("/api/admin/auth/me")).status).toBe(401);
    });
  });
});

describe.skipIf(safe)("API against a database", () => {
  it.skip("set TEST_DATABASE_URL to a migrated database whose name contains 'test'", () => {});
});
