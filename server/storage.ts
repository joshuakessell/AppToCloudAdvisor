import { type Project, type InsertProject } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  listProjects(): Promise<Project[]>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;

  constructor() {
    this.projects = new Map();
  }

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

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
}

export const storage = new MemStorage();
