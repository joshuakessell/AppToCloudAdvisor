import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ValidationCheck {
  id: string;
  name: string;
  status: "passed" | "failed" | "warning";
  message: string;
}

interface ValidationResultsProps {
  checks: ValidationCheck[];
  onFinalize: () => void;
  onRetry: () => void;
}

export function ValidationResults({ checks, onFinalize, onRetry }: ValidationResultsProps) {
  const passedCount = checks.filter(c => c.status === "passed").length;
  const failedCount = checks.filter(c => c.status === "failed").length;
  const warningCount = checks.filter(c => c.status === "warning").length;

  const getStatusIcon = (status: ValidationCheck["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="h-5 w-5 text-chart-2" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-chart-3" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Validation Results</h2>
        <p className="text-sm text-muted-foreground">
          Deployment health check and connectivity tests
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-3xl font-bold text-chart-2">{passedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-chart-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-3xl font-bold text-chart-3">{warningCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-chart-3" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-3xl font-bold text-destructive">{failedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Validation Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checks.map((check) => (
              <div
                key={check.id}
                className="flex items-start gap-3 p-4 rounded-lg border hover-elevate"
                data-testid={`check-${check.id}`}
              >
                <div className="mt-0.5">
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{check.name}</p>
                    <Badge
                      variant={
                        check.status === "passed"
                          ? "default"
                          : check.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {check.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1">
                {failedCount === 0 ? "Deployment Successful" : "Action Required"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {failedCount === 0
                  ? "All validation checks passed. Your application is ready to use."
                  : "Some checks failed. Review the errors and retry deployment."}
              </p>
            </div>
            <div className="flex gap-2">
              {failedCount > 0 && (
                <Button variant="outline" onClick={onRetry} data-testid="button-retry">
                  Retry Deployment
                </Button>
              )}
              <Button
                onClick={onFinalize}
                disabled={failedCount > 0}
                data-testid="button-finalize"
              >
                Finalize Deployment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
