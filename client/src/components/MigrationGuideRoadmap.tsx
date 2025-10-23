import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Code, Server, TestTube, Rocket, Clock, BookOpen } from "lucide-react";
import { fadeInUp, tabContent, cardEntrance } from "@/lib/animations";

interface MigrationStep {
  phase: string;
  title: string;
  description: string;
  estimatedTime: string;
  tasks: string[];
}

interface SDKIntegrationGuide {
  serverSDK: {
    language: string;
    steps: string[];
    codeSnippets: string[];
  };
  clientBackend: {
    technology: string;
    steps: string[];
    endpoints: string[];
  };
  testing: {
    approach: string;
    tools: string[];
    steps: string[];
  };
}

interface MigrationGuideRoadmapProps {
  migrationPlan: {
    recommendedPath: string;
    migrationSteps: MigrationStep[];
    sdkIntegrationGuide: SDKIntegrationGuide;
  };
}

const phaseIcons: Record<string, any> = {
  setup: BookOpen,
  development: Code,
  integration: Server,
  testing: TestTube,
  deployment: Rocket,
};

export function MigrationGuideRoadmap({ migrationPlan }: MigrationGuideRoadmapProps) {
  const [activeTab, setActiveTab] = React.useState("roadmap");

  return (
    <div className="space-y-6">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold mb-2" data-testid="text-migration-guide-title">
          Step-by-Step Migration Guide
        </h2>
        <p className="text-muted-foreground">
          Complete roadmap for migrating your game to AWS GameLift
        </p>
      </motion.div>

      <Tabs defaultValue="roadmap" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roadmap" data-testid="tab-roadmap">
            <Rocket className="h-4 w-4 mr-2" />
            Migration Roadmap
          </TabsTrigger>
          <TabsTrigger value="sdk" data-testid="tab-sdk-integration">
            <Code className="h-4 w-4 mr-2" />
            SDK Integration
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Migration Roadmap Tab */}
          {activeTab === "roadmap" && (
            <motion.div
              key="roadmap"
              variants={tabContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <Accordion type="single" collapsible defaultValue="step-0">
            {migrationPlan.migrationSteps.map((step, idx) => {
              const PhaseIcon = phaseIcons[step.phase.toLowerCase()] || CheckCircle2;
              
              return (
                <AccordionItem key={idx} value={`step-${idx}`}>
                  <Card>
                    <AccordionTrigger
                      className="px-6 py-4 hover:no-underline"
                      data-testid={`migration-step-${idx}`}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                          <PhaseIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{step.title}</span>
                            <Badge variant="outline" className="text-xs">
                              Phase {idx + 1}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {step.estimatedTime}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-3 text-sm">Tasks:</h4>
                        <div className="space-y-2">
                          {step.tasks.map((task, taskIdx) => (
                            <div
                              key={taskIdx}
                              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                            >
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{task}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              );
            })}
              </Accordion>
            </motion.div>
          )}

          {/* SDK Integration Tab */}
          {activeTab === "sdk" && (
            <motion.div
              key="sdk"
              variants={tabContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
          {/* Server SDK Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Server SDK Integration ({migrationPlan.sdkIntegrationGuide.serverSDK.language})
              </CardTitle>
              <CardDescription>
                Integrate the GameLift Server SDK into your game server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-sm">Integration Steps:</h4>
                <ol className="list-decimal list-inside space-y-2">
                  {migrationPlan.sdkIntegrationGuide.serverSDK.steps.map((step, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-2">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {migrationPlan.sdkIntegrationGuide.serverSDK.codeSnippets && 
               migrationPlan.sdkIntegrationGuide.serverSDK.codeSnippets.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Code Examples:</h4>
                  <div className="space-y-3">
                    {migrationPlan.sdkIntegrationGuide.serverSDK.codeSnippets.map((snippet, idx) => (
                      <div key={idx}>
                        <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                          <code>{snippet}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Backend Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-500" />
                Client Backend ({migrationPlan.sdkIntegrationGuide.clientBackend.technology})
              </CardTitle>
              <CardDescription>
                Set up backend services to create and manage game sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-sm">Implementation Steps:</h4>
                <ol className="list-decimal list-inside space-y-2">
                  {migrationPlan.sdkIntegrationGuide.clientBackend.steps.map((step, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-2">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {migrationPlan.sdkIntegrationGuide.clientBackend.endpoints && 
               migrationPlan.sdkIntegrationGuide.clientBackend.endpoints.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Required API Endpoints:</h4>
                  <div className="space-y-2">
                    {migrationPlan.sdkIntegrationGuide.clientBackend.endpoints.map((endpoint, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded bg-muted/50"
                      >
                        <Badge variant="secondary" className="font-mono text-xs">
                          {endpoint}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Testing Approach */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-green-500" />
                Testing Strategy
              </CardTitle>
              <CardDescription>
                {migrationPlan.sdkIntegrationGuide.testing.approach}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-sm">Testing Tools:</h4>
                <div className="flex flex-wrap gap-2">
                  {migrationPlan.sdkIntegrationGuide.testing.tools.map((tool, idx) => (
                    <Badge key={idx} variant="outline">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-sm">Testing Steps:</h4>
                <ol className="list-decimal list-inside space-y-2">
                  {migrationPlan.sdkIntegrationGuide.testing.steps.map((step, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground pl-2">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>

      {/* Summary Card */}
      <motion.div variants={cardEntrance} initial="hidden" animate="visible">
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Ready to get started?</strong> Begin with Phase 1 of the migration roadmap above.
            </p>
            <p className="text-muted-foreground">
              For detailed AWS GameLift documentation, visit the{" "}
              <a
                href="https://docs.aws.amazon.com/gamelift/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                AWS GameLift Developer Guide
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
