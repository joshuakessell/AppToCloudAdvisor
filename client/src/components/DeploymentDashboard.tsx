import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Loader2, XCircle, Server, Database, Globe } from "lucide-react";

interface DeploymentStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  message?: string;
}

interface DeploymentDashboardProps {
  onValidate: () => void;
}

export function DeploymentDashboard({ onValidate }: DeploymentDashboardProps) {
  const [steps, setSteps] = useState<DeploymentStep[]>([
    { id: "1", name: "Provisioning infrastructure", status: "running" },
    { id: "2", name: "Installing dependencies", status: "pending" },
    { id: "3", name: "Configuring database", status: "pending" },
    { id: "4", name: "Deploying application", status: "pending" },
    { id: "5", name: "Running health checks", status: "pending" },
  ]);

  const [logs, setLogs] = useState<string[]>([
    "[00:00:01] Starting deployment process...",
    "[00:00:03] Connecting to AWS EC2...",
    "[00:00:05] Creating instance t3.medium in us-east-1...",
  ]);

  const completedSteps = steps.filter(s => s.status === "completed").length;
  const progress = (completedSteps / steps.length) * 100;

  const getStatusIcon = (status: DeploymentStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-chart-2" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-chart-3 animate-spin" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: DeploymentStep["status"]) => {
    const variants: Record<string, any> = {
      completed: "default",
      running: "secondary",
      failed: "destructive",
      pending: "outline",
    };
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Deployment in Progress</h2>
          <p className="text-sm text-muted-foreground">
            Monitor your infrastructure deployment in real-time
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={onValidate}
          data-testid="button-validate"
        >
          Validate Deployment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Server className="h-4 w-4" />
              Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AWS EC2</div>
            <p className="text-sm text-muted-foreground">us-east-1 • t3.medium</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PostgreSQL 14</div>
            <p className="text-sm text-muted-foreground">RDS instance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.toFixed(0)}%</div>
            <p className="text-sm text-muted-foreground">{completedSteps} of {steps.length} complete</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                data-testid={`step-${step.id}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(step.status)}
                  <div className="flex-1">
                    <p className="font-medium">{step.name}</p>
                    {step.message && (
                      <p className="text-sm text-muted-foreground">{step.message}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(step.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm" data-testid="deployment-logs">
            {logs.map((log, index) => (
              <div key={index} className="text-muted-foreground mb-1">
                {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
