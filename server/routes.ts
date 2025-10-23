import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { validateDocument, generateQuestionnaire, generatePlaybook, autoCompleteConfiguration } from "./ai-service";
import { insertProjectSchema } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
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

      // Allowlist approach: Only allow common documentation hosting domains
      // This prevents DNS rebinding and other SSRF attacks
      const allowedDomains = [
        // Documentation hosting
        'github.com',
        'gitlab.com',
        'bitbucket.org',
        'docs.gitlab.com',
        'raw.githubusercontent.com',
        'gist.githubusercontent.com',
        
        // Common doc sites
        'readthedocs.io',
        'readthedocs.org',
        'github.io',
        'gitlab.io',
        'gitbook.io',
        
        // Official docs
        'docs.docker.com',
        'kubernetes.io',
        'docs.aws.amazon.com',
        'cloud.google.com',
        'docs.microsoft.com',
        'nginx.org',
        'apache.org',
        'postgresql.org',
        'mongodb.com',
        'redis.io',
        'elastic.co',
        
        // CDN and misc
        'githubusercontent.com',
        'raw.github.com',
        'medium.com',
        'dev.to',
      ];

      const isAllowed = allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      );

      if (!isAllowed) {
        return res.status(400).json({ 
          error: `URL domain "${hostname}" is not in the allowed list. Please use documentation from trusted sources like GitHub, GitLab, ReadTheDocs, or official project documentation sites.`
        });
      }

      // Additional check: Block IP addresses in hostname (DNS rebinding prevention)
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i;
      if (ipPattern.test(hostname)) {
        return res.status(400).json({ error: "Direct IP addresses are not allowed. Please use a domain name from an allowed documentation source." });
      }

      // Fetch content from URL with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          redirect: "manual", // Prevent following redirects to avoid SSRF via open redirects
          headers: {
            'User-Agent': 'CloudForge/1.0',
          },
        });

        clearTimeout(timeoutId);

        // Handle redirects (manual mode returns 3xx status)
        if (response.status >= 300 && response.status < 400) {
          return res.status(400).json({ 
            error: "Redirects are not supported for security reasons. Please provide a direct link to the documentation."
          });
        }

        if (!response.ok) {
          return res.status(400).json({ 
            error: `Failed to fetch URL: ${response.status} ${response.statusText}` 
          });
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text")) {
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
