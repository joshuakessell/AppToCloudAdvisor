import { 
  type Project, 
  type InsertProject,
  type GameSubmission,
  type InsertGameSubmission,
  type GameliftResourcePlan,
  type InsertGameliftResourcePlan,
  type PricingTable,
  type InsertPricingTable,
  type CostSimulation,
  type InsertCostSimulation,
  type ClarifyingResponse,
  type InsertClarifyingResponse,
  type MigrationRecommendation,
  type InsertMigrationRecommendation,
  type FeatureSuggestion,
  type InsertFeatureSuggestion
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for GameLift-specific functionality
export interface IStorage {
  // Game submission methods
  getGameSubmission(id: string): Promise<GameSubmission | undefined>;
  createGameSubmission(submission: InsertGameSubmission): Promise<GameSubmission>;
  updateGameSubmission(id: string, updates: Partial<InsertGameSubmission>): Promise<GameSubmission | undefined>;
  listGameSubmissions(): Promise<GameSubmission[]>;

  // GameLift resource plan methods
  getResourcePlan(id: string): Promise<GameliftResourcePlan | undefined>;
  getResourcePlanBySubmissionId(submissionId: string): Promise<GameliftResourcePlan | undefined>;
  createResourcePlan(plan: InsertGameliftResourcePlan): Promise<GameliftResourcePlan>;
  updateResourcePlan(id: string, updates: Partial<InsertGameliftResourcePlan>): Promise<GameliftResourcePlan | undefined>;

  // Pricing table methods
  getPricingTable(id: string): Promise<PricingTable | undefined>;
  getPricingByServiceAndRegion(serviceType: string, region: string): Promise<PricingTable | undefined>;
  createPricingTable(pricing: InsertPricingTable): Promise<PricingTable>;
  updatePricingTable(id: string, updates: Partial<InsertPricingTable>): Promise<PricingTable | undefined>;
  listPricingTables(): Promise<PricingTable[]>;

  // Cost simulation methods
  getCostSimulation(id: string): Promise<CostSimulation | undefined>;
  listCostSimulationsByPlanId(planId: string): Promise<CostSimulation[]>;
  createCostSimulation(simulation: InsertCostSimulation): Promise<CostSimulation>;

  // Clarifying response methods
  getClarifyingResponse(id: string): Promise<ClarifyingResponse | undefined>;
  getClarifyingResponseBySubmissionId(submissionId: string): Promise<ClarifyingResponse | undefined>;
  createClarifyingResponse(response: InsertClarifyingResponse): Promise<ClarifyingResponse>;
  updateClarifyingResponse(id: string, updates: Partial<InsertClarifyingResponse>): Promise<ClarifyingResponse | undefined>;

  // Migration recommendation methods
  getMigrationRecommendation(id: string): Promise<MigrationRecommendation | undefined>;
  getMigrationRecommendationBySubmissionId(submissionId: string): Promise<MigrationRecommendation | undefined>;
  createMigrationRecommendation(recommendation: InsertMigrationRecommendation): Promise<MigrationRecommendation>;
  updateMigrationRecommendation(id: string, updates: Partial<InsertMigrationRecommendation>): Promise<MigrationRecommendation | undefined>;

  // Feature suggestion methods
  getFeatureSuggestion(id: string): Promise<FeatureSuggestion | undefined>;
  getFeatureSuggestionBySubmissionId(submissionId: string): Promise<FeatureSuggestion | undefined>;
  createFeatureSuggestion(suggestion: InsertFeatureSuggestion): Promise<FeatureSuggestion>;
  updateFeatureSuggestion(id: string, updates: Partial<InsertFeatureSuggestion>): Promise<FeatureSuggestion | undefined>;

  // Legacy project methods (for backward compatibility)
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined>;
  listProjects(): Promise<Project[]>;
}

export class MemStorage implements IStorage {
  private gameSubmissions: Map<string, GameSubmission>;
  private resourcePlans: Map<string, GameliftResourcePlan>;
  private pricingTables: Map<string, PricingTable>;
  private costSimulations: Map<string, CostSimulation>;
  private clarifyingResponses: Map<string, ClarifyingResponse>;
  private migrationRecommendations: Map<string, MigrationRecommendation>;
  private featureSuggestions: Map<string, FeatureSuggestion>;
  private projects: Map<string, Project>; // Legacy

  constructor() {
    this.gameSubmissions = new Map();
    this.resourcePlans = new Map();
    this.pricingTables = new Map();
    this.costSimulations = new Map();
    this.clarifyingResponses = new Map();
    this.migrationRecommendations = new Map();
    this.featureSuggestions = new Map();
    this.projects = new Map();
  }

  // Game Submission Methods
  async getGameSubmission(id: string): Promise<GameSubmission | undefined> {
    return this.gameSubmissions.get(id);
  }

  async createGameSubmission(insertSubmission: InsertGameSubmission): Promise<GameSubmission> {
    const id = randomUUID();
    const submission: GameSubmission = {
      ...insertSubmission,
      id,
      sourceUrl: insertSubmission.sourceUrl || null,
      artifactPath: insertSubmission.artifactPath || null,
      packageMetadata: insertSubmission.packageMetadata || null,
      markdownContent: insertSubmission.markdownContent || null,
      repositoryManifest: insertSubmission.repositoryManifest || null,
      analysisResult: insertSubmission.analysisResult || null,
      status: insertSubmission.status || "uploaded",
      createdAt: new Date(),
    };
    this.gameSubmissions.set(id, submission);
    return submission;
  }

  async updateGameSubmission(id: string, updates: Partial<InsertGameSubmission>): Promise<GameSubmission | undefined> {
    const submission = this.gameSubmissions.get(id);
    if (!submission) return undefined;

    const updated: GameSubmission = {
      ...submission,
      ...updates,
      id: submission.id,
      createdAt: submission.createdAt,
    };

    this.gameSubmissions.set(id, updated);
    return updated;
  }

  async listGameSubmissions(): Promise<GameSubmission[]> {
    return Array.from(this.gameSubmissions.values());
  }

  // Resource Plan Methods
  async getResourcePlan(id: string): Promise<GameliftResourcePlan | undefined> {
    return this.resourcePlans.get(id);
  }

  async getResourcePlanBySubmissionId(submissionId: string): Promise<GameliftResourcePlan | undefined> {
    return Array.from(this.resourcePlans.values()).find(
      (plan) => plan.gameSubmissionId === submissionId
    );
  }

  async createResourcePlan(insertPlan: InsertGameliftResourcePlan): Promise<GameliftResourcePlan> {
    const id = randomUUID();
    const plan: GameliftResourcePlan = {
      ...insertPlan,
      id,
      fleetConfig: insertPlan.fleetConfig || null,
      scalingPolicies: insertPlan.scalingPolicies || null,
      auxiliaryServices: insertPlan.auxiliaryServices || null,
      costScenarios: insertPlan.costScenarios || null,
      initialCost: insertPlan.initialCost || null,
      monthlyBaselineCost: insertPlan.monthlyBaselineCost || null,
      createdAt: new Date(),
    };
    this.resourcePlans.set(id, plan);
    return plan;
  }

  async updateResourcePlan(id: string, updates: Partial<InsertGameliftResourcePlan>): Promise<GameliftResourcePlan | undefined> {
    const plan = this.resourcePlans.get(id);
    if (!plan) return undefined;

    const updated: GameliftResourcePlan = {
      ...plan,
      ...updates,
      id: plan.id,
      createdAt: plan.createdAt,
    };

    this.resourcePlans.set(id, updated);
    return updated;
  }

  // Pricing Table Methods
  async getPricingTable(id: string): Promise<PricingTable | undefined> {
    return this.pricingTables.get(id);
  }

  async getPricingByServiceAndRegion(serviceType: string, region: string): Promise<PricingTable | undefined> {
    return Array.from(this.pricingTables.values()).find(
      (pricing) => pricing.serviceType === serviceType && pricing.region === region
    );
  }

  async createPricingTable(insertPricing: InsertPricingTable): Promise<PricingTable> {
    const id = randomUUID();
    const pricing: PricingTable = {
      ...insertPricing,
      id,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
    this.pricingTables.set(id, pricing);
    return pricing;
  }

  async updatePricingTable(id: string, updates: Partial<InsertPricingTable>): Promise<PricingTable | undefined> {
    const pricing = this.pricingTables.get(id);
    if (!pricing) return undefined;

    const updated: PricingTable = {
      ...pricing,
      ...updates,
      id: pricing.id,
      lastUpdated: new Date(),
      createdAt: pricing.createdAt,
    };

    this.pricingTables.set(id, updated);
    return updated;
  }

  async listPricingTables(): Promise<PricingTable[]> {
    return Array.from(this.pricingTables.values());
  }

  // Cost Simulation Methods
  async getCostSimulation(id: string): Promise<CostSimulation | undefined> {
    return this.costSimulations.get(id);
  }

  async listCostSimulationsByPlanId(planId: string): Promise<CostSimulation[]> {
    return Array.from(this.costSimulations.values()).filter(
      (sim) => sim.resourcePlanId === planId
    );
  }

  async createCostSimulation(insertSimulation: InsertCostSimulation): Promise<CostSimulation> {
    const id = randomUUID();
    const simulation: CostSimulation = {
      ...insertSimulation,
      id,
      createdAt: new Date(),
    };
    this.costSimulations.set(id, simulation);
    return simulation;
  }

  // Clarifying Response Methods
  async getClarifyingResponse(id: string): Promise<ClarifyingResponse | undefined> {
    return this.clarifyingResponses.get(id);
  }

  async getClarifyingResponseBySubmissionId(submissionId: string): Promise<ClarifyingResponse | undefined> {
    return Array.from(this.clarifyingResponses.values()).find(
      (response) => response.gameSubmissionId === submissionId
    );
  }

  async createClarifyingResponse(insertResponse: InsertClarifyingResponse): Promise<ClarifyingResponse> {
    const id = randomUUID();
    const response: ClarifyingResponse = {
      ...insertResponse,
      id,
      targetPlayerCount: insertResponse.targetPlayerCount || null,
      geographicReach: insertResponse.geographicReach || null,
      latencyRequirements: insertResponse.latencyRequirements || null,
      primaryGameModes: insertResponse.primaryGameModes || null,
      monetizationStrategy: insertResponse.monetizationStrategy || null,
      developmentStage: insertResponse.developmentStage || null,
      multiplayerPlans: insertResponse.multiplayerPlans || null,
      additionalRequirements: insertResponse.additionalRequirements || null,
      createdAt: new Date(),
    };
    this.clarifyingResponses.set(id, response);
    return response;
  }

  async updateClarifyingResponse(id: string, updates: Partial<InsertClarifyingResponse>): Promise<ClarifyingResponse | undefined> {
    const response = this.clarifyingResponses.get(id);
    if (!response) return undefined;

    const updated: ClarifyingResponse = {
      ...response,
      ...updates,
      id: response.id,
      createdAt: response.createdAt,
    };

    this.clarifyingResponses.set(id, updated);
    return updated;
  }

  // Migration Recommendation Methods
  async getMigrationRecommendation(id: string): Promise<MigrationRecommendation | undefined> {
    return this.migrationRecommendations.get(id);
  }

  async getMigrationRecommendationBySubmissionId(submissionId: string): Promise<MigrationRecommendation | undefined> {
    return Array.from(this.migrationRecommendations.values()).find(
      (recommendation) => recommendation.gameSubmissionId === submissionId
    );
  }

  async createMigrationRecommendation(insertRecommendation: InsertMigrationRecommendation): Promise<MigrationRecommendation> {
    const id = randomUUID();
    const recommendation: MigrationRecommendation = {
      ...insertRecommendation,
      id,
      clarifyingResponseId: insertRecommendation.clarifyingResponseId || null,
      costEstimates: insertRecommendation.costEstimates || null,
      createdAt: new Date(),
    };
    this.migrationRecommendations.set(id, recommendation);
    return recommendation;
  }

  async updateMigrationRecommendation(id: string, updates: Partial<InsertMigrationRecommendation>): Promise<MigrationRecommendation | undefined> {
    const recommendation = this.migrationRecommendations.get(id);
    if (!recommendation) return undefined;

    const updated: MigrationRecommendation = {
      ...recommendation,
      ...updates,
      id: recommendation.id,
      createdAt: recommendation.createdAt,
    };

    this.migrationRecommendations.set(id, updated);
    return updated;
  }

  // Feature Suggestion Methods
  async getFeatureSuggestion(id: string): Promise<FeatureSuggestion | undefined> {
    return this.featureSuggestions.get(id);
  }

  async getFeatureSuggestionBySubmissionId(submissionId: string): Promise<FeatureSuggestion | undefined> {
    return Array.from(this.featureSuggestions.values()).find(
      (suggestion) => suggestion.gameSubmissionId === submissionId
    );
  }

  async createFeatureSuggestion(insertSuggestion: InsertFeatureSuggestion): Promise<FeatureSuggestion> {
    const id = randomUUID();
    const suggestion: FeatureSuggestion = {
      ...insertSuggestion,
      id,
      migrationRecommendationId: insertSuggestion.migrationRecommendationId || null,
      priorityRanking: insertSuggestion.priorityRanking || null,
      createdAt: new Date(),
    };
    this.featureSuggestions.set(id, suggestion);
    return suggestion;
  }

  async updateFeatureSuggestion(id: string, updates: Partial<InsertFeatureSuggestion>): Promise<FeatureSuggestion | undefined> {
    const suggestion = this.featureSuggestions.get(id);
    if (!suggestion) return undefined;

    const updated: FeatureSuggestion = {
      ...suggestion,
      ...updates,
      id: suggestion.id,
      createdAt: suggestion.createdAt,
    };

    this.featureSuggestions.set(id, updated);
    return updated;
  }

  // Legacy Project Methods (for backward compatibility)
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      analysisResult: insertProject.analysisResult || null,
      configuration: insertProject.configuration || null,
      playbook: insertProject.playbook || null,
      status: insertProject.status || "uploaded",
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updated: Project = {
      ...project,
      ...updates,
      id: project.id,
      createdAt: project.createdAt,
    };

    this.projects.set(id, updated);
    return updated;
  }

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
}

export const storage = new MemStorage();
