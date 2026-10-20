import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import type { InsertUser } from "../drizzle/schema";
import { companies, contents, users } from "../drizzle/schema";
import type { Company, Content } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database is not available");
  }
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await requireDb();
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export type CompanyInput = {
  name: string;
  segment: string;
  products: string;
  services: string;
  targetAudience: string;
  voiceTone: string;
  brandColors: string;
  links: string;
  logoUrl?: string | null;
};

export type ContentInput = {
  companyId: number;
  title: string;
  contentType: "reel" | "carrossel" | "story";
  generationType?: "caption" | "reel" | "idea" | "campaign";
  format: string;
  duration: string;
  briefing: string;
  script: string;
  scenes: string;
  voice: string;
  track: string;
  caption: string;
  plannedAt?: Date | null;
  status?: "draft" | "pending_approval" | "approved" | "scheduled" | "published" | "failed";
};

export type ContentPatch = Partial<Omit<ContentInput, "companyId">> & { companyId?: number };
export type ContentWithCompany = Content & { companyName: string };

export async function listCompaniesForOwner(ownerId: number): Promise<Company[]> {
  const db = await requireDb();
  return db.select().from(companies).where(eq(companies.ownerId, ownerId)).orderBy(desc(companies.updatedAt));
}

export async function getCompanyForOwner(ownerId: number, companyId: number): Promise<Company | undefined> {
  const db = await requireDb();
  const result = await db
    .select()
    .from(companies)
    .where(and(eq(companies.id, companyId), eq(companies.ownerId, ownerId)))
    .limit(1);
  return result[0];
}

export async function createCompanyForOwner(ownerId: number, input: CompanyInput): Promise<Company> {
  const db = await requireDb();
  const result = await db.insert(companies).values({ ownerId, ...input });
  const companyId = Number(result[0].insertId);
  const created = await getCompanyForOwner(ownerId, companyId);
  if (!created) throw new Error("Company was not created");
  return created;
}

export async function updateCompanyForOwner(ownerId: number, companyId: number, input: Partial<CompanyInput>): Promise<Company> {
  const db = await requireDb();
  const existing = await getCompanyForOwner(ownerId, companyId);
  if (!existing) throw new Error("Company not found");
  await db.update(companies).set(input).where(and(eq(companies.id, companyId), eq(companies.ownerId, ownerId)));
  const updated = await getCompanyForOwner(ownerId, companyId);
  if (!updated) throw new Error("Company was not found after update");
  return updated;
}

export async function deleteCompanyForOwner(ownerId: number, companyId: number): Promise<void> {
  const db = await requireDb();
  const existing = await getCompanyForOwner(ownerId, companyId);
  if (!existing) throw new Error("Company not found");
  await db.delete(companies).where(and(eq(companies.id, companyId), eq(companies.ownerId, ownerId)));
}

export async function listContentsForOwner(ownerId: number, companyId?: number): Promise<ContentWithCompany[]> {
  const db = await requireDb();
  const conditions = [eq(companies.ownerId, ownerId)];
  if (companyId !== undefined) conditions.push(eq(contents.companyId, companyId));
  const rows = await db
    .select({ content: contents, companyName: companies.name })
    .from(contents)
    .innerJoin(companies, eq(contents.companyId, companies.id))
    .where(and(...conditions))
    .orderBy(desc(contents.updatedAt));
  return rows.map(row => ({ ...row.content, companyName: row.companyName }));
}

export async function getContentForOwner(ownerId: number, contentId: number): Promise<ContentWithCompany | undefined> {
  const db = await requireDb();
  const rows = await db
    .select({ content: contents, companyName: companies.name })
    .from(contents)
    .innerJoin(companies, eq(contents.companyId, companies.id))
    .where(and(eq(contents.id, contentId), eq(companies.ownerId, ownerId)))
    .limit(1);
  const row = rows[0];
  return row ? { ...row.content, companyName: row.companyName } : undefined;
}

export async function createContentForOwner(ownerId: number, input: ContentInput): Promise<ContentWithCompany> {
  const db = await requireDb();
  const company = await getCompanyForOwner(ownerId, input.companyId);
  if (!company) throw new Error("Company not found");
  const result = await db.insert(contents).values({ ...input, status: input.status ?? "draft" });
  const contentId = Number(result[0].insertId);
  const created = await getContentForOwner(ownerId, contentId);
  if (!created) throw new Error("Content was not created");
  return created;
}

export async function updateContentForOwner(ownerId: number, contentId: number, input: ContentPatch): Promise<ContentWithCompany> {
  const db = await requireDb();
  const existing = await getContentForOwner(ownerId, contentId);
  if (!existing) throw new Error("Content not found");
  if (input.companyId !== undefined) {
    const company = await getCompanyForOwner(ownerId, input.companyId);
    if (!company) throw new Error("Company not found");
  }
  const ownedCompanyIds = sql`(select ${companies.id} from ${companies} where ${eq(companies.ownerId, ownerId)})`;
  await db
    .update(contents)
    .set(input)
    .where(and(eq(contents.id, contentId), inArray(contents.companyId, ownedCompanyIds)));
  const updated = await getContentForOwner(ownerId, contentId);
  if (!updated) throw new Error("Content was not found after update");
  return updated;
}

export async function deleteContentForOwner(ownerId: number, contentId: number): Promise<void> {
  const db = await requireDb();
  const existing = await getContentForOwner(ownerId, contentId);
  if (!existing) throw new Error("Content not found");
  const ownedCompanyIds = sql`(select ${companies.id} from ${companies} where ${eq(companies.ownerId, ownerId)})`;
  await db
    .delete(contents)
    .where(and(eq(contents.id, contentId), inArray(contents.companyId, ownedCompanyIds)));
}
