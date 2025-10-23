import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Server, Globe } from "lucide-react";

interface CostSimulatorProps {
  resourcePlanId: string;
  defaultInstanceType: string;
  onCalculate?: (params: CostParameters) => void;
}

interface CostParameters {
  concurrentPlayers: number;
  sessionDurationHours: number;
  regions: string[];
  instanceType: string;
}

const AVAILABLE_REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "EU (Ireland)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
];

const INSTANCE_TYPES = [
  { value: "c5.large", label: "c5.large (2 vCPU, 4 GB)" },
  { value: "c5.xlarge", label: "c5.xlarge (4 vCPU, 8 GB)" },
  { value: "c5.2xlarge", label: "c5.2xlarge (8 vCPU, 16 GB)" },
  { value: "c6g.large", label: "c6g.large (2 vCPU, 4 GB) - ARM" },
  { value: "c6g.xlarge", label: "c6g.xlarge (4 vCPU, 8 GB) - ARM" },
];

export function GameLiftCostSimulator({ resourcePlanId, defaultInstanceType, onCalculate }: CostSimulatorProps) {
  const [concurrentPlayers, setConcurrentPlayers] = useState(1000);
  const [sessionDuration, setSessionDuration] = useState(2);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["us-east-1"]);
  const [instanceType, setInstanceType] = useState(defaultInstanceType || "c5.large");
  const [isCalculating, setIsCalculating] = useState(false);

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    const params: CostParameters = {
      concurrentPlayers,
      sessionDurationHours: sessionDuration,
      regions: selectedRegions,
      instanceType,
    };
    try {
      await onCalculate?.(params);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2" data-testid="text-simulator-title">Cost Simulator</h2>
        <p className="text-muted-foreground">
          Adjust traffic parameters to estimate GameLift infrastructure costs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Concurrent Players Slider */}
        <Card data-testid="card-concurrent-players">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle>Concurrent Players</CardTitle>
            </div>
            <CardDescription>Peak simultaneous players online</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold" data-testid="text-concurrent-players">
                {concurrentPlayers.toLocaleString()}
              </span>
              <Badge variant="secondary">players</Badge>
            </div>
            <Slider
              value={[concurrentPlayers]}
              onValueChange={(values) => setConcurrentPlayers(values[0])}
              min={100}
              max={10000}
              step={100}
              data-testid="slider-concurrent-players"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100</span>
              <span>10,000</span>
            </div>
          </CardContent>
        </Card>

        {/* Session Duration Slider */}
        <Card data-testid="card-session-duration">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Session Duration</CardTitle>
            </div>
            <CardDescription>Average gameplay session length</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold" data-testid="text-session-duration">
                {sessionDuration}
              </span>
              <Badge variant="secondary">hours</Badge>
            </div>
            <Slider
              value={[sessionDuration]}
              onValueChange={(values) => setSessionDuration(values[0])}
              min={1}
              max={8}
              step={0.5}
              data-testid="slider-session-duration"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1h</span>
              <span>8h</span>
            </div>
          </CardContent>
        </Card>

        {/* Instance Type Selector */}
        <Card data-testid="card-instance-type">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle>Instance Type</CardTitle>
            </div>
            <CardDescription>EC2 instance specification</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={instanceType} onValueChange={setInstanceType}>
              <SelectTrigger data-testid="select-instance-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSTANCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} data-testid={`option-instance-${type.value}`}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Region Selector */}
        <Card data-testid="card-regions">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Deployment Regions</CardTitle>
            </div>
            <CardDescription>Select one or more AWS regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {AVAILABLE_REGIONS.map((region) => (
                <button
                  key={region.value}
                  onClick={() => toggleRegion(region.value)}
                  className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                    selectedRegions.includes(region.value)
                      ? "border-primary bg-primary/10"
                      : "border-border hover-elevate"
                  }`}
                  data-testid={`button-region-${region.value}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{region.label}</span>
                    {selectedRegions.includes(region.value) && (
                      <Badge variant="default" className="ml-2">Selected</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Summary Card */}
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Estimated Costs</CardTitle>
          </div>
          <CardDescription>Based on your traffic simulation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Configuration</p>
                <p className="font-mono text-sm">
                  {concurrentPlayers.toLocaleString()} players × {sessionDuration}h
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Infrastructure</p>
                <p className="font-mono text-sm">
                  {instanceType} × {selectedRegions.length} region{selectedRegions.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full"
              onClick={handleCalculate}
              disabled={isCalculating || selectedRegions.length === 0}
              data-testid="button-calculate-costs"
            >
              {isCalculating ? "Calculating..." : "Calculate Detailed Costs"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
