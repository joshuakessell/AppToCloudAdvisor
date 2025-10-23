import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Cloud, CloudCog, Cloudy, HelpCircle, RotateCcw, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  type: "text" | "select" | "radio" | "checkbox" | "textarea" | "number" | "provider";
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  examples?: string[];
}

interface ConfigurationScreenProps {
  questions: Question[];
  projectId: string;
  onSubmit: (answers: Record<string, any>) => void;
}

export function ConfigurationScreen({ questions, projectId, onSubmit }: ConfigurationScreenProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [previousAnswers, setPreviousAnswers] = useState<Record<string, any>>({});
  const [autoCompletedFields, setAutoCompletedFields] = useState<Set<string>>(new Set());
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [confusedModalOpen, setConfusedModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [currentHelpQuestion, setCurrentHelpQuestion] = useState<Question | null>(null);
  const [userExplanation, setUserExplanation] = useState("");
  const [isAutoCompleting, setIsAutoCompleting] = useState(false);
  const { toast } = useToast();

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: value };
      setPreviousAnswers(prevPrev => ({ ...prevPrev, [questionId]: prev[questionId] }));
      return newAnswers;
    });
  };

  const handleRevert = (questionId: string) => {
    if (previousAnswers[questionId] !== undefined) {
      setAnswers(prev => ({ ...prev, [questionId]: previousAnswers[questionId] }));
      setAutoCompletedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const openHelpModal = (question: Question) => {
    setCurrentHelpQuestion(question);
    setHelpModalOpen(true);
  };

  const handleStillConfused = () => {
    setHelpModalOpen(false);
    setConfusedModalOpen(true);
  };

  const handleAiAutoComplete = async () => {
    setConfusedModalOpen(false);
    setIsAutoCompleting(true);

    try {
      const result = await apiRequest("POST", `/api/projects/${projectId}/autocomplete`, {
        explanation: userExplanation,
        questions: questions.map(q => ({
          id: q.id,
          label: q.label,
          description: q.description,
          type: q.type,
          options: q.options,
        })),
        currentAnswers: answers,
      });

      const newAnswers = { ...answers };
      const newAutoCompleted = new Set(autoCompletedFields);

      Object.entries(result.answers).forEach(([questionId, value]) => {
        if (answers[questionId] !== undefined && answers[questionId] !== "") {
          setPreviousAnswers(prev => ({ ...prev, [questionId]: answers[questionId] }));
        }
        newAnswers[questionId] = value;
        newAutoCompleted.add(questionId);
      });

      setAnswers(newAnswers);
      setAutoCompletedFields(newAutoCompleted);
      setUserExplanation("");

      toast({
        title: "Configuration Auto-Completed",
        description: "AI has filled in the configuration fields based on your description.",
      });
    } catch (error: any) {
      toast({
        title: "Auto-Complete Failed",
        description: error.message || "Failed to auto-complete configuration",
        variant: "destructive",
      });
    } finally {
      setIsAutoCompleting(false);
    }
  };

  const handleSubmit = () => {
    const missingRequired = questions.filter(q => 
      q.required && (answers[q.id] === undefined || answers[q.id] === "" || (Array.isArray(answers[q.id]) && answers[q.id].length === 0))
    );

    if (missingRequired.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingRequired.map(q => q.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    onSubmit(answers);
  };

  const renderQuestion = (question: Question) => {
    const value = answers[question.id] || "";
    const isAutoCompleted = autoCompletedFields.has(question.id);
    const hasPreviousValue = previousAnswers[question.id] !== undefined;

    const questionInput = (() => {
      switch (question.type) {
        case "text":
        case "number":
          return (
            <Input
              type={question.type}
              placeholder={question.placeholder}
              value={value}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              data-testid={`input-${question.id}`}
            />
          );

        case "textarea":
          return (
            <Textarea
              placeholder={question.placeholder}
              value={value}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              rows={3}
              data-testid={`textarea-${question.id}`}
            />
          );

        case "select":
          return (
            <Select value={value} onValueChange={(val) => handleAnswer(question.id, val)}>
              <SelectTrigger data-testid={`select-${question.id}`}>
                <SelectValue placeholder={question.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case "radio":
          return (
            <RadioGroup value={value} onValueChange={(val) => handleAnswer(question.id, val)}>
              <div className="space-y-3">
                {question.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-${option}`} data-testid={`radio-${question.id}-${option}`} />
                    <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          );

        case "checkbox":
          return (
            <div className="space-y-3">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${option}`}
                    checked={value?.includes(option) || false}
                    onCheckedChange={(checked) => {
                      const current = value || [];
                      const updated = checked
                        ? [...current, option]
                        : current.filter((v: string) => v !== option);
                      handleAnswer(question.id, updated);
                    }}
                    data-testid={`checkbox-${question.id}-${option}`}
                  />
                  <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          );

        case "provider":
          return (
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "aws", label: "AWS", Icon: Cloud },
                { value: "gcp", label: "GCP", Icon: CloudCog },
                { value: "azure", label: "Azure", Icon: Cloudy },
              ].map(({ value: providerValue, label, Icon }) => (
                <button
                  key={providerValue}
                  type="button"
                  onClick={() => handleAnswer(question.id, providerValue)}
                  className={`flex flex-col items-center gap-2 p-4 border rounded-lg hover-elevate active-elevate-2 transition-colors ${
                    value === providerValue
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                  data-testid={`button-provider-${providerValue}`}
                >
                  <Icon className="h-8 w-8" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          );

        default:
          return null;
      }
    })();

    return (
      <div key={question.id} className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>
              {question.label}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => openHelpModal(question)}
              data-testid={`button-help-${question.id}`}
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          {isAutoCompleted && hasPreviousValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRevert(question.id)}
              className="h-7 text-xs"
              data-testid={`button-revert-${question.id}`}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Revert
            </Button>
          )}
        </div>
        {question.description && (
          <p className="text-sm text-muted-foreground">{question.description}</p>
        )}
        {questionInput}
      </div>
    );
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Configuration Options</h2>
          <p className="text-muted-foreground">
            Fill in the details below to customize your deployment. Click the help icon next to any field for more information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Deployment Configuration</CardTitle>
            <CardDescription>
              Provide the necessary details to generate your Ansible playbook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map(question => renderQuestion(question))}

            <div className="flex gap-3 pt-6 border-t">
              <Button
                onClick={handleSubmit}
                className="flex-1"
                data-testid="button-generate-playbook"
              >
                Generate Playbook
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent data-testid="dialog-help">
          <DialogHeader>
            <DialogTitle>{currentHelpQuestion?.label}</DialogTitle>
            <DialogDescription>
              {currentHelpQuestion?.helpText || currentHelpQuestion?.description || "Additional information about this field."}
            </DialogDescription>
          </DialogHeader>
          
          {currentHelpQuestion?.examples && currentHelpQuestion.examples.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Example Inputs:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {currentHelpQuestion.examples.map((example, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleStillConfused}
              data-testid="button-still-confused"
            >
              Still Confused?
            </Button>
            <Button onClick={() => setHelpModalOpen(false)} data-testid="button-got-it">
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confusedModalOpen} onOpenChange={setConfusedModalOpen}>
        <DialogContent data-testid="dialog-confused">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Let AI Help You
            </DialogTitle>
            <DialogDescription>
              Describe in your own words how you want to use this application, and AI will automatically fill out all the configuration fields for you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-explanation">Your Description</Label>
              <Textarea
                id="user-explanation"
                placeholder="Example: I want to deploy a web application on AWS with a PostgreSQL database. It should have SSL enabled and run on Ubuntu 22.04..."
                value={userExplanation}
                onChange={(e) => setUserExplanation(e.target.value)}
                rows={6}
                data-testid="textarea-user-explanation"
              />
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> If you had already filled in any fields, they will be overwritten by the AI suggestions. 
                You'll see a "Revert" button next to each changed field if you want to restore your previous input.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfusedModalOpen(false)}
              data-testid="button-cancel-ai"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAiAutoComplete}
              disabled={!userExplanation.trim() || isAutoCompleting}
              data-testid="button-submit-ai"
            >
              {isAutoCompleting ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto-Complete Fields
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
