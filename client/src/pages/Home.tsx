import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { DocumentUpload } from "@/components/DocumentUpload";
import { ProcessingScreen } from "@/components/ProcessingScreen";
import { ValidationScreen } from "@/components/ValidationScreen";
import { ClarifyingQuestions } from "@/components/ClarifyingQuestions";
import { MigrationPathwayVisualization } from "@/components/MigrationPathwayVisualization";
import { FeatureSuggestionsDisplay } from "@/components/FeatureSuggestionsDisplay";
import { MigrationGuideRoadmap } from "@/components/MigrationGuideRoadmap";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { fadeIn, fadeInUp, slideInFromRight } from "@/lib/animations";

type Step = "upload" | "processing" | "validating" | "clarifying" | "migration-plan" | "pathway" | "features" | "roadmap";

interface ValidationResult {
  isValid: boolean;
  issues: Array<{
    severity: "error" | "warning";
    message: string;
  }>;
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
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameName, setGameName] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<any>(null);
  const [migrationPlan, setMigrationPlan] = useState<any>(null);
  const [featureSuggestions, setFeatureSuggestions] = useState<any>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    try {
      setSelectedFile(file);
      const name = file.name.replace(/\.zip$/i, "");
      setDocumentName(file.name);
      setGameName(name);
      setCurrentStep("processing");

      const steps: ProcessingStep[] = [
        { id: "upload", message: "Uploading game package and extracting files...", status: "processing" },
        { id: "validate", message: "Validating game.md structure and requirements...", status: "pending" },
        { id: "analyze", message: "Performing comprehensive game analysis...", status: "pending" },
        { id: "readiness", message: "Assessing AWS GameLift migration readiness...", status: "pending" },
      ];
      setProcessingSteps([...steps]);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);

      const submission = await apiRequest("POST", "/api/games/upload", formData);
      setGameId(submission.id);
      setGameName(submission.name);

      setProcessingSteps(prev => prev.map((s, i) => 
        i === 0 ? { ...s, status: "complete" } : i === 1 ? { ...s, status: "processing" } : s
      ));

      // Validate markdown file
      setProcessingSteps(prev => prev.map((s, i) => 
        i <= 1 ? { ...s, status: "complete" } : i === 2 ? { ...s, status: "processing" } : s
      ));

      // Comprehensive AI analysis
      const analysis = await apiRequest("POST", `/api/games/${submission.id}/analyze-comprehensive`);
      
      if (!analysis || !analysis.analysis) {
        throw new Error("Analysis failed - no comprehensive analysis generated");
      }

      setComprehensiveAnalysis(analysis.analysis);
      
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
            message: `Analysis complete. AWS readiness score: ${analysis.analysis.awsReadiness.readinessScore}/10`
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
      const name = url.split('/').pop() || 'game';
      setGameName(name);
      setCurrentStep("processing");

      const steps: ProcessingStep[] = [
        { id: "fetch", message: "Cloning GitHub repository...", status: "processing" },
        { id: "validate", message: "Validating game.md structure and requirements...", status: "pending" },
        { id: "analyze", message: "Performing comprehensive game analysis...", status: "pending" },
        { id: "readiness", message: "Assessing AWS GameLift migration readiness...", status: "pending" },
      ];
      setProcessingSteps([...steps]);

      const submission = await apiRequest("POST", "/api/games/github", {
        url,
        name,
      });
      setGameId(submission.id);
      setGameName(submission.name);

      setProcessingSteps(prev => prev.map((s, i) => 
        i === 0 ? { ...s, status: "complete" } : i === 1 ? { ...s, status: "processing" } : s
      ));

      // Validate markdown file
      setProcessingSteps(prev => prev.map((s, i) => 
        i <= 1 ? { ...s, status: "complete" } : i === 2 ? { ...s, status: "processing" } : s
      ));

      // Comprehensive AI analysis
      const analysis = await apiRequest("POST", `/api/games/${submission.id}/analyze-comprehensive`);
      
      if (!analysis || !analysis.analysis) {
        throw new Error("Analysis failed - no comprehensive analysis generated");
      }

      setComprehensiveAnalysis(analysis.analysis);
      
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
            message: `Analysis complete. AWS readiness score: ${analysis.analysis.awsReadiness.readinessScore}/10`
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

  const handleProceedToClarifying = () => {
    setCurrentStep("clarifying");
  };

  const handleClarifyingComplete = async (responses: any) => {
    try {
      if (!gameId) return;

      setCurrentStep("migration-plan");
      
      toast({
        title: "Generating Migration Plan",
        description: "Creating personalized AWS GameLift migration roadmap...",
      });

      // Generate migration recommendations
      const migrationResult = await apiRequest("POST", `/api/games/${gameId}/generate-migration-plan`);
      
      if (!migrationResult || !migrationResult.recommendations) {
        throw new Error("Failed to generate migration recommendations");
      }

      setMigrationPlan(migrationResult.recommendations);

      toast({
        title: "Migration Plan Ready",
        description: "Your personalized AWS migration pathway has been generated",
      });

      // Generate feature suggestions
      const featureResult = await apiRequest("POST", `/api/games/${gameId}/generate-feature-suggestions`);
      
      if (featureResult && featureResult.suggestions) {
        setFeatureSuggestions(featureResult.suggestions);
      }

      // Move to pathway visualization
      setCurrentStep("pathway");
    } catch (error: any) {
      console.error("Migration plan generation error:", error);
      toast({
        title: "Plan Generation Failed",
        description: error.message || "Failed to generate migration plan",
        variant: "destructive",
      });
    }
  };

  const handleViewFeatures = () => {
    setCurrentStep("features");
  };

  const handleViewRoadmap = () => {
    setCurrentStep("roadmap");
  };

  const handleBack = () => {
    const steps: Step[] = ["upload", "processing", "validating", "clarifying", "migration-plan", "pathway", "features", "roadmap"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleRetryValidation = () => {
    setCurrentStep("upload");
    setValidationResult(null);
    setGameId(null);
    setComprehensiveAnalysis(null);
    setMigrationPlan(null);
    setFeatureSuggestions(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <AnimatePresence mode="wait">
          {currentStep !== "upload" && currentStep !== "processing" && (
            <motion.div
              key="back-button"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-6"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {currentStep === "upload" && (
            <motion.div
              key="upload"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h1 className="text-4xl font-bold mb-4">
                  AWS GameLift Migration Consultant
                </h1>
                <p className="text-xl text-muted-foreground">
                  Upload your game package or provide a GitHub repository URL and let AI guide you through 
                  migrating to AWS GameLift with personalized recommendations
                </p>
              </div>
              <DocumentUpload 
                onFileSelect={handleFileSelect}
                onUrlSubmit={handleUrlSubmit}
              />
            </motion.div>
          )}

          {currentStep === "processing" && (
            <motion.div
              key="processing"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ProcessingScreen
                steps={processingSteps}
                onComplete={() => {}}
              />
            </motion.div>
          )}

          {currentStep === "validating" && (
            <motion.div
              key="validating"
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ValidationScreen
                isAnalyzing={false}
                isValid={validationResult?.isValid || false}
                documentName={documentName}
                issues={validationResult?.issues || []}
                onRetry={handleRetryValidation}
                onContinue={handleProceedToClarifying}
              />
            </motion.div>
          )}

          {currentStep === "clarifying" && gameId && (
            <motion.div
              key="clarifying"
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ClarifyingQuestions
                gameId={gameId}
                gameName={gameName}
                onComplete={handleClarifyingComplete}
                comprehensiveAnalysis={comprehensiveAnalysis}
              />
            </motion.div>
          )}

          {currentStep === "migration-plan" && (
            <motion.div
              key="migration-plan"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center justify-center min-h-[400px]"
            >
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <h3 className="text-xl font-semibold">Generating Your Migration Plan...</h3>
                <p className="text-muted-foreground mt-2">
                  Analyzing your responses and creating personalized AWS GameLift recommendations
                </p>
              </div>
            </motion.div>
          )}

          {currentStep === "pathway" && migrationPlan && (
            <motion.div
              key="pathway"
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <MigrationPathwayVisualization migrationPlan={migrationPlan} />
              
              <div className="flex justify-between items-center pt-6 border-t">
                {featureSuggestions && (
                  <Button
                    onClick={handleViewFeatures}
                    variant="outline"
                    data-testid="button-view-features"
                  >
                    View Feature Suggestions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={handleViewRoadmap}
                  data-testid="button-view-roadmap"
                >
                  View Migration Roadmap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === "features" && featureSuggestions && (
            <motion.div
              key="features"
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <FeatureSuggestionsDisplay suggestions={featureSuggestions} />
              
              <div className="flex justify-end pt-6 border-t">
                <Button
                  onClick={handleViewRoadmap}
                  data-testid="button-view-roadmap-from-features"
                >
                  View Migration Roadmap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === "roadmap" && migrationPlan && (
            <motion.div
              key="roadmap"
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <MigrationGuideRoadmap migrationPlan={migrationPlan} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
