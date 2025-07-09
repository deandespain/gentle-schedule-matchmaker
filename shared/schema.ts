import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const caregivers = pgTable("caregivers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  weeklySchedule: jsonb("weekly_schedule").notNull(), // Array of DaySchedule objects
  exclusions: text("exclusions").array().notNull().default([]), // Array of client IDs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  weeklySchedule: jsonb("weekly_schedule").notNull(), // Array of DaySchedule objects
  exclusions: text("exclusions").array().notNull().default([]), // Array of caregiver IDs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduleOptions = pgTable("schedule_options", {
  id: serial("id").primaryKey(),
  option: integer("option").notNull(),
  matches: jsonb("matches").notNull(), // Array of Match objects
  totalScore: integer("total_score").notNull(),
  efficiency: integer("efficiency").notNull(), // Stored as percentage * 100 for precision
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const caregiversRelations = relations(caregivers, ({ many }) => ({
  scheduleMatches: many(scheduleOptions),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  scheduleMatches: many(scheduleOptions),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCaregiverSchema = createInsertSchema(caregivers).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertScheduleOptionSchema = createInsertSchema(scheduleOptions).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCaregiver = z.infer<typeof insertCaregiverSchema>;
export type Caregiver = typeof caregivers.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertScheduleOption = z.infer<typeof insertScheduleOptionSchema>;
export type ScheduleOption = typeof scheduleOptions.$inferSelect;
