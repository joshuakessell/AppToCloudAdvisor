import { AnalysisResults } from '../AnalysisResults';

export default function AnalysisResultsExample() {
  const mockRequirements = [
    {
      category: "Infrastructure",
      items: ["Ubuntu 20.04 LTS", "2 CPU cores minimum", "4GB RAM", "20GB storage"]
    },
    {
      category: "Dependencies",
      items: ["Node.js 18.x", "PostgreSQL 14", "Nginx 1.18", "Redis 6.x"]
    },
    {
      category: "Configuration",
      items: ["SSL certificate required", "Port 80, 443 open", "Domain name configured"]
    },
    {
      category: "Database",
      items: ["PostgreSQL user with admin privileges", "Database initialization scripts"]
    }
  ];

  return (
    <div className="p-8">
      <AnalysisResults 
        requirements={mockRequirements}
        onContinue={() => console.log('Continue clicked')}
      />
    </div>
  );
}
