import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Cloud, CloudCog, Cloudy, ChevronRight, ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: string;
  type: "text" | "select" | "radio" | "checkbox" | "textarea" | "number" | "provider";
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface DynamicQuestionnaireProps {
  questions: Question[];
  onSubmit: (answers: Record<string, any>) => void;
}

export function DynamicQuestionnaire({ questions, onSubmit }: DynamicQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onSubmit(answers);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isAnswered = () => {
    const answer = answers[currentQuestion.id];
    if (!currentQuestion.required) return true;
    if (currentQuestion.type === "checkbox") return answer && answer.length > 0;
    return answer !== undefined && answer !== "";
  };

  const renderQuestion = (question: Question) => {
    const value = answers[question.id] || "";

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
            rows={4}
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
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} />
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
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentQuestion.label}
            {currentQuestion.required && <span className="text-destructive ml-1">*</span>}
          </CardTitle>
          {currentQuestion.description && (
            <CardDescription>{currentQuestion.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {renderQuestion(currentQuestion)}

          <div className="flex gap-3 pt-4">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                data-testid="button-previous"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!isAnswered()}
              className="flex-1"
              data-testid="button-next"
            >
              {currentStep === questions.length - 1 ? "Generate Playbook" : "Next"}
              {currentStep < questions.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentStep(index)}
                className={`p-3 rounded-lg border text-sm text-left hover-elevate transition-colors ${
                  index === currentStep
                    ? "border-primary bg-primary/10"
                    : answers[q.id] !== undefined && answers[q.id] !== ""
                    ? "border-chart-2 bg-chart-2/10"
                    : "border-border"
                }`}
                data-testid={`step-${index}`}
              >
                <div className="font-medium">Step {index + 1}</div>
                <div className="text-xs text-muted-foreground truncate">{q.label}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
