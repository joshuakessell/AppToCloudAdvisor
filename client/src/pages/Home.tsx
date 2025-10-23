import { useState } from "react";
import { Header } from "@/components/Header";
import { DocumentUpload } from "@/components/DocumentUpload";
import { ProcessingScreen } from "@/components/ProcessingScreen";
import { ValidationScreen } from "@/components/ValidationScreen";
import { ConfigurationScreen } from "@/components/ConfigurationScreen";
import { DynamicQuestionnaire } from "@/components/DynamicQuestionnaire";
import { PlaybookViewer } from "@/components/PlaybookViewer";
import { DeploymentDashboard } from "@/components/DeploymentDashboard";
import { ValidationResults } from "@/components/ValidationResults";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type Step = "upload" | "processing" | "validating" | "configuration" | "questionnaire" | "playbook" | "deploy" | "validate";

interface ValidationResult {
  isValid: boolean;
  issues: Array<{
    severity: "error" | "warning";
    message: string;
  }>;
}

interface Question {
  id: string;
  type: "text" | "select" | "radio" | "checkbox" | "textarea" | "number" | "provider";
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  examples?: string[];
}

interface ProcessingStep {
  id: string;
  message: string;
  status: "pending" | "processing" | "complete";
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generatedPlaybook, setGeneratedPlaybook] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const { toast } = useToast();

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

  const handleFileSelect = async (file: File) => {
    try {
      setSelectedFile(file);
      setDocumentName(file.name);
      setCurrentStep("processing");

      const steps: ProcessingStep[] = [
        { id: "upload", message: "Uploading document and extracting content...", status: "processing" },
        { id: "ai", message: "Sending information to AI for analysis...", status: "pending" },
        { id: "validate", message: "Processing deployment guide and validating requirements...", status: "pending" },
        { id: "extract", message: "Extracting configuration options...", status: "pending" },
      ];
      setProcessingSteps([...steps]);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);

      const project = await apiRequest("POST", "/api/projects/upload", formData);
      setProjectId(project.id);

      setProcessingSteps(prev => prev.map((s, i) => 
        i === 0 ? { ...s, status: "complete" } : i === 1 ? { ...s, status: "processing" } : s
      ));

      const validation = await apiRequest("POST", `/api/projects/${project.id}/validate`);
      setValidationResult(validation);

      setProcessingSteps(prev => prev.map((s, i) => 
        i <= 1 ? { ...s, status: "complete" } : i === 2 ? { ...s, status: "processing" } : s
      ));

      if (validation.isValid) {
        setProcessingSteps(prev => prev.map((s, i) => 
          i <= 2 ? { ...s, status: "complete" } : i === 3 ? { ...s, status: "processing" } : s
        ));

        const generatedQuestions = await apiRequest("POST", `/api/projects/${project.id}/questionnaire`);
        setQuestions(generatedQuestions);

        setProcessingSteps(prev => prev.map(s => ({ ...s, status: "complete" })));
        
        setTimeout(() => {
          setCurrentStep("validating");
        }, 500);
      } else {
        setCurrentStep("validating");
      }
    } catch (error: any) {
      console.error("File upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
      setCurrentStep("upload");
    }
  };

  const handleUrlSubmit = async (url: string) => {
    try {
      setDocumentName(url);
      setCurrentStep("processing");

      const steps: ProcessingStep[] = [
        { id: "fetch", message: "Fetching documentation from URL...", status: "processing" },
        { id: "ai", message: "Sending information to AI for analysis...", status: "pending" },
        { id: "validate", message: "Processing deployment guide and validating requirements...", status: "pending" },
        { id: "extract", message: "Extracting configuration options...", status: "pending" },
      ];
      setProcessingSteps([...steps]);

      const project = await apiRequest("POST", "/api/projects/url", {
        url,
        name: url,
      });
      setProjectId(project.id);

      setProcessingSteps(prev => prev.map((s, i) => 
        i === 0 ? { ...s, status: "complete" } : i === 1 ? { ...s, status: "processing" } : s
      ));

      const validation = await apiRequest("POST", `/api/projects/${project.id}/validate`);
      setValidationResult(validation);

      setProcessingSteps(prev => prev.map((s, i) => 
        i <= 1 ? { ...s, status: "complete" } : i === 2 ? { ...s, status: "processing" } : s
      ));

      if (validation.isValid) {
        setProcessingSteps(prev => prev.map((s, i) => 
          i <= 2 ? { ...s, status: "complete" } : i === 3 ? { ...s, status: "processing" } : s
        ));

        const generatedQuestions = await apiRequest("POST", `/api/projects/${project.id}/questionnaire`);
        setQuestions(generatedQuestions);

        setProcessingSteps(prev => prev.map(s => ({ ...s, status: "complete" })));
        
        setTimeout(() => {
          setCurrentStep("validating");
        }, 500);
      } else {
        setCurrentStep("validating");
      }
    } catch (error: any) {
      console.error("URL submission error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to fetch and analyze documentation",
        variant: "destructive",
      });
      setCurrentStep("upload");
    }
  };

  const handleProceedToConfiguration = () => {
    setCurrentStep("configuration");
  };

  const handleQuestionnaireSubmit = async (answers: Record<string, any>) => {
    try {
      if (!projectId) return;

      toast({
        title: "Generating Playbook",
        description: "Creating your customized Ansible playbook...",
      });

      const result = await apiRequest("POST", `/api/projects/${projectId}/playbook`, {
        answers,
      });

      setGeneratedPlaybook(result.playbook);
      setCurrentStep("playbook");

      toast({
        title: "Playbook Generated",
        description: "Your Ansible playbook is ready for download and deployment",
      });
    } catch (error: any) {
      console.error("Playbook generation error:", error);
      toast({
        title: "Playbook Generation Failed",
        description: error.message || "Failed to generate playbook",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    const steps: Step[] = ["upload", "processing", "validating", "configuration", "questionnaire", "playbook", "deploy", "validate"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleRetryValidation = () => {
    setCurrentStep("upload");
    setValidationResult(null);
    setProjectId(null);
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

        {currentStep === "processing" && (
          <ProcessingScreen
            steps={processingSteps}
            onComplete={() => {}}
          />
        )}

        {currentStep === "validating" && (
          <ValidationScreen
            isAnalyzing={false}
            isValid={validationResult?.isValid || false}
            documentName={documentName}
            issues={validationResult?.issues || []}
            onRetry={handleRetryValidation}
            onContinue={handleProceedToConfiguration}
          />
        )}

        {currentStep === "configuration" && questions.length > 0 && projectId && (
          <ConfigurationScreen
            questions={questions}
            projectId={projectId}
            onSubmit={handleQuestionnaireSubmit}
          />
        )}

        {currentStep === "questionnaire" && questions.length > 0 && (
          <DynamicQuestionnaire
            questions={questions}
            onSubmit={handleQuestionnaireSubmit}
          />
        )}

        {currentStep === "playbook" && (
          <PlaybookViewer
            playbook={generatedPlaybook}
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
