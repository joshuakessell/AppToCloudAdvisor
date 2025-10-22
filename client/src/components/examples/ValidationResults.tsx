import { ValidationResults } from '../ValidationResults';

export default function ValidationResultsExample() {
  const mockChecks = [
    {
      id: "1",
      name: "HTTP Connectivity",
      status: "passed" as const,
      message: "Successfully connected to application on port 80"
    },
    {
      id: "2",
      name: "HTTPS/SSL Certificate",
      status: "passed" as const,
      message: "SSL certificate is valid and properly configured"
    },
    {
      id: "3",
      name: "Database Connection",
      status: "passed" as const,
      message: "PostgreSQL database is accessible and responding"
    },
    {
      id: "4",
      name: "Application Health",
      status: "warning" as const,
      message: "Application responding but memory usage is at 85%"
    },
    {
      id: "5",
      name: "DNS Resolution",
      status: "passed" as const,
      message: "Domain name resolves correctly to instance IP"
    }
  ];

  return (
    <div className="p-8">
      <ValidationResults 
        checks={mockChecks}
        onFinalize={() => console.log('Finalize clicked')}
        onRetry={() => console.log('Retry clicked')}
      />
    </div>
  );
}
