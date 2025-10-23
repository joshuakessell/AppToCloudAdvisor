import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Star, Users, Trophy, BarChart3, Sparkles, Clock, Zap, Target } from "lucide-react";
import { fadeInUp, cardEntrance, tabContent } from "@/lib/animations";

interface Feature {
  name: string;
  description: string;
  category: "matchmaking" | "progression" | "social" | "analytics" | "content";
  difficulty: "easy" | "medium" | "hard";
  impact: "low" | "medium" | "high";
  awsServices: string[];
  benefits: string[];
}

interface ImplementationGuide {
  featureName: string;
  steps: string[];
  awsConfiguration: string;
  codeExample: string;
  estimatedTime: string;
}

interface PriorityRanking {
  quickWins: string[];
  mediumTerm: string[];
  longTerm: string[];
}

interface FeatureSuggestionsDisplayProps {
  suggestions: {
    suggestedFeatures: Feature[];
    implementationGuides: ImplementationGuide[];
    priorityRanking: PriorityRanking;
  };
}

const categoryIcons: Record<string, any> = {
  matchmaking: Users,
  progression: Trophy,
  social: Sparkles,
  analytics: BarChart3,
  content: Star,
};

const categoryLabels: Record<string, string> = {
  matchmaking: "Matchmaking",
  progression: "Player Progression",
  social: "Social Features",
  analytics: "Analytics & Insights",
  content: "Content & UGC",
};

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const impactColors: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  medium: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  high: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
};

export function FeatureSuggestionsDisplay({ suggestions }: FeatureSuggestionsDisplayProps) {
  const groupedFeatures = suggestions.suggestedFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  return (
    <div className="space-y-6">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold mb-2" data-testid="text-feature-suggestions-title">
          Suggested Multiplayer Features
        </h2>
        <p className="text-muted-foreground">
          Enhance your game with these AWS-powered multiplayer features
        </p>
      </motion.div>

      {/* Priority Roadmap */}
      <motion.div variants={cardEntrance} initial="hidden" animate="visible">
        <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Implementation Roadmap
          </CardTitle>
          <CardDescription>
            Recommended order of implementation for maximum impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Quick Wins */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-green-500" />
                <h4 className="font-semibold text-sm">Quick Wins (Start Here)</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.priorityRanking.quickWins?.map((feature, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                    data-testid={`priority-quick-win-${idx}`}
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medium Term */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <h4 className="font-semibold text-sm">Medium-Term Goals</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.priorityRanking.mediumTerm?.map((feature, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                    data-testid={`priority-medium-${idx}`}
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Long Term */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-purple-500" />
                <h4 className="font-semibold text-sm">Long-Term Enhancements</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.priorityRanking.longTerm?.map((feature, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
                    data-testid={`priority-long-${idx}`}
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Feature Categories */}
      <Tabs defaultValue={Object.keys(groupedFeatures)[0]} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          {Object.keys(groupedFeatures).map((category) => {
            const Icon = categoryIcons[category] || Star;
            return (
              <TabsTrigger
                key={category}
                value={category}
                className="gap-2"
                data-testid={`tab-category-${category}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{categoryLabels[category]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(groupedFeatures).map(([category, features]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {features.map((feature, idx) => {
              const implementationGuide = suggestions.implementationGuides.find(
                (guide) => guide.featureName === feature.name
              );

              return (
                <Card key={idx} data-testid={`feature-card-${category}-${idx}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-lg">{feature.name}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge
                          variant="outline"
                          className={difficultyColors[feature.difficulty]}
                        >
                          {feature.difficulty}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={impactColors[feature.impact]}
                        >
                          {feature.impact} impact
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* AWS Services */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">AWS Services Used:</h4>
                      <div className="flex flex-wrap gap-2">
                        {feature.awsServices.map((service, serviceIdx) => (
                          <Badge key={serviceIdx} variant="secondary">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Player Benefits:</h4>
                      <ul className="space-y-1">
                        {feature.benefits.map((benefit, benefitIdx) => (
                          <li key={benefitIdx} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Implementation Guide */}
                    {implementationGuide && (
                      <Accordion type="single" collapsible>
                        <AccordionItem value="implementation" className="border-none">
                          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                            View Implementation Guide
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-4">
                            {/* Steps */}
                            <div>
                              <h5 className="text-sm font-semibold mb-2">Implementation Steps:</h5>
                              <ol className="list-decimal list-inside space-y-1">
                                {implementationGuide.steps.map((step, stepIdx) => (
                                  <li key={stepIdx} className="text-sm text-muted-foreground">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {/* AWS Configuration */}
                            <div>
                              <h5 className="text-sm font-semibold mb-2">AWS Configuration:</h5>
                              <p className="text-sm text-muted-foreground">
                                {implementationGuide.awsConfiguration}
                              </p>
                            </div>

                            {/* Code Example */}
                            {implementationGuide.codeExample && (
                              <div>
                                <h5 className="text-sm font-semibold mb-2">Code Example:</h5>
                                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                                  <code>{implementationGuide.codeExample}</code>
                                </pre>
                              </div>
                            )}

                            {/* Estimated Time */}
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Estimated time: <strong>{implementationGuide.estimatedTime}</strong>
                              </span>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
