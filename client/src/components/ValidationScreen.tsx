import { useEffect } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ValidationIssue {
  severity: "error" | "warning";
  message: string;
}

interface ValidationScreenProps {
  isAnalyzing: boolean;
  isValid: boolean;
  documentName: string;
  issues?: ValidationIssue[];
  onRetry?: () => void;
  onContinue?: () => void;
}

export function ValidationScreen({
  isAnalyzing,
  isValid,
  documentName,
  issues = [],
  onRetry,
  onContinue,
}: ValidationScreenProps) {
  useEffect(() => {
    if (isValid && !isAnalyzing && onContinue) {
      const timer = setTimeout(() => {
        onContinue();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isValid, isAnalyzing, onContinue]);

  if (isAnalyzing) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Analyzing Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Scanning for installation requirements, dependencies, and configuration options...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid) {
    const errors = issues.filter(i => i.severity === "error");
    const warnings = issues.filter(i => i.severity === "warning");

    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <h2 className="text-2xl font-semibold">Validation Failed</h2>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to Generate Playbook</AlertTitle>
          <AlertDescription>
            The provided documentation does not contain sufficient information to generate an Ansible playbook.
            Please review the issues below and provide alternative documentation.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {documentName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Critical Issues ({errors.length})
                </h3>
                <ul className="space-y-2 ml-6">
                  {errors.map((issue, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>{issue.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-chart-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Warnings ({warnings.length})
                </h3>
                <ul className="space-y-2 ml-6">
                  {warnings.map((issue, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-chart-3 mt-0.5">•</span>
                      <span>{issue.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-medium">Recommendations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Ensure the documentation includes step-by-step installation instructions</li>
                <li>• Verify that system requirements and dependencies are clearly listed</li>
                <li>• Include configuration details for services and applications</li>
                <li>• Provide information about required ports, users, and permissions</li>
              </ul>
              {onRetry && (
                <Button onClick={onRetry} className="mt-4" data-testid="button-try-again">
                  Try Different Documentation
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle2 className="h-6 w-6 text-chart-2" />
        <h2 className="text-2xl font-semibold">Validation Successful</h2>
      </div>

      <Alert className="border-chart-2 bg-chart-2/10">
        <CheckCircle2 className="h-4 w-4 text-chart-2" />
        <AlertTitle>Documentation Validated</AlertTitle>
        <AlertDescription>
          The documentation contains sufficient information. Proceeding to configuration options...
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading configuration options...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
