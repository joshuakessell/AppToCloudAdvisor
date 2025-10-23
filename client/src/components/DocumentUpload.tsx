import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
}

export function DocumentUpload({ onFileSelect }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="file" data-testid="tab-file">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" data-testid="tab-url">
            <LinkIcon className="h-4 w-4 mr-2" />
            From URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-12 transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-border"
            }`}
            data-testid="upload-dropzone"
          >
            <input
              type="file"
              id="file-upload"
              className="sr-only"
              onChange={handleFileChange}
              accept=".pdf,.md,.txt,.doc,.docx"
              data-testid="input-file"
            />
            
            {!selectedFile ? (
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Upload Installation Guide</p>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Drag and drop your installation guide here, or click to browse
                </p>
                <Button variant="outline" data-testid="button-browse">
                  Browse Files
                </Button>
              </label>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium" data-testid="text-filename">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  data-testid="button-clear-file"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">Supported formats:</p>
            <div className="flex flex-wrap gap-2">
              {["PDF", "Markdown", "Text", "Word"].map((format) => (
                <span
                  key={format}
                  className="px-3 py-1 bg-muted rounded-full text-xs font-mono"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="url">
          {!submittedUrl ? (
            <form onSubmit={handleUrlSubmit} className="space-y-6">
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center mb-6">
                  <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Web Documentation URL</p>
                  <p className="text-sm text-muted-foreground">
                    Provide a link to online installation documentation
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-url">Documentation URL</Label>
                  <Input
                    id="doc-url"
                    type="url"
                    placeholder="https://example.com/installation-guide"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    data-testid="input-url"
                    className="font-mono text-sm"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6"
                  disabled={!url.trim()}
                  data-testid="button-submit-url"
                >
                  Analyze Documentation
                </Button>
              </Card>

              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-2">Example sources:</p>
                <div className="flex flex-wrap gap-2">
                  {["GitHub README", "ReadTheDocs", "Official Docs", "Medium Articles"].map((source) => (
                    <span
                      key={source}
                      className="px-3 py-1 bg-muted rounded-full text-xs font-mono"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <Card className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <LinkIcon className="h-10 w-10 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-1">Documentation URL</p>
                    <p className="text-sm text-muted-foreground font-mono truncate" data-testid="text-submitted-url">
                      {submittedUrl}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearUrl}
                  data-testid="button-clear-url"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
