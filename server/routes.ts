import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { validateDocument, generateQuestionnaire, generatePlaybook, autoCompleteConfiguration } from "./ai-service";
import { insertProjectSchema } from "@shared/schema";
import { ingestGamePackage, GamePackageValidationError } from "./game-package-service";
import { 
  analyzeGameForGameLift, 
  validateResourcePlan,
  analyzeGameComprehensively,
  generateMigrationRecommendations,
  generateFeatureSuggestions,
  type ComprehensiveGameAnalysis
} from "./gamelift-ai-service";
import { calculateCosts, generateCostScenarios, type CostParameters } from "./cost-calculator";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Separate multer config for game packages (larger limit)
const gameUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for game packages
});

export async function registerRoutes(app: Express): Promise<Server> {
  // ==================== NEW GAMELIFT ROUTES ====================
  
  // Upload game package (zip file)
  app.post("/api/games/upload", gameUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate file type
      const filename = req.file.originalname.toLowerCase();
      if (!filename.endsWith('.zip')) {
        return res.status(400).json({ error: "Only .zip files are accepted" });
      }

      // Process the game package
      const packageData = await ingestGamePackage({
        type: 'zip',
        buffer: req.file.buffer,
      });

      // Create game submission
      const submission = await storage.createGameSubmission({
        name: req.body.name || filename.replace('.zip', ''),
        sourceType: 'zip_upload',
        sourceUrl: null,
        artifactPath: null, // Could store to object storage later
        markdownContent: packageData.gameMarkdown,
        packageMetadata: {
          fileCount: packageData.packageFiles.length,
          detectedLanguages: packageData.detectedLanguages,
        },
        status: 'uploaded',
      });

      res.json({
        ...submission,
        packageInfo: {
          fileCount: packageData.packageFiles.length,
          languages: packageData.detectedLanguages,
        },
      });
    } catch (error: any) {
      console.error("[Games] Upload error:", error);
      if (error instanceof GamePackageValidationError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Ingest game from GitHub URL
  app.post("/api/games/github", async (req, res) => {
    try {
      const { url, name } = req.body;

      if (!url) {
        return res.status(400).json({ error: "GitHub URL is required" });
      }

      // Validate GitHub URL format
      if (!url.includes('github.com')) {
        return res.status(400).json({ error: "Must be a valid GitHub repository URL" });
      }

      // Process the GitHub repository
      const packageData = await ingestGamePackage({
        type: 'github',
        url,
      });

      // Create game submission
      const submission = await storage.createGameSubmission({
        name: name || url.split('/').pop() || 'Unnamed Game',
        sourceType: 'github_url',
        sourceUrl: url,
        artifactPath: null,
        markdownContent: packageData.gameMarkdown,
        packageMetadata: {
          fileCount: packageData.packageFiles.length,
          detectedLanguages: packageData.detectedLanguages,
        },
        status: 'uploaded',
      });

      res.json({
        ...submission,
        packageInfo: {
          fileCount: packageData.packageFiles.length,
          languages: packageData.detectedLanguages,
        },
      });
    } catch (error: any) {
      console.error("[Games] GitHub ingestion error:", error);
      if (error instanceof GamePackageValidationError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Get game submission
  app.get("/api/games/:id", async (req, res) => {
    try {
      const submission = await storage.getGameSubmission(req.params.id);

      if (!submission) {
        return res.status(404).json({ error: "Game submission not found" });
      }

      res.json(submission);
    } catch (error: any) {
      console.error("[Games] Get submission error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Analyze game for GameLift resources
  app.post("/api/games/:id/analyze", async (req, res) => {
    try {
      const submission = await storage.getGameSubmission(req.params.id);

      if (!submission) {
        return res.status(404).json({ error: "Game submission not found" });
      }

      if (!submission.markdownContent) {
        return res.status(400).json({ error: "Game submission has no markdown content to analyze" });
      }

      // Analyze game using AI
      const resourcePlan = await analyzeGameForGameLift(
        submission.markdownContent,
        (submission.packageMetadata as any)?.detectedLanguages || [],
        submission.name
      );

      // Validate the resource plan
      if (!validateResourcePlan(resourcePlan)) {
        throw new Error('Invalid resource plan generated by AI');
      }

      // Create GameLift resource plan in database
      const plan = await storage.createResourcePlan({
        gameSubmissionId: submission.id,
        fleetConfig: resourcePlan.fleet,
        scalingPolicies: {
          policy: resourcePlan.fleet.scalingPolicy,
          recommendations: resourcePlan.recommendations,
        },
        auxiliaryServices: resourcePlan.auxiliaryServices,
      });

      // Update game submission status
      await storage.updateGameSubmission(submission.id, {
        analysisResult: resourcePlan,
        status: 'analyzed',
      });

      res.json({
        resourcePlan,
        planId: plan.id,
      });
    } catch (error: any) {
      console.error("[Games] Analysis error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get GameLift resource plan
  app.get("/api/games/:id/resource-plan", async (req, res) => {
    try {
      const submission = await storage.getGameSubmission(req.params.id);

      if (!submission) {
        return res.status(404).json({ error: "Game submission not found" });
      }

      // Find resource plan for this submission
      const plan = await storage.getResourcePlanBySubmissionId(submission.id);

      if (!plan) {
        return res.status(404).json({ error: "No resource plan found for this game" });
      }

      res.json(plan);
    } catch (error: any) {
      console.error("[Games] Get resource plan error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== MIGRATION CONSULTANT ROUTES ====================

  // Comprehensive game analysis for migration consulting
  app.post("/api/games/:id/analyze-comprehensive", async (req, res) => {
    try {
      const submission = await storage.getGameSubmission(req.params.id);

      if (!submission) {
        return res.status(404).json({ error: "Game submission not found" });
      }

      if (!submission.markdownContent) {
        return res.status(400).json({ error: "Game submission has no markdown content to analyze" });
      }

      // Perform comprehensive analysis
      const analysis = await analyzeGameComprehensively(
        submission.markdownContent,
        (submission.packageMetadata as any)?.detectedLanguages || [],
        submission.name,
        submission.packageMetadata
      );

      // Update game submission with comprehensive analysis
      await storage.updateGameSubmission(submission.id, {
        analysisResult: analysis as any,
        status: 'comprehensively_analyzed',
      });

      res.json({
        analysis,
        gameId: submission.id,
      });
    } catch (error: any) {
      console.error("[Migration] Comprehensive analysis error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Submit clarifying question responses
  app.post("/api/games/:id/clarifying-responses", async (req, res) => {
    try {
      const submission = await storage.getGameSubmission(req.params.id);

      if (!submission) {
        return res.status(404).json({ error: "Game submission not found" });
      }

      const {
        targetPlayerCount,
        geographicReach,
        latencyRequirements,
        primaryGameModes,
        monetizationStrategy,
        developmentStage,
        multiplayerPlans,
      } = req.body;

      // Create clarifying responses record
      const responses = await storage.createClarifyingResponse({
        gameSubmissionId: submission.id,
        targetPlayerCount,
        geographicReach,
        latencyRequirements,
        primaryGameModes,
        monetizationStrategy,
        developmentStage,
        multiplayerPlans,
      });

      res.json({
        responses,
        gameId: submission.id,
      });
    } catch (error: any) {
      console.error("[Migration] Clarifying responses error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate migration recommendations
  app.post("/api/games/:id/generate-migration-plan", async (req, res) => {
    try {
      const submission = await storage.getGameSubmission(req.params.id);

      if (!submission) {
        return res.status(404).json({ error: "Game submission not found" });
      }

      // Get comprehensive analysis
      const comprehensiveAnalysis = submission.analysisResult as any as ComprehensiveGameAnalysis;
      if (!comprehensiveAnalysis) {
        return res.status(400).json({ error: "Comprehensive analysis not found. Run analyze-comprehensive first." });
      }

      // Get clarifying responses
      const clarifyingResponses = await storage.getClarifyingResponseBySubmissionId(submission.id);
      if (!clarifyingResponses) {
        return res.status(400).json({ error: "Clarifying responses not found. Submit responses first." });
      }

      // Generate migration recommendations
      const recommendations = await generateMigrationRecommendations(
        comprehensiveAnalysis,
        {
          targetPlayerCount: clarifyingResponses.targetPlayerCount || undefined,
          geographicReach: clarifyingResponses.geographicReach || undefined,
          latencyRequirements: clarifyingResponses.latencyRequirements || undefined,
          primaryGameModes: clarifyingResponses.primaryGameModes as any,
          monetizationStrategy: clarifyingResponses.monetizationStrategy || undefined,
          developmentStage: clarifyingResponses.developmentStage || undefined,
          multiplayerPlans: clarifyingResponses.multiplayerPlans || undefined,
        }
      );

      // Create migration recommendation record
      const migrationPlan = await storage.createMigrationRecommendation({
        gameSubmissionId: submission.id,
        recommendedPath: recommendations.recommendedPath,
        pathReasoning: recommendations.pathReasoning,
        awsServicesBreakdown: recommendations.awsServicesBreakdown,
        migrationSteps: recommendations.migrationSteps,
        sdkIntegrationGuide: recommendations.sdkIntegrationGuide,
        costEstimates: recommendations.costEstimates,
      });

      res.json({
        migrationPlan,
        recommendations,
      });
    } catch (error: any) {
      console.error("[Migration] Recommendation generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate feature suggestions
  app.post("/api/games/:id/generate-feature-suggestions", async (req, res) => {
    try {
      const submission = await storage.getGameSubmission(req.params.id);

      if (!submission) {
        return res.status(404).json({ error: "Game submission not found" });
      }

      // Get comprehensive analysis
      const comprehensiveAnalysis = submission.analysisResult as any as ComprehensiveGameAnalysis;
      if (!comprehensiveAnalysis) {
        return res.status(400).json({ error: "Comprehensive analysis not found." });
      }

      // Get migration recommendations
      const migrationPlan = await storage.getMigrationRecommendationBySubmissionId(submission.id);
      if (!migrationPlan) {
        return res.status(400).json({ error: "Migration plan not found. Generate migration plan first." });
      }

      // Generate feature suggestions
      const suggestions = await generateFeatureSuggestions(
        comprehensiveAnalysis,
        {
          recommendedPath: migrationPlan.recommendedPath,
          awsServicesBreakdown: migrationPlan.awsServicesBreakdown,
        }
      );

      // Create feature suggestions record
      const featureSuggestions = await storage.createFeatureSuggestion({
        gameSubmissionId: submission.id,
        suggestedFeatures: suggestions.suggestedFeatures,
        implementationGuides: suggestions.implementationGuides,
        priorityRanking: suggestions.priorityRanking,
      });

      res.json({
        featureSuggestions,
        suggestions,
      });
    } catch (error: any) {
      console.error("[Migration] Feature suggestion error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get migration plan for a game
  app.get("/api/games/:id/migration-plan", async (req, res) => {
    try {
      const plan = await storage.getMigrationRecommendationBySubmissionId(req.params.id);

      if (!plan) {
        return res.status(404).json({ error: "Migration plan not found" });
      }

      res.json(plan);
    } catch (error: any) {
      console.error("[Migration] Get migration plan error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get feature suggestions for a game
  app.get("/api/games/:id/feature-suggestions", async (req, res) => {
    try {
      const suggestions = await storage.getFeatureSuggestionBySubmissionId(req.params.id);

      if (!suggestions) {
        return res.status(404).json({ error: "Feature suggestions not found" });
      }

      res.json(suggestions);
    } catch (error: any) {
      console.error("[Migration] Get feature suggestions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== ADDITIONAL SCANS ROUTES ====================
  
  // Get all scans for a game
  app.get("/api/games/:id/scans", async (req, res) => {
    try {
      const scans = await storage.listAdditionalScansBySubmissionId(req.params.id);
      res.json(scans);
    } catch (error: any) {
      console.error("[Scans] List scans error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new scan
  app.post("/api/games/:id/scans", async (req, res) => {
    try {
      const { scanType, status } = req.body;

      if (!scanType) {
        return res.status(400).json({ error: "scanType is required" });
      }

      // Check if scan already exists
      const existingScan = await storage.getAdditionalScanByType(req.params.id, scanType);
      if (existingScan) {
        return res.status(400).json({ error: "Scan of this type already exists for this game" });
      }

      // Create scan entry
      const scan = await storage.createAdditionalScan({
        gameSubmissionId: req.params.id,
        scanType,
        status: status || 'pending',
      });

      res.json(scan);
    } catch (error: any) {
      console.error("[Scans] Create scan error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific scan
  app.get("/api/games/:id/scans/:scanId", async (req, res) => {
    try {
      const scan = await storage.getAdditionalScan(req.params.scanId);

      if (!scan || scan.gameSubmissionId !== req.params.id) {
        return res.status(404).json({ error: "Scan not found" });
      }

      res.json(scan);
    } catch (error: any) {
      console.error("[Scans] Get scan error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update a scan
  app.patch("/api/games/:id/scans/:scanId", async (req, res) => {
    try {
      const scan = await storage.getAdditionalScan(req.params.scanId);

      if (!scan || scan.gameSubmissionId !== req.params.id) {
        return res.status(404).json({ error: "Scan not found" });
      }

      const updated = await storage.updateAdditionalScan(req.params.scanId, {
        ...req.body,
        completedAt: req.body.status === 'completed' ? new Date() : scan.completedAt,
      });

      res.json(updated);
    } catch (error: any) {
      console.error("[Scans] Update scan error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Execute a scan
  app.post("/api/games/:id/scans/:scanId/execute", async (req, res) => {
    try {
      const scan = await storage.getAdditionalScan(req.params.scanId);

      if (!scan || scan.gameSubmissionId !== req.params.id) {
        return res.status(404).json({ error: "Scan not found" });
      }

      if (scan.status !== 'pending' && scan.status !== 'running') {
        return res.status(400).json({ error: "Scan is not in a runnable state" });
      }

      // Update scan to running status
      await storage.updateAdditionalScan(req.params.scanId, {
        status: 'running',
      });

      // Execute the appropriate scan based on type
      let scanResult;
      
      switch (scan.scanType) {
        case 'cost_optimization':
          const { executeCostOptimizationScan } = await import('./scan-cost-optimization');
          scanResult = await executeCostOptimizationScan(req.params.id);
          break;
        
        case 'security':
          // TODO: Implement security scan
          throw new Error('Security scan not yet implemented');
        
        case 'performance':
          // TODO: Implement performance scan
          throw new Error('Performance scan not yet implemented');
        
        case 'code_quality':
          // TODO: Implement code quality scan
          throw new Error('Code quality scan not yet implemented');
        
        case 'devops_readiness':
          // TODO: Implement devops readiness scan
          throw new Error('DevOps readiness scan not yet implemented');
        
        default:
          throw new Error(`Unknown scan type: ${scan.scanType}`);
      }

      // Update scan with results
      const updated = await storage.updateAdditionalScan(req.params.scanId, {
        status: 'completed',
        scanResults: scanResult,
        score: scanResult.score,
        recommendations: scanResult.recommendations,
        metadata: {
          ...scan.metadata,
          completedAt: new Date().toISOString(),
        },
        completedAt: new Date(),
      });

      res.json(updated);
    } catch (error: any) {
      console.error("[Scans] Execute scan error:", error);
      
      // Update scan to failed status
      try {
        await storage.updateAdditionalScan(req.params.scanId, {
          status: 'failed',
          metadata: {
            error: error.message,
            failedAt: new Date().toISOString(),
          },
        });
      } catch (updateError) {
        console.error("[Scans] Failed to update scan status:", updateError);
      }

      res.status(500).json({ error: error.message });
    }
  });

  // Calculate costs for a resource plan
  app.post("/api/resource-plans/:planId/calculate-costs", async (req, res) => {
    try {
      const plan = await storage.getResourcePlan(req.params.planId);

      if (!plan) {
        return res.status(404).json({ error: "Resource plan not found" });
      }

      const {
        concurrentPlayers = 1000,
        sessionDurationHours = 2,
        regionsCount = 1,
        region = 'us-east-1',
        storageGB = 10,
        monthlyDataTransferGB = 100,
      } = req.body;

      // Extract instance type from fleet config
      const fleetConfig = plan.fleetConfig as any;
      const instanceType = fleetConfig?.instanceTypes?.[0] || 'c5.large';
      const fleetType = fleetConfig?.fleetType || 'on-demand';

      const params: CostParameters = {
        concurrentPlayers,
        sessionDurationHours,
        regionsCount,
        instanceType,
        fleetType,
        storageGB,
        monthlyDataTransferGB,
      };

      const costs = await calculateCosts(params, region);

      // Create cost simulation
      const simulation = await storage.createCostSimulation({
        resourcePlanId: plan.id,
        concurrentPlayers: params.concurrentPlayers,
        sessionDurationMinutes: params.sessionDurationHours * 60,
        regions: [region],
        instanceFamily: params.instanceType.split('.')[0], // Extract family (e.g., c5 from c5.large)
        calculatedInitialCost: costs.total.initialSetup.toFixed(2),
        calculatedMonthlyCost: costs.total.monthlyOperational.toFixed(2),
        costBreakdown: costs,
      });

      res.json({
        simulation,
        costs,
      });
    } catch (error: any) {
      console.error("[Games] Cost calculation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate cost scenarios for a resource plan
  app.post("/api/resource-plans/:planId/scenarios", async (req, res) => {
    try {
      const plan = await storage.getResourcePlan(req.params.planId);

      if (!plan) {
        return res.status(404).json({ error: "Resource plan not found" });
      }

      const {
        regionsCount = 1,
        region = 'us-east-1',
        storageGB = 10,
        monthlyDataTransferGB = 100,
      } = req.body;

      // Extract instance type from fleet config
      const fleetConfig = plan.fleetConfig as any;
      const instanceType = fleetConfig?.instanceTypes?.[0] || 'c5.large';
      const fleetType = fleetConfig?.fleetType || 'on-demand';

      const baseParams = {
        regionsCount,
        instanceType,
        fleetType,
        storageGB,
        monthlyDataTransferGB,
      };

      const scenarios = await generateCostScenarios(baseParams, region);

      res.json({ scenarios });
    } catch (error: any) {
      console.error("[Games] Scenario generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get cost simulations for a resource plan
  app.get("/api/resource-plans/:planId/simulations", async (req, res) => {
    try {
      const simulations = await storage.listCostSimulationsByPlanId(req.params.planId);
      res.json({ simulations });
    } catch (error: any) {
      console.error("[Games] Get simulations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== LEGACY CLOUDFORGE ROUTES ====================
  
  // Upload and analyze document
  app.post("/api/projects/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const content = req.file.buffer.toString("utf-8");
      const documentName = req.file.originalname;

      // Create project
      const project = await storage.createProject({
        name: req.body.name || documentName,
        documentName,
        documentContent: content,
        status: "uploaded",
      });

      res.json(project);
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Analyze document from URL
  app.post("/api/projects/url", async (req, res) => {
    try {
      const { url, name } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Validate URL to prevent SSRF attacks
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      // Only allow HTTP/HTTPS protocols
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return res.status(400).json({ error: "Only HTTP and HTTPS URLs are allowed" });
      }

      const hostname = parsedUrl.hostname.toLowerCase();

      // Security checks to prevent SSRF attacks
      // Block direct IP addresses
      const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      const ipv6Pattern = /^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i;
      
      if (ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname)) {
        return res.status(400).json({ 
          error: "Direct IP addresses are not allowed for security reasons. Please use a domain name." 
        });
      }

      // Block localhost and common internal domains
      const blockedHostnames = [
        'localhost',
        'localhost.localdomain',
        '0.0.0.0',
        '127.0.0.1',
        '::1',
        'metadata.google.internal', // GCP metadata
        '169.254.169.254', // AWS/Azure metadata
      ];

      if (blockedHostnames.includes(hostname)) {
        return res.status(400).json({ 
          error: "Cannot fetch from internal or localhost addresses." 
        });
      }

      // Block private network ranges by checking if hostname resolves to private IP
      // This is a best-effort check - actual blocking happens at network level
      const privateNetworkPatterns = [
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^127\./,
        /^169\.254\./, // link-local
        /^fc00:/i, // IPv6 private
        /^fe80:/i, // IPv6 link-local
      ];

      if (privateNetworkPatterns.some(pattern => pattern.test(hostname))) {
        return res.status(400).json({ 
          error: "Cannot fetch from private network addresses." 
        });
      }

      // Fetch content from URL with timeout
      // Follow redirects automatically (up to default 20 redirects)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          redirect: "follow", // Follow redirects (fetch validates redirect chains)
          headers: {
            'User-Agent': 'CloudForge/1.0',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          return res.status(400).json({ 
            error: `Failed to fetch URL: ${response.status} ${response.statusText}` 
          });
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text") && !contentType.includes("html")) {
          return res.status(400).json({ 
            error: "URL must point to a text document (HTML, Markdown, or plain text)" 
          });
        }

        const content = await response.text();

        if (content.length === 0) {
          return res.status(400).json({ error: "Document is empty" });
        }

        if (content.length > 5 * 1024 * 1024) { // 5MB limit
          return res.status(400).json({ error: "Document is too large (max 5MB)" });
        }

        // Create project
        const project = await storage.createProject({
          name: name || url,
          documentName: url,
          documentContent: content,
          status: "uploaded",
        });

        res.json(project);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          return res.status(408).json({ error: "Request timeout while fetching URL" });
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error("URL fetch error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch documentation from URL" });
    }
  });

  // Validate document
  app.post("/api/projects/:id/validate", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const validation = await validateDocument(
        project.documentContent,
        project.documentName
      );

      // Update project with validation results
      await storage.updateProject(req.params.id, {
        analysisResult: validation,
        status: validation.isValid ? "validated" : "invalid",
      });

      res.json(validation);
    } catch (error: any) {
      console.error("Validation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate questionnaire
  app.post("/api/projects/:id/questionnaire", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const questions = await generateQuestionnaire(
        project.documentContent,
        project.documentName
      );

      // Store questions in project
      await storage.updateProject(req.params.id, {
        configuration: { questions },
        status: "questionnaire",
      });

      res.json(questions);
    } catch (error: any) {
      console.error("Questionnaire generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Auto-complete configuration
  app.post("/api/projects/:id/autocomplete", async (req, res) => {
    try {
      const { explanation, questions, currentAnswers } = req.body;
      
      if (!explanation || !questions) {
        return res.status(400).json({ error: "Explanation and questions are required" });
      }

      const answers = await autoCompleteConfiguration(
        explanation,
        questions,
        currentAnswers || {}
      );

      res.json({ answers });
    } catch (error: any) {
      console.error("Auto-complete error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate playbook
  app.post("/api/projects/:id/playbook", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const { answers } = req.body;
      
      const playbook = await generatePlaybook(
        project.documentContent,
        answers,
        project.documentName
      );

      // Update project with playbook and answers
      await storage.updateProject(req.params.id, {
        playbook,
        configuration: { 
          ...(project.configuration as any),
          answers 
        },
        status: "playbook_generated",
      });

      res.json({ playbook });
    } catch (error: any) {
      console.error("Playbook generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(project);
    } catch (error: any) {
      console.error("Get project error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
