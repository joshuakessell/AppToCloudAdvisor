import { ConfigurationForm } from '../ConfigurationForm';

export default function ConfigurationFormExample() {
  return (
    <div className="p-8">
      <ConfigurationForm onSubmit={(config) => console.log('Config submitted:', config)} />
    </div>
  );
}

