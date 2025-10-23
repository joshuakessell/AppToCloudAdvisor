import { useState } from "react";
import { Header } from "@/components/Header";
import { DocumentUpload } from "@/components/DocumentUpload";
import { AnalysisResults } from "@/components/AnalysisResults";
import { ConfigurationForm } from "@/components/ConfigurationForm";
import { PlaybookViewer } from "@/components/PlaybookViewer";
import { DeploymentDashboard } from "@/components/DeploymentDashboard";
import { ValidationResults } from "@/components/ValidationResults";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Step = "upload" | "analysis" | "configure" | "playbook" | "deploy" | "validate";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const mockPlaybook = `---
- name: Deploy Application to Cloud
  hosts: all
  become: yes
  
  vars:
    app_name: "my-application"
    app_port: 3000
    
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        
    - name: Install Node.js
      apt:
        name: nodejs
        state: present`;

  const mockRequirements = [
    {
      category: "Infrastructure",
      items: ["Ubuntu 20.04 LTS", "2 CPU cores minimum", "4GB RAM", "20GB storage"]
    },
    {
      category: "Dependencies",
      items: ["Node.js 18.x", "PostgreSQL 14", "Nginx 1.18", "Redis 6.x"]
    },
    {
      category: "Configuration",
      items: ["SSL certificate required", "Port 80, 443 open", "Domain name configured"]
    },
    {
      category: "Database",
      items: ["PostgreSQL user with admin privileges", "Database initialization scripts"]
    }
  ];

  const mockValidationChecks = [
    {
      id: "1",
      name: "HTTP Connectivity",
      status: "passed" as const,
      message: "Successfully connected to application on port 80"
    },
    {
      id: "2",
      name: "HTTPS/SSL Certificate",
      status: "passed" as const,
      message: "SSL certificate is valid and properly configured"
    },
    {
      id: "3",
      name: "Database Connection",
      status: "passed" as const,
      message: "PostgreSQL database is accessible and responding"
    },
    {
      id: "4",
      name: "Application Health",
      status: "warning" as const,
      message: "Application responding but memory usage is at 85%"
    },
    {
      id: "5",
      name: "DNS Resolution",
      status: "passed" as const,
      message: "Domain name resolves correctly to instance IP"
    }
  ];

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setTimeout(() => setCurrentStep("analysis"), 1500);
  };

  const handleUrlSubmit = (url: string) => {
    console.log("URL submitted:", url);
    setTimeout(() => setCurrentStep("analysis"), 1500);
  };

  const handleBack = () => {
    const steps: Step[] = ["upload", "analysis", "configure", "playbook", "deploy", "validate"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-12">
        {currentStep !== "upload" && (
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        {currentStep === "upload" && (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Transform Installation Guides into Cloud Deployments
              </h1>
              <p className="text-xl text-muted-foreground">
                Upload your bare-metal installation guide or provide a documentation URL and let AI generate production-ready
                Ansible playbooks for AWS, GCP, or Azure
              </p>
            </div>
            <DocumentUpload 
              onFileSelect={handleFileSelect}
              onUrlSubmit={handleUrlSubmit}
            />
          </div>
        )}

        {currentStep === "analysis" && (
          <AnalysisResults
            requirements={mockRequirements}
            onContinue={() => setCurrentStep("configure")}
          />
        )}

        {currentStep === "configure" && (
          <ConfigurationForm
            onSubmit={(config) => {
              console.log("Configuration:", config);
              setCurrentStep("playbook");
            }}
          />
        )}

        {currentStep === "playbook" && (
          <PlaybookViewer
            playbook={mockPlaybook}
            onDeploy={() => setCurrentStep("deploy")}
          />
        )}

        {currentStep === "deploy" && (
          <DeploymentDashboard
            onValidate={() => setCurrentStep("validate")}
          />
        )}

        {currentStep === "validate" && (
          <ValidationResults
            checks={mockValidationChecks}
            onFinalize={() => console.log("Deployment finalized")}
            onRetry={() => setCurrentStep("deploy")}
          />
        )}
      </main>
    </div>
  );
}
