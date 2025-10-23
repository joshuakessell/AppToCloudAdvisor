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

// Clarifying responses - user answers to strategic questions about multiplayer vision
export const clarifyingResponses = pgTable("clarifying_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameSubmissionId: varchar("game_submission_id").notNull().references(() => gameSubmissions.id),
  targetPlayerCount: text("target_player_count"), // 10s, 100s, 1000s, 10000s+
  geographicReach: text("geographic_reach"), // regional, continental, global
  latencyRequirements: text("latency_requirements"), // ultra_low (<50ms), low (<100ms), moderate (<200ms), flexible
  primaryGameModes: jsonb("primary_game_modes"), // Array of game modes (deathmatch, battle_royale, coop, etc.)
  monetizationStrategy: text("monetization_strategy"), // free_to_play, premium, subscription, not_decided
  developmentStage: text("development_stage"), // prototype, alpha, beta, production, live
  multiplayerPlans: text("multiplayer_plans"), // not_planned, future_feature, primary_focus
  additionalRequirements: text("additional_requirements"), // Free-form text for other needs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Migration recommendations - AI-generated AWS migration pathway and services breakdown
export const migrationRecommendations = pgTable("migration_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameSubmissionId: varchar("game_submission_id").notNull().references(() => gameSubmissions.id),
  clarifyingResponseId: varchar("clarifying_response_id").references(() => clarifyingResponses.id),
  recommendedPath: text("recommended_path").notNull(), // anywhere, managed_ec2, managed_containers, realtime, fleetiq
  pathReasoning: text("path_reasoning").notNull(), // Why this path was chosen
  awsServicesBreakdown: jsonb("aws_services_breakdown").notNull(), // Complete AWS services applicable to this game
  migrationSteps: jsonb("migration_steps").notNull(), // Step-by-step migration guide
  sdkIntegrationGuide: jsonb("sdk_integration_guide").notNull(), // Code snippets and setup instructions
  costEstimates: jsonb("cost_estimates"), // Estimated costs for recommended setup
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Feature suggestions - AI-generated recommendations for multiplayer features to add
export const featureSuggestions = pgTable("feature_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameSubmissionId: varchar("game_submission_id").notNull().references(() => gameSubmissions.id),
  migrationRecommendationId: varchar("migration_recommendation_id").references(() => migrationRecommendations.id),
  suggestedFeatures: jsonb("suggested_features").notNull(), // Array of feature suggestions
  implementationGuides: jsonb("implementation_guides").notNull(), // How to implement each feature with AWS
  priorityRanking: jsonb("priority_ranking"), // Suggested order of implementation
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

export const insertClarifyingResponseSchema = createInsertSchema(clarifyingResponses).omit({
  id: true,
  createdAt: true,
});

export const insertMigrationRecommendationSchema = createInsertSchema(migrationRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertFeatureSuggestionSchema = createInsertSchema(featureSuggestions).omit({
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

export type InsertClarifyingResponse = z.infer<typeof insertClarifyingResponseSchema>;
export type ClarifyingResponse = typeof clarifyingResponses.$inferSelect;

export type InsertMigrationRecommendation = z.infer<typeof insertMigrationRecommendationSchema>;
export type MigrationRecommendation = typeof migrationRecommendations.$inferSelect;

export type InsertFeatureSuggestion = z.infer<typeof insertFeatureSuggestionSchema>;
export type FeatureSuggestion = typeof featureSuggestions.$inferSelect;

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
