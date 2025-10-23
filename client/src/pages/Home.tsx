import { useState } from "react";
import { Header } from "@/components/Header";
import { DocumentUpload } from "@/components/DocumentUpload";
import { ValidationScreen } from "@/components/ValidationScreen";
import { DynamicQuestionnaire } from "@/components/DynamicQuestionnaire";
import { PlaybookViewer } from "@/components/PlaybookViewer";
import { DeploymentDashboard } from "@/components/DeploymentDashboard";
import { ValidationResults } from "@/components/ValidationResults";
import { AnalysisResults } from "@/components/AnalysisResults";
import { ConfigurationForm } from "@/components/ConfigurationForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Step = "upload" | "analysis" | "configure" | "validating" | "questionnaire" | "playbook" | "deploy" | "validate";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [isValidDoc, setIsValidDoc] = useState(true);

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

  const mockValidationIssues = [
    {
      severity: "error" as const,
      message: "Document does not contain installation steps or commands. The documentation appears to be a feature overview rather than an installation guide."
    },
    {
      severity: "error" as const,
      message: "No system requirements specified. Unable to determine minimum hardware, operating system, or software prerequisites."
    },
    {
      severity: "warning" as const,
      message: "Configuration details are vague or incomplete. Some optional parameters may not be available in the generated playbook."
    }
  ];

  const mockDynamicQuestions = [
    {
      id: "cloud_provider",
      type: "provider" as const,
      label: "Select Cloud Provider",
      description: "Choose your preferred cloud infrastructure platform, or select 'Cloud Agnostic' to generate a playbook that works across providers",
      required: true
    },
    {
      id: "deployment_region",
      type: "select" as const,
      label: "Deployment Region",
      description: "Select the geographic region for your deployment",
      required: true,
      options: ["us-east-1 (N. Virginia)", "us-west-2 (Oregon)", "eu-west-1 (Ireland)", "ap-southeast-1 (Singapore)"]
    },
    {
      id: "instance_count",
      type: "number" as const,
      label: "Number of Instances",
      description: "How many instances should be provisioned initially?",
      required: true,
      placeholder: "e.g., 2"
    },
    {
      id: "auto_scaling",
      type: "radio" as const,
      label: "Enable Auto-Scaling",
      description: "Should the infrastructure automatically scale based on demand?",
      required: true,
      options: ["Yes, enable auto-scaling", "No, use fixed capacity"]
    },
    {
      id: "database_config",
      type: "select" as const,
      label: "Database Configuration",
      description: "Based on the documentation, PostgreSQL 14 is required. How should it be provisioned?",
      required: true,
      options: ["Managed database service (RDS/Cloud SQL)", "Self-hosted on VM", "Existing database (provide connection details later)"]
    },
    {
      id: "features",
      type: "checkbox" as const,
      label: "Optional Features",
      description: "Select additional features to include in your deployment",
      required: false,
      options: [
        "SSL/TLS Certificate (via Let's Encrypt)",
        "Database Backup Automation",
        "Monitoring & Alerts",
        "Log Aggregation",
        "Redis Cache Layer"
      ]
    },
    {
      id: "custom_config",
      type: "textarea" as const,
      label: "Custom Configuration",
      description: "Any additional configuration parameters or environment variables",
      required: false,
      placeholder: "Enter any custom configuration parameters..."
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
    setDocumentName(file.name);
    setCurrentStep("validating");
    
    setTimeout(() => {
      const random = Math.random();
      setIsValidDoc(random > 0.3);
    }, 2000);
  };

  const handleUrlSubmit = (url: string) => {
    console.log("URL submitted:", url);
    setDocumentName(url);
    setCurrentStep("validating");
    
    setTimeout(() => {
      const random = Math.random();
      setIsValidDoc(random > 0.3);
    }, 2000);
  };

  const handleBack = () => {
    const steps: Step[] = ["upload", "validating", "questionnaire", "playbook", "deploy", "validate"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleRetryValidation = () => {
    setCurrentStep("upload");
    setIsValidDoc(true);
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

        {currentStep === "validating" && (
          <ValidationScreen
            isAnalyzing={isValidDoc === true && currentStep === "validating"}
            isValid={isValidDoc}
            documentName={documentName}
            issues={isValidDoc ? [] : mockValidationIssues}
            onRetry={handleRetryValidation}
            onContinue={() => setCurrentStep("questionnaire")}
          />
        )}

        {currentStep === "questionnaire" && (
          <DynamicQuestionnaire
            questions={mockDynamicQuestions}
            onSubmit={(answers) => {
              console.log("Questionnaire answers:", answers);
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
