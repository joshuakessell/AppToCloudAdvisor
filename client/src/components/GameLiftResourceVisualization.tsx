import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Gauge, Boxes, Cloud, Database, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FleetConfig {
  fleetType: string;
  instanceType: string;
  minInstances: number;
  maxInstances: number;
  desiredInstances: number;
}

interface ScalingPolicy {
  metric: string;
  targetValue: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
}

interface ResourcePlan {
  id: string;
  gameType: string;
  playerCount: string;
  networkModel: string;
  fleetConfig: FleetConfig;
  scalingPolicies: ScalingPolicy[];
  recommendedRegions: string[];
  auxiliaryServices: string[];
}

interface GameLiftResourceVisualizationProps {
  resourcePlan: ResourcePlan;
  onProceedToSimulator?: () => void;
}

export function GameLiftResourceVisualization({ resourcePlan, onProceedToSimulator }: GameLiftResourceVisualizationProps) {
  const { fleetConfig, scalingPolicies, recommendedRegions, auxiliaryServices } = resourcePlan;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2" data-testid="text-resource-title">GameLift Resource Plan</h2>
        <p className="text-muted-foreground">
          AI-powered recommendations for your game infrastructure
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Fleet Configuration */}
        <Card data-testid="card-fleet-config">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle>Fleet Configuration</CardTitle>
            </div>
            <CardDescription>Compute resources for game servers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Fleet Type</p>
              <Badge variant="outline" className="font-mono" data-testid="badge-fleet-type">
                {fleetConfig.fleetType}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Instance Type</p>
              <Badge variant="default" className="font-mono text-sm" data-testid="badge-instance-type">
                {fleetConfig.instanceType}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Min</p>
                <p className="text-lg font-bold" data-testid="text-min-instances">{fleetConfig.minInstances}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Desired</p>
                <p className="text-lg font-bold" data-testid="text-desired-instances">{fleetConfig.desiredInstances}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Max</p>
                <p className="text-lg font-bold" data-testid="text-max-instances">{fleetConfig.maxInstances}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scaling Policies */}
        <Card data-testid="card-scaling-policies">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              <CardTitle>Auto-Scaling Policies</CardTitle>
            </div>
            <CardDescription>Dynamic capacity adjustments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scalingPolicies && scalingPolicies.length > 0 ? (
              scalingPolicies.map((policy, index) => (
                <div key={index} className="border-l-2 border-primary pl-4" data-testid={`scaling-policy-${index}`}>
                  <p className="font-medium mb-1">{policy.metric}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Target:</span>
                      <span className="ml-2 font-mono">{policy.targetValue}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Scale Up:</span>
                      <span className="ml-2 font-mono">{policy.scaleUpThreshold}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No scaling policies configured</p>
            )}
          </CardContent>
        </Card>

        {/* Recommended Regions */}
        <Card data-testid="card-regions">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              <CardTitle>Recommended Regions</CardTitle>
            </div>
            <CardDescription>Optimal AWS deployment locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recommendedRegions && recommendedRegions.length > 0 ? (
                recommendedRegions.map((region) => (
                  <Badge key={region} variant="secondary" className="font-mono" data-testid={`badge-region-${region}`}>
                    {region}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No regions recommended</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Auxiliary Services */}
        <Card data-testid="card-auxiliary-services">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" />
              <CardTitle>Auxiliary AWS Services</CardTitle>
            </div>
            <CardDescription>Supporting infrastructure components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auxiliaryServices && auxiliaryServices.length > 0 ? (
                auxiliaryServices.map((service) => (
                  <div key={service} className="flex items-center gap-2" data-testid={`auxiliary-service-${service}`}>
                    {service.toLowerCase().includes('s3') && <Database className="h-4 w-4 text-muted-foreground" />}
                    {service.toLowerCase().includes('cloudwatch') && <BarChart3 className="h-4 w-4 text-muted-foreground" />}
                    {!service.toLowerCase().includes('s3') && !service.toLowerCase().includes('cloudwatch') && (
                      <Boxes className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">{service}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No auxiliary services configured</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-6">
        <Button 
          size="lg" 
          onClick={onProceedToSimulator}
          data-testid="button-proceed-to-simulator"
        >
          Calculate Costs & Simulate Traffic
        </Button>
      </div>
    </div>
  );
}
