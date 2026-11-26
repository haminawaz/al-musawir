import fs from "node:fs";
import path from "node:path";
import type {
  Activity,
  Category,
  NavLink,
  Pages,
  ProcessStep,
  Project,
  Service,
  Site,
  SiteContent,
  SurveySpec,
} from "@/lib/types";
import seedCategories from "./seed/categories.json";
import seedNavigation from "./seed/navigation.json";
import seedPages from "./seed/pages.json";
import seedProcessSteps from "./seed/process-steps.json";
import seedProjects from "./seed/projects.json";
import seedServices from "./seed/services.json";
import seedSite from "./seed/site.json";
import seedSurveySpecs from "./seed/survey-specs.json";

// Mock database for the mock API. It starts from the JSON in ./seed (copied from the website's data)
// and saves changes to .mock-db.json, so edits survive a restart in development.
// Where the disk is read-only (for example on Vercel), changes live in memory until the server restarts.
// Delete this folder once the real backend exists.

export type Database = SiteContent & { activity: Activity[] };

const DB_FILE = process.env.MOCK_DB_PATH || path.join(/*turbopackIgnore: true*/ process.cwd(), ".mock-db.json");
const ACTIVITY_LIMIT = 50;

function seed(): Database {
  return structuredClone({
    site: seedSite as Site,
    navigation: seedNavigation as NavLink[],
    services: seedServices as Service[],
    processSteps: seedProcessSteps as ProcessStep[],
    surveySpecs: seedSurveySpecs as SurveySpec[],
    categories: seedCategories as Category[],
    projects: seedProjects as Project[],
    pages: seedPages as Pages,
    activity: [],
  });
}

// Kept on globalThis so every route bundle, and hot reloads in development, share one copy.
const store = globalThis as unknown as { __mockDb?: Database; __mockDbDiskOk?: boolean };

function load(): Database {
  if (store.__mockDbDiskOk !== false) {
    try {
      // Seed first, so content types added later still exist in an older saved file.
      store.__mockDb = { ...seed(), ...JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ DB_FILE, "utf8")) };
    } catch {
      // No saved file yet: use what is in memory, or the seed.
    }
  }
  store.__mockDb ??= seed();
  return store.__mockDb;
}

function persist(db: Database) {
  store.__mockDb = db;
  if (store.__mockDbDiskOk === false) return;
  try {
    fs.writeFileSync(/*turbopackIgnore: true*/ DB_FILE, JSON.stringify(db, null, 2));
    store.__mockDbDiskOk = true;
  } catch (error) {
    store.__mockDbDiskOk = false;
    console.warn(`[mock-db] Cannot write ${DB_FILE}; changes are kept in memory only.`, error);
  }
}

export type Collection = Exclude<keyof Database, "activity">;

export function read<K extends keyof Database>(key: K): Database[K] {
  return structuredClone(load()[key]);
}

export function snapshot(): SiteContent {
  const { activity: _activity, ...content } = structuredClone(load());
  return content;
}

type Change = Omit<Activity, "id" | "at">;

/** Applies a change to the database and records it in the activity log. */
export function update(change: Change, apply: (db: Database) => void) {
  const db = structuredClone(load());
  apply(db);
  db.activity = [{ id: crypto.randomUUID(), at: new Date().toISOString(), ...change }, ...db.activity].slice(
    0,
    ACTIVITY_LIMIT,
  );
  persist(db);
}

export function write<K extends Collection>(key: K, value: Database[K], change: Change) {
  update(change, (db) => {
    db[key] = value;
  });
}

export function reset(user: string) {
  const db = seed();
  db.activity = [{ id: crypto.randomUUID(), at: new Date().toISOString(), user, action: "reset", target: "all content" }];
  persist(db);
}
