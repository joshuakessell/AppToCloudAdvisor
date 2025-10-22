import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, CloudCog, Cloudy } from "lucide-react";

interface ConfigurationFormProps {
  onSubmit: (config: any) => void;
}

export function ConfigurationForm({ onSubmit }: ConfigurationFormProps) {
  const [provider, setProvider] = useState("");
  const [region, setRegion] = useState("");
  const [instanceType, setInstanceType] = useState("");
  const [projectName, setProjectName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ provider, region, instanceType, projectName });
  };


  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Deployment Configuration</CardTitle>
          <CardDescription>
            Configure your cloud deployment parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="my-application"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                data-testid="input-project-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Cloud Provider</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "aws", label: "AWS", Icon: Cloud },
                  { value: "gcp", label: "GCP", Icon: CloudCog },
                  { value: "azure", label: "Azure", Icon: Cloudy },
                ].map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setProvider(value)}
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg hover-elevate active-elevate-2 transition-colors ${
                      provider === value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                    data-testid={`button-provider-${value}`}
                  >
                    <Icon className="h-8 w-8" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger id="region" data-testid="select-region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                  <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instance-type">Instance Type</Label>
              <Select value={instanceType} onValueChange={setInstanceType}>
                <SelectTrigger id="instance-type" data-testid="select-instance-type">
                  <SelectValue placeholder="Select instance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="t3.small">t3.small (2 vCPU, 2GB RAM)</SelectItem>
                  <SelectItem value="t3.medium">t3.medium (2 vCPU, 4GB RAM)</SelectItem>
                  <SelectItem value="t3.large">t3.large (2 vCPU, 8GB RAM)</SelectItem>
                  <SelectItem value="t3.xlarge">t3.xlarge (4 vCPU, 16GB RAM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" data-testid="button-generate-playbook">
                Generate Playbook
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
