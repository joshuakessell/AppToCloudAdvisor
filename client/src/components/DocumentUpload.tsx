import { useState, useCallback } from "react";
import { Upload, FileText, X, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit?: (url: string) => void;
}

export function DocumentUpload({ onFileSelect, onUrlSubmit }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");

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

  const handleUrlSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      setSubmittedUrl(url);
      onUrlSubmit?.(url);
    }
  }, [url, onUrlSubmit]);

  const handleClearUrl = useCallback(() => {
    setUrl("");
    setSubmittedUrl("");
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
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
    </div>
  );
}
