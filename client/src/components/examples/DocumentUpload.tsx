import { DocumentUpload } from '../DocumentUpload';

export default function DocumentUploadExample() {
  return (
    <div className="p-8">
      <DocumentUpload onFileSelect={(file) => console.log('File selected:', file.name)} />
    </div>
  );
}
