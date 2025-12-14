import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  joinDate: text("join_date"),
  isPremium: boolean("is_premium").default(false),
  avatarUrl: text("avatar_url"),
  otpSecret: text("otp_secret"),
  otpExpiry: text("otp_expiry"),
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull().default('Untitled'),
  content: text("content").default('{}'), // Storing JSON as text for simplicity or usage with JSONB if supported
  icon: text("icon"),
  coverImage: text("cover_image"),
  isExpanded: boolean("is_expanded").default(false),
  parentId: varchar("parent_id"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  tags: text("tags").array(),
});

export const insertPageSchema = createInsertSchema(pages).pick({
  title: true,
  content: true,
  parentId: true,
});

export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;
