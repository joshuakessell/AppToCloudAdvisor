import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Cloud, Zap, DollarSign, Workflow, Server, Package, Globe } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface AWSService {
  service: string;
  purpose: string;
  priority: "essential" | "recommended" | "optional";
}

interface MigrationPathwayVisualizationProps {
  migrationPlan: {
    recommendedPath: string;
    pathReasoning: string;
    awsServicesBreakdown: {
      core: AWSService[];
      backend: AWSService[];
      enhancement: AWSService[];
    };
    costEstimates?: {
      initial: string;
      monthly: string;
      savings?: string[];
    };
  };
}

const pathIcons: Record<string, any> = {
  anywhere: Globe,
  managed_ec2: Server,
  managed_containers: Package,
  realtime: Zap,
  fleetiq: Cloud,
};

const pathLabels: Record<string, string> = {
  anywhere: "GameLift Anywhere",
  managed_ec2: "Managed EC2 Fleets",
  managed_containers: "Managed Container Fleets",
  realtime: "Realtime Servers",
  fleetiq: "FleetIQ",
};

const pathDescriptions: Record<string, string> = {
  anywhere: "Hybrid approach - Start local, scale to cloud",
  managed_ec2: "Full cloud production with managed EC2 instances",
  managed_containers: "Containerized servers with Docker support",
  realtime: "Lightweight JavaScript-based servers",
  fleetiq: "Cost-optimized with self-managed infrastructure",
};

const priorityColors: Record<string, string> = {
  essential: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  recommended: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  optional: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

export function MigrationPathwayVisualization({ migrationPlan }: MigrationPathwayVisualizationProps) {
  const PathIcon = pathIcons[migrationPlan.recommendedPath] || Cloud;
  const pathLabel = pathLabels[migrationPlan.recommendedPath] || migrationPlan.recommendedPath;
  const pathDescription = pathDescriptions[migrationPlan.recommendedPath] || "";

  return (
    <div className="space-y-6">
      {/* Recommended Path Header */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <CardTitle data-testid="text-recommended-path">Recommended Path: {pathLabel}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {pathDescription}
              </CardDescription>
            </div>
            <PathIcon className="h-12 w-12 text-primary opacity-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed" data-testid="text-path-reasoning">
              {migrationPlan.pathReasoning}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AWS Services Breakdown */}
      <div>
        <h3 className="text-xl font-semibold mb-4">AWS Services for Your Game</h3>
        <Accordion type="multiple" defaultValue={["core", "backend"]} className="space-y-4">
          {/* Core Services */}
          <AccordionItem value="core">
            <Card>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-semibold">Core GameLift Services</div>
                    <div className="text-sm text-muted-foreground">
                      Essential infrastructure for multiplayer hosting
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {migrationPlan.awsServicesBreakdown.core?.length || 0} services
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {migrationPlan.awsServicesBreakdown.core?.map((service, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                        data-testid={`service-core-${idx}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{service.service}</span>
                            <Badge
                              variant="outline"
                              className={priorityColors[service.priority]}
                            >
                              {service.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{service.purpose}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Backend Services */}
          <AccordionItem value="backend">
            <Card>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Workflow className="h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-semibold">Backend & Data Services</div>
                    <div className="text-sm text-muted-foreground">
                      Player data, matchmaking, and backend logic
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {migrationPlan.awsServicesBreakdown.backend?.length || 0} services
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {migrationPlan.awsServicesBreakdown.backend?.map((service, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                        data-testid={`service-backend-${idx}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{service.service}</span>
                            <Badge
                              variant="outline"
                              className={priorityColors[service.priority]}
                            >
                              {service.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{service.purpose}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Enhancement Services */}
          {migrationPlan.awsServicesBreakdown.enhancement && migrationPlan.awsServicesBreakdown.enhancement.length > 0 && (
            <AccordionItem value="enhancement">
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <div className="text-left">
                      <div className="font-semibold">Enhancement Services</div>
                      <div className="text-sm text-muted-foreground">
                        Analytics, monitoring, and optimization
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {migrationPlan.awsServicesBreakdown.enhancement?.length || 0} services
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {migrationPlan.awsServicesBreakdown.enhancement?.map((service, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                          data-testid={`service-enhancement-${idx}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{service.service}</span>
                              <Badge
                                variant="outline"
                                className={priorityColors[service.priority]}
                              >
                                {service.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{service.purpose}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </AccordionContent>
            </Card>
          </AccordionItem>
          )}
        </Accordion>
      </div>

      {/* Cost Estimates */}
      {migrationPlan.costEstimates && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <CardTitle>Estimated Costs</CardTitle>
            </div>
            <CardDescription>
              Approximate costs for your recommended setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Initial Setup</div>
                <div className="text-2xl font-bold" data-testid="text-initial-cost">
                  {migrationPlan.costEstimates.initial}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Monthly Operational</div>
                <div className="text-2xl font-bold" data-testid="text-monthly-cost">
                  {migrationPlan.costEstimates.monthly}
                </div>
              </div>
            </div>

            {migrationPlan.costEstimates.savings && migrationPlan.costEstimates.savings.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Cost Optimization Tips:</h4>
                <ul className="space-y-1">
                  {migrationPlan.costEstimates.savings.map((tip, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
