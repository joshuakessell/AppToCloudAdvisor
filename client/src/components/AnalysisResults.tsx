import { CheckCircle2, Server, Package, Settings, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Requirement {
  category: string;
  items: string[];
}

interface AnalysisResultsProps {
  requirements: Requirement[];
  onContinue: () => void;
}

const categoryIcons: Record<string, any> = {
  "Infrastructure": Server,
  "Dependencies": Package,
  "Configuration": Settings,
  "Database": Database,
};

export function AnalysisResults({ requirements, onContinue }: AnalysisResultsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle2 className="h-6 w-6 text-chart-2" />
        <h2 className="text-2xl font-semibold">Analysis Complete</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {requirements.map((req, index) => {
          const Icon = categoryIcons[req.category] || Settings;
          return (
            <Card key={index} data-testid={`card-requirement-${index}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="h-5 w-5 text-primary" />
                  {req.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {req.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span className="font-mono text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-medium mb-2">Next Steps</h3>
              <p className="text-sm text-muted-foreground">
                We've identified the key requirements from your installation guide.
                Let's configure the deployment parameters to generate your playbook.
              </p>
            </div>
            <Button onClick={onContinue} data-testid="button-continue">
              Configure Deployment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
