import { relations } from "drizzle-orm";
import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  segment: varchar("segment", { length: 160 }).notNull(),
  products: text("products").notNull(),
  services: text("services").notNull(),
  targetAudience: text("targetAudience").notNull(),
  voiceTone: varchar("voiceTone", { length: 120 }).notNull(),
  brandColors: text("brandColors").notNull(),
  links: text("links").notNull(),
  logoUrl: varchar("logoUrl", { length: 2048 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  ownerIdx: index("companies_owner_idx").on(table.ownerId),
}));

export const contents = mysqlTable("contents", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  contentType: mysqlEnum("contentType", ["reel", "carrossel", "story"]).default("reel").notNull(),
  generationType: mysqlEnum("generationType", ["caption", "reel", "idea", "campaign"]).default("reel").notNull(),
  format: varchar("format", { length: 32 }).notNull(),
  duration: varchar("duration", { length: 32 }).notNull(),
  briefing: text("briefing").notNull(),
  script: text("script").notNull(),
  scenes: text("scenes").notNull(),
  voice: varchar("voice", { length: 160 }).notNull(),
  track: varchar("track", { length: 160 }).notNull(),
  caption: text("caption").notNull(),
  plannedAt: timestamp("plannedAt"),
  status: mysqlEnum("status", ["draft", "pending_approval", "approved", "scheduled", "published", "failed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  companyIdx: index("contents_company_idx").on(table.companyId),
}));

export const usersRelations = relations(users, ({ many }) => ({
  companies: many(companies),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(users, { fields: [companies.ownerId], references: [users.id] }),
  contents: many(contents),
}));

export const contentsRelations = relations(contents, ({ one }) => ({
  company: one(companies, { fields: [contents.companyId], references: [companies.id] }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export type Content = typeof contents.$inferSelect;
export type InsertContent = typeof contents.$inferInsert;
