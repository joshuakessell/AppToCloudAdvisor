import { ValidationScreen } from '../ValidationScreen';

export default function ValidationScreenExample() {
  const mockIssues = [
    {
      severity: "error" as const,
      message: "Document does not contain installation steps or commands. The documentation appears to be a feature overview rather than an installation guide."
    },
    {
      severity: "error" as const,
      message: "No system requirements specified. Unable to determine minimum hardware, operating system, or software prerequisites."
    },
    {
      severity: "warning" as const,
      message: "Configuration details are vague or incomplete. Some optional parameters may not be available in the generated playbook."
    }
  ];

  return (
    <div className="p-8 space-y-12">
      <div>
        <h3 className="text-lg font-semibold mb-4">Analyzing State</h3>
        <ValidationScreen 
          isAnalyzing={true}
          isValid={false}
          documentName="installation-guide.pdf"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Invalid Documentation</h3>
        <ValidationScreen 
          isAnalyzing={false}
          isValid={false}
          documentName="product-overview.md"
          issues={mockIssues}
          onRetry={() => console.log('Retry clicked')}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Valid Documentation</h3>
        <ValidationScreen 
          isAnalyzing={false}
          isValid={true}
          documentName="docker-installation-guide.pdf"
          onContinue={() => console.log('Continue clicked')}
        />
      </div>
    </div>
  );
}
