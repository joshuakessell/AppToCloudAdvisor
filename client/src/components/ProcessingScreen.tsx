import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ProcessingStep {
  id: string;
  message: string;
  status: "pending" | "processing" | "complete";
}

interface ProcessingScreenProps {
  steps: ProcessingStep[];
  onComplete?: () => void;
}

export function ProcessingScreen({ steps, onComplete }: ProcessingScreenProps) {
  const [visibleSteps, setVisibleSteps] = useState<ProcessingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      
      if (currentStep.status === "processing" && !isTyping) {
        setIsTyping(true);
        setDisplayedText("");
        
        let charIndex = 0;
        const typingInterval = setInterval(() => {
          if (charIndex < currentStep.message.length) {
            setDisplayedText(currentStep.message.slice(0, charIndex + 1));
            charIndex++;
          } else {
            clearInterval(typingInterval);
            setIsTyping(false);
          }
        }, 30);

        setVisibleSteps(prev => {
          const existing = prev.find(s => s.id === currentStep.id);
          if (!existing) {
            return [...prev, currentStep];
          }
          return prev;
        });

        return () => clearInterval(typingInterval);
      } else if (currentStep.status === "complete" && !isTyping) {
        setDisplayedText(currentStep.message);
        setVisibleSteps(prev => 
          prev.map(s => s.id === currentStep.id ? currentStep : s)
        );
        
        setTimeout(() => {
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
          } else if (onComplete) {
            setTimeout(onComplete, 500);
          }
        }, 800);
      }
    }
  }, [currentStepIndex, steps, isTyping, onComplete]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="icon-scanning" />
            
            <div className="w-full max-w-xl space-y-4">
              <h3 className="text-lg font-semibold mb-4">Processing Documentation</h3>
              
              <div className="space-y-3 text-left">
                {visibleSteps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className="flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
                    data-testid={`processing-step-${step.id}`}
                  >
                    {step.status === "complete" ? (
                      <CheckCircle2 className="h-5 w-5 text-chart-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-primary mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm text-muted-foreground flex-1">
                      {index === currentStepIndex ? displayedText : step.message}
                      {index === currentStepIndex && isTyping && (
                        <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse" />
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
