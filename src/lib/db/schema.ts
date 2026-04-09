import {
  pgTable,
  text,
  timestamp,
  uuid,
  serial,
  integer,
  real,
  boolean,
  jsonb,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ─── Tenants & Users (synced from Clerk) ────────────────────────────

export const companies = pgTable("companies", {
  id: text("id").primaryKey(), // Clerk org ID
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("free"), // free | pro | enterprise
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),
    companyId: text("company_id")
      .references(() => companies.id)
      .notNull(),
    role: text("role").notNull().default("member"), // admin | member | viewer
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("membership_user_company_idx").on(t.userId, t.companyId)]
);

// ─── Floor Taxonomy ─────────────────────────────────────────────────

export const floorCategories = pgTable("floor_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  iconUrl: text("icon_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const floorTypes = pgTable(
  "floor_types",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .references(() => floorCategories.id)
      .notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    characteristics: jsonb("characteristics"), // grain, hardness, visual cues, etc.
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("floor_type_category_name_idx").on(t.categoryId, t.slug)]
);

// ─── Floor Scans (Core Entity) ──────────────────────────────────────

export const floorScans = pgTable(
  "floor_scans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: text("company_id")
      .references(() => companies.id)
      .notNull(),
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),

    // Image
    imageUrl: text("image_url").notNull(),
    imageKey: text("image_key").notNull(),
    thumbnailUrl: text("thumbnail_url"),

    // AI identification
    status: text("status").notNull().default("pending"), // pending | processing | completed | failed
    aiResult: jsonb("ai_result"), // Full structured response from Claude
    aiConfidence: real("ai_confidence"),
    aiFloorTypeId: integer("ai_floor_type_id").references(() => floorTypes.id),
    aiModelVersion: text("ai_model_version"),

    // Condition assessment
    conditionRating: text("condition_rating"), // excellent | good | fair | poor | critical
    conditionScore: integer("condition_score"), // 1-10
    conditionDetails: jsonb("condition_details"), // damage types, severity, notes

    // Human review
    reviewStatus: text("review_status").notNull().default("unreviewed"), // unreviewed | confirmed | corrected
    reviewedAt: timestamp("reviewed_at"),
    reviewedBy: text("reviewed_by").references(() => users.id),

    // Final accepted values
    finalFloorTypeId: integer("final_floor_type_id").references(
      () => floorTypes.id
    ),
    finalConfidence: real("final_confidence"),

    // Metadata
    projectName: text("project_name"),
    location: text("location"),
    notes: text("notes"),
    tags: text("tags").array(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("scan_company_idx").on(t.companyId),
    index("scan_user_idx").on(t.userId),
    index("scan_status_idx").on(t.status),
    index("scan_created_idx").on(t.createdAt),
  ]
);

// ─── Human Labels (Training Data) ───────────────────────────────────

export const labels = pgTable(
  "labels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scanId: uuid("scan_id")
      .references(() => floorScans.id)
      .notNull(),
    companyId: text("company_id")
      .references(() => companies.id)
      .notNull(),
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),

    // What the human labeled
    floorTypeId: integer("floor_type_id")
      .references(() => floorTypes.id)
      .notNull(),
    conditionRating: text("condition_rating"),
    damageTypes: jsonb("damage_types"), // Array of { type, severity }
    notes: text("notes"),

    // Comparison to AI
    aiAgreed: boolean("ai_agreed").notNull(),
    aiFloorTypeId: integer("ai_floor_type_id").references(() => floorTypes.id),

    // Data quality
    labelQuality: text("label_quality").notNull().default("standard"), // standard | expert | verified

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("label_scan_idx").on(t.scanId),
    index("label_floor_type_idx").on(t.floorTypeId),
  ]
);

// ─── Cost Data ──────────────────────────────────────────────────────

export const costDefaults = pgTable(
  "cost_defaults",
  {
    id: serial("id").primaryKey(),
    floorTypeId: integer("floor_type_id")
      .references(() => floorTypes.id)
      .notNull(),
    region: text("region").notNull().default("national"),

    // Per sq ft in USD
    materialLow: real("material_low").notNull(),
    materialHigh: real("material_high").notNull(),
    laborLow: real("labor_low").notNull(),
    laborHigh: real("labor_high").notNull(),
    removalLow: real("removal_low"),
    removalHigh: real("removal_high"),

    source: text("source"),
    effectiveDate: date("effective_date").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("cost_default_type_region_idx").on(t.floorTypeId, t.region),
  ]
);

export const costOverrides = pgTable(
  "cost_overrides",
  {
    id: serial("id").primaryKey(),
    companyId: text("company_id")
      .references(() => companies.id)
      .notNull(),
    floorTypeId: integer("floor_type_id")
      .references(() => floorTypes.id)
      .notNull(),

    materialLow: real("material_low"),
    materialHigh: real("material_high"),
    laborLow: real("labor_low"),
    laborHigh: real("labor_high"),

    notes: text("notes"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("cost_override_company_type_idx").on(t.companyId, t.floorTypeId),
  ]
);

// ─── Type Exports ───────────────────────────────────────────────────

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type FloorCategory = typeof floorCategories.$inferSelect;
export type FloorType = typeof floorTypes.$inferSelect;
export type FloorScan = typeof floorScans.$inferSelect;
export type NewFloorScan = typeof floorScans.$inferInsert;
export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;
export type CostDefault = typeof costDefaults.$inferSelect;
export type CostOverride = typeof costOverrides.$inferSelect;
