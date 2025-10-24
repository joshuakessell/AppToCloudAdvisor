import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileSearch, 
  Shield, 
  Gauge, 
  DollarSign, 
  Code, 
  CloudCog,
  Download,
  Play,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { fadeInUp, cardEntrance } from "@/lib/animations";
import { useState } from "react";

interface ResultsPageProps {
  gameId: string;
  gameName: string;
  comprehensiveAnalysis: any;
  onRunScan: (scanType: string) => Promise<void>;
  additionalScans?: any[];
  onExport: () => void;
}

const AVAILABLE_SCANS = [
  {
    id: "cost_optimization",
    title: "Cost Optimization",
    description: "Analyze potential cost savings, beta testing modes, and alternative testing platforms",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
  {
    id: "security",
    title: "Security Analysis",
    description: "Scan for vulnerabilities, auth patterns, and security best practices",
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20"
  },
  {
    id: "performance",
    title: "Performance Assessment",
    description: "Identify bottlenecks, asset optimization opportunities, and scalability issues",
    icon: Gauge,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    id: "code_quality",
    title: "Code Quality",
    description: "Static analysis, complexity metrics, and technical debt assessment",
    icon: Code,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    id: "devops_readiness",
    title: "DevOps Readiness",
    description: "CI/CD maturity, infrastructure as code, monitoring and observability setup",
    icon: CloudCog,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  }
];

export function ResultsPage({ 
  gameId, 
  gameName, 
  comprehensiveAnalysis,
  onRunScan,
  additionalScans = [],
  onExport
}: ResultsPageProps) {
  const [runningScan, setRunningScan] = useState<string | null>(null);

  const handleRunScan = async (scanType: string) => {
    setRunningScan(scanType);
    try {
      await onRunScan(scanType);
    } finally {
      setRunningScan(null);
    }
  };

  const getScanStatus = (scanId: string) => {
    const scan = additionalScans.find(s => s.scanType === scanId);
    return scan?.status || null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-results-title">
            Analysis Results: {gameName}
          </h1>
          <p className="text-muted-foreground">
            Comprehensive migration analysis and additional scan options
          </p>
        </div>
        <Button 
          onClick={onExport} 
          variant="outline"
          data-testid="button-export-results"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>
      </motion.div>

      {/* 3-Section Accordion */}
      <Accordion type="single" collapsible defaultValue="section-1" className="space-y-4">
        {/* Section 1: Initial Results */}
        <AccordionItem value="section-1">
          <motion.div variants={cardEntrance} initial="hidden" animate="visible">
            <Card>
              <AccordionTrigger 
                className="px-6 py-4 hover:no-underline"
                data-testid="accordion-trigger-initial-results"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                    <FileSearch className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Initial Analysis Results</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive game analysis and AWS readiness assessment
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-4 space-y-6">
                  {/* AWS Readiness Score */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <h4 className="font-semibold mb-1">AWS GameLift Readiness Score</h4>
                      <p className="text-sm text-muted-foreground">
                        {comprehensiveAnalysis.awsReadiness.reasoning}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary">
                        {comprehensiveAnalysis.awsReadiness.readinessScore}/10
                      </div>
                    </div>
                  </div>

                  {/* Game Type & Architecture */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">Game Type</h4>
                      <p className="text-sm text-muted-foreground">{comprehensiveAnalysis.gameType}</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">Architecture</h4>
                      <p className="text-sm text-muted-foreground">{comprehensiveAnalysis.architecture}</p>
                    </div>
                  </div>

                  {/* Languages & Technologies */}
                  <div>
                    <h4 className="font-semibold mb-3">Languages & Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {comprehensiveAnalysis.languagesUsed.map((lang: string, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Existing Multiplayer Features */}
                  {comprehensiveAnalysis.existingMultiplayerFeatures?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Existing Multiplayer Features</h4>
                      <div className="space-y-2">
                        {comprehensiveAnalysis.existingMultiplayerFeatures.map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </AccordionContent>
            </Card>
          </motion.div>
        </AccordionItem>

        {/* Section 2: Additional Scans */}
        <AccordionItem value="section-2">
          <motion.div variants={cardEntrance} initial="hidden" animate="visible">
            <Card>
              <AccordionTrigger 
                className="px-6 py-4 hover:no-underline"
                data-testid="accordion-trigger-additional-scans"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-500/10">
                    <Gauge className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">Additional Scans</h3>
                    <p className="text-sm text-muted-foreground">
                      Run deeper analysis to improve your migration readiness
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AVAILABLE_SCANS.map((scan) => {
                      const status = getScanStatus(scan.id);
                      const Icon = scan.icon;
                      const isRunning = runningScan === scan.id;

                      return (
                        <Card 
                          key={scan.id} 
                          className={`${scan.borderColor} ${status === 'completed' ? scan.bgColor : ''}`}
                          data-testid={`scan-card-${scan.id}`}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${scan.bgColor}`}>
                                  <Icon className={`h-5 w-5 ${scan.color}`} />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{scan.title}</CardTitle>
                                  {status && (
                                    <div className="flex items-center gap-2 mt-1">
                                      {status === 'completed' && (
                                        <Badge variant="default" className="text-xs">
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Complete
                                        </Badge>
                                      )}
                                      {status === 'running' && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Clock className="h-3 w-3 mr-1" />
                                          Running...
                                        </Badge>
                                      )}
                                      {status === 'failed' && (
                                        <Badge variant="destructive" className="text-xs">
                                          <XCircle className="h-3 w-3 mr-1" />
                                          Failed
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="mb-4">
                              {scan.description}
                            </CardDescription>
                            <Button
                              onClick={() => handleRunScan(scan.id)}
                              disabled={isRunning || status === 'running' || status === 'completed'}
                              size="sm"
                              variant={status === 'completed' ? 'secondary' : 'default'}
                              className="w-full"
                              data-testid={`button-run-scan-${scan.id}`}
                            >
                              {isRunning || status === 'running' ? (
                                <>
                                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                                  Running...
                                </>
                              ) : status === 'completed' ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  View Results
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Run Scan
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </motion.div>
        </AccordionItem>

        {/* Section 3: AWS Setup Wizard (Placeholder) */}
        <AccordionItem value="section-3">
          <motion.div variants={cardEntrance} initial="hidden" animate="visible">
            <Card className="border-dashed">
              <AccordionTrigger 
                className="px-6 py-4 hover:no-underline"
                data-testid="accordion-trigger-aws-setup"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-500/10">
                    <CloudCog className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">AWS Setup Wizard</h3>
                    <p className="text-sm text-muted-foreground">
                      Authenticate and configure AWS resources (Coming Soon)
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-4">
                  <div className="text-center py-12">
                    <CloudCog className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h4 className="font-semibold mb-2">AWS Integration Coming Soon</h4>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Once implemented, this section will allow you to authenticate with AWS, 
                      generate CloudFormation/Terraform templates, and automatically provision 
                      the recommended services.
                    </p>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </motion.div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
