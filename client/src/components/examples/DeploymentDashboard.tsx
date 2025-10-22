import { DeploymentDashboard } from '../DeploymentDashboard';

export default function DeploymentDashboardExample() {
  return (
    <div className="p-8">
      <DeploymentDashboard onValidate={() => console.log('Validate clicked')} />
    </div>
  );
}
