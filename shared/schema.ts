import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Game submissions table - stores uploaded game packages or GitHub repositories
export const gameSubmissions = pgTable("game_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull(), // 'github_url' or 'zip_file'
  sourceUrl: text("source_url"), // GitHub URL if applicable
  artifactPath: text("artifact_path"), // File path or storage key for uploaded zip
  packageMetadata: jsonb("package_metadata"), // Zip file info (size, filename, etc.)
  markdownContent: text("markdown_content"), // Extracted game.md content
  repositoryManifest: jsonb("repository_manifest"), // File structure and manifest
  analysisResult: jsonb("analysis_result"), // AI analysis output
  status: text("status").notNull().default("uploaded"), // uploaded, analyzing, analyzed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// GameLift resource plans - stores recommended AWS GameLift configuration and costs
export const gameliftResourcePlans = pgTable("gamelift_resource_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameSubmissionId: varchar("game_submission_id").notNull().references(() => gameSubmissions.id),
  fleetConfig: jsonb("fleet_config"), // Fleet types, instance sizes, capacities
  scalingPolicies: jsonb("scaling_policies"), // Auto-scaling configuration
  auxiliaryServices: jsonb("auxiliary_services"), // Additional AWS services (matchmaking, queues, etc.)
  costScenarios: jsonb("cost_scenarios"), // Array of cost calculations for different traffic levels
  initialCost: numeric("initial_cost", { precision: 10, scale: 2 }), // One-time setup cost
  monthlyBaselineCost: numeric("monthly_baseline_cost", { precision: 10, scale: 2 }), // Monthly cost at baseline traffic
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AWS GameLift pricing tables - cached pricing data
export const pricingTables = pgTable("pricing_tables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceType: text("service_type").notNull(), // 'ec2_instance', 'gamelift_fleet', 'data_transfer', etc.
  region: text("region").notNull(), // AWS region (us-east-1, us-west-2, etc.)
  pricingData: jsonb("pricing_data").notNull(), // Pricing details by instance type/tier
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cost simulation parameters - saved slider configurations
export const costSimulations = pgTable("cost_simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resourcePlanId: varchar("resource_plan_id").notNull().references(() => gameliftResourcePlans.id),
  concurrentPlayers: integer("concurrent_players").notNull(),
  sessionDurationMinutes: integer("session_duration_minutes").notNull(),
  regions: jsonb("regions").notNull(), // Array of AWS regions
  instanceFamily: text("instance_family").notNull(), // c5, c6g, etc.
  calculatedInitialCost: numeric("calculated_initial_cost", { precision: 10, scale: 2 }).notNull(),
  calculatedMonthlyCost: numeric("calculated_monthly_cost", { precision: 10, scale: 2 }).notNull(),
  costBreakdown: jsonb("cost_breakdown").notNull(), // Detailed cost components
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for validation
export const insertGameSubmissionSchema = createInsertSchema(gameSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertGameliftResourcePlanSchema = createInsertSchema(gameliftResourcePlans).omit({
  id: true,
  createdAt: true,
});

export const insertPricingTableSchema = createInsertSchema(pricingTables).omit({
  id: true,
  createdAt: true,
});

export const insertCostSimulationSchema = createInsertSchema(costSimulations).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertGameSubmission = z.infer<typeof insertGameSubmissionSchema>;
export type GameSubmission = typeof gameSubmissions.$inferSelect;

export type InsertGameliftResourcePlan = z.infer<typeof insertGameliftResourcePlanSchema>;
export type GameliftResourcePlan = typeof gameliftResourcePlans.$inferSelect;

export type InsertPricingTable = z.infer<typeof insertPricingTableSchema>;
export type PricingTable = typeof pricingTables.$inferSelect;

export type InsertCostSimulation = z.infer<typeof insertCostSimulationSchema>;
export type CostSimulation = typeof costSimulations.$inferSelect;

// Legacy tables (deprecated - keep for migration compatibility)
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  documentName: text("document_name").notNull(),
  documentContent: text("document_content").notNull(),
  analysisResult: jsonb("analysis_result"),
  configuration: jsonb("configuration"),
  playbook: text("playbook"),
  status: text("status").notNull().default("uploaded"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deployments = pgTable("deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  cloudProvider: text("cloud_provider").notNull(),
  status: text("status").notNull().default("pending"),
  logs: jsonb("logs").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
  createdAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;
