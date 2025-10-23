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
import { GameLiftResourceVisualization } from "@/components/GameLiftResourceVisualization";
import { GameLiftCostSimulator } from "@/components/GameLiftCostSimulator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type Step = "upload" | "processing" | "validating" | "resources" | "configuration" | "questionnaire" | "playbook" | "deploy" | "validate";

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
  const [resourcePlan, setResourcePlan] = useState<any>(null);
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
        { id: "upload", message: "Uploading game package and extracting files...", status: "processing" },
        { id: "validate", message: "Validating game.md structure and requirements...", status: "pending" },
        { id: "ai", message: "Analyzing game architecture with AI...", status: "pending" },
        { id: "resources", message: "Determining GameLift resource requirements...", status: "pending" },
      ];
      setProcessingSteps([...steps]);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name.replace(/\.zip$/i, ""));

      const submission = await apiRequest("POST", "/api/game-submissions/upload", formData);
      setProjectId(submission.id);

      setProcessingSteps(prev => prev.map((s, i) => 
        i === 0 ? { ...s, status: "complete" } : i === 1 ? { ...s, status: "processing" } : s
      ));

      // Validate markdown file
      setProcessingSteps(prev => prev.map((s, i) => 
        i <= 1 ? { ...s, status: "complete" } : i === 2 ? { ...s, status: "processing" } : s
      ));

      // AI analysis
      const analysis = await apiRequest("POST", `/api/game-submissions/${submission.id}/analyze`);
      
      if (!analysis || !analysis.resourcePlan) {
        throw new Error("Analysis failed - no resource plan generated");
      }

      setResourcePlan(analysis.resourcePlan);
      
      setProcessingSteps(prev => prev.map((s, i) => 
        i <= 2 ? { ...s, status: "complete" } : i === 3 ? { ...s, status: "processing" } : s
      ));

      setProcessingSteps(prev => prev.map(s => ({ ...s, status: "complete" })));
      
      setTimeout(() => {
        setCurrentStep("validating");
        setValidationResult({ 
          isValid: true, 
          issues: [{
            severity: "warning",
            message: "Resource analysis complete. Review recommendations below."
          }]
        });
      }, 500);
    } catch (error: any) {
      console.error("File upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload game package",
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
        { id: "fetch", message: "Cloning GitHub repository...", status: "processing" },
        { id: "validate", message: "Validating game.md structure and requirements...", status: "pending" },
        { id: "ai", message: "Analyzing game architecture with AI...", status: "pending" },
        { id: "resources", message: "Determining GameLift resource requirements...", status: "pending" },
      ];
      setProcessingSteps([...steps]);

      const submission = await apiRequest("POST", "/api/game-submissions/github", {
        githubUrl: url,
        name: url.split('/').pop() || 'game',
      });
      setProjectId(submission.id);

      setProcessingSteps(prev => prev.map((s, i) => 
        i === 0 ? { ...s, status: "complete" } : i === 1 ? { ...s, status: "processing" } : s
      ));

      // Validate markdown file
      setProcessingSteps(prev => prev.map((s, i) => 
        i <= 1 ? { ...s, status: "complete" } : i === 2 ? { ...s, status: "processing" } : s
      ));

      // AI analysis
      const analysis = await apiRequest("POST", `/api/game-submissions/${submission.id}/analyze`);
      
      if (!analysis || !analysis.resourcePlan) {
        throw new Error("Analysis failed - no resource plan generated");
      }

      setResourcePlan(analysis.resourcePlan);
      
      setProcessingSteps(prev => prev.map((s, i) => 
        i <= 2 ? { ...s, status: "complete" } : i === 3 ? { ...s, status: "processing" } : s
      ));

      setProcessingSteps(prev => prev.map(s => ({ ...s, status: "complete" })));
      
      setTimeout(() => {
        setCurrentStep("validating");
        setValidationResult({ 
          isValid: true, 
          issues: [{
            severity: "warning",
            message: "Resource analysis complete. Review recommendations below."
          }]
        });
      }, 500);
    } catch (error: any) {
      console.error("URL submission error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to fetch and analyze GitHub repository",
        variant: "destructive",
      });
      setCurrentStep("upload");
    }
  };

  const handleProceedToConfiguration = () => {
    setCurrentStep("resources");
  };

  const handleProceedToSimulator = () => {
    setCurrentStep("configuration");
  };

  const handleCostCalculation = async (params: any) => {
    try {
      if (!resourcePlan) return;

      toast({
        title: "Calculating Costs",
        description: "Generating detailed cost breakdown...",
      });

      const result = await apiRequest("POST", `/api/resource-plans/${resourcePlan.id}/calculate-costs`, params);
      
      toast({
        title: "Costs Calculated",
        description: `Initial: $${result.costs.total.initialSetup} | Monthly: $${result.costs.total.monthlyOperational}`,
      });

      // You could transition to a cost results screen here
      console.log("Cost calculation result:", result);
    } catch (error: any) {
      console.error("Cost calculation error:", error);
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate costs",
        variant: "destructive",
      });
    }
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
    const steps: Step[] = ["upload", "processing", "validating", "resources", "configuration", "questionnaire", "playbook", "deploy", "validate"];
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

        {currentStep === "resources" && resourcePlan && (
          <GameLiftResourceVisualization
            resourcePlan={resourcePlan}
            onProceedToSimulator={handleProceedToSimulator}
          />
        )}

        {currentStep === "configuration" && resourcePlan && (
          <GameLiftCostSimulator
            resourcePlanId={resourcePlan.id}
            defaultInstanceType={resourcePlan.fleetConfig?.instanceType || "c5.large"}
            onCalculate={handleCostCalculation}
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
