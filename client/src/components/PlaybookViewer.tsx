import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlaybookViewerProps {
  playbook: string;
  onDeploy: () => void;
}

export function PlaybookViewer({ playbook, onDeploy }: PlaybookViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(playbook);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([playbook], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "playbook.yml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Generated Playbook</h2>
          <p className="text-sm text-muted-foreground">
            Review your Ansible playbook before deployment
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            data-testid="button-copy"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            data-testid="button-download"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={onDeploy} data-testid="button-deploy">
            Deploy to Cloud
          </Button>
        </div>
      </div>

      <Tabs defaultValue="playbook" className="w-full">
        <TabsList>
          <TabsTrigger value="playbook" data-testid="tab-playbook">Playbook</TabsTrigger>
          <TabsTrigger value="readme" data-testid="tab-readme">README</TabsTrigger>
        </TabsList>
        <TabsContent value="playbook">
          <Card>
            <CardContent className="p-0">
              <pre className="p-6 overflow-x-auto text-sm font-mono bg-muted/30 rounded-lg">
                <code>{playbook}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="readme">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Instructions</CardTitle>
              <CardDescription>
                How to use this playbook for deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h3>Prerequisites</h3>
              <ul>
                <li>Ansible 2.9 or higher installed</li>
                <li>Cloud provider credentials configured</li>
                <li>SSH key pair for instance access</li>
              </ul>
              <h3>Running the Playbook</h3>
              <pre className="bg-muted p-4 rounded font-mono text-sm">
                ansible-playbook -i inventory playbook.yml
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
