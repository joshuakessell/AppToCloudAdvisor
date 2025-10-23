import { DynamicQuestionnaire } from '../DynamicQuestionnaire';

export default function DynamicQuestionnaireExample() {
  const mockQuestions = [
    {
      id: "cloud_provider",
      type: "provider" as const,
      label: "Select Cloud Provider",
      description: "Choose your preferred cloud infrastructure platform",
      required: true
    },
    {
      id: "deployment_region",
      type: "select" as const,
      label: "Deployment Region",
      description: "Select the geographic region for your deployment",
      required: true,
      options: ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"]
    },
    {
      id: "instance_count",
      type: "number" as const,
      label: "Number of Instances",
      description: "How many instances should be provisioned initially?",
      required: true,
      placeholder: "e.g., 2"
    },
    {
      id: "auto_scaling",
      type: "radio" as const,
      label: "Enable Auto-Scaling",
      description: "Should the infrastructure automatically scale based on demand?",
      required: true,
      options: ["Yes, enable auto-scaling", "No, use fixed capacity"]
    },
    {
      id: "features",
      type: "checkbox" as const,
      label: "Optional Features",
      description: "Select additional features to include in your deployment",
      required: false,
      options: [
        "SSL/TLS Certificate (via Let's Encrypt)",
        "Database Backup Automation",
        "Monitoring & Alerts (CloudWatch/Stackdriver)",
        "Log Aggregation"
      ]
    },
    {
      id: "custom_config",
      type: "textarea" as const,
      label: "Custom Configuration",
      description: "Any additional configuration or notes for the playbook",
      required: false,
      placeholder: "Enter any custom configuration parameters..."
    }
  ];

  return (
    <div className="p-8">
      <DynamicQuestionnaire 
        questions={mockQuestions}
        onSubmit={(answers) => console.log('Submitted answers:', answers)}
      />
    </div>
  );
}
