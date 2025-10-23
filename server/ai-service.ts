import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export interface ValidationResult {
  isValid: boolean;
  issues: Array<{
    severity: "error" | "warning";
    message: string;
  }>;
}

export interface Question {
  id: string;
  type: "text" | "select" | "radio" | "checkbox" | "textarea" | "number" | "provider";
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export async function validateDocument(content: string, documentName: string): Promise<ValidationResult> {
  const prompt = `You are an expert DevOps engineer analyzing installation documentation. Your goal is to determine if a document contains enough information to create a basic Ansible playbook.

Document: ${documentName}
Content:
${content.substring(0, 15000)} ${content.length > 15000 ? '...[truncated]' : ''}

Validation Criteria (be LENIENT - mark as valid if it has the basics):

MUST HAVE (mark as error if missing):
- At least 3-5 installation steps or commands (e.g., apt install, systemctl, configuration)
- Indication of what software/service is being installed
- Some form of system context (Linux, Ubuntu, CentOS, etc.)

NICE TO HAVE (mark as warning if missing, but still valid):
- Detailed system requirements (RAM, disk, etc.)
- Port numbers or networking details
- Specific version numbers
- Advanced configuration options

Mark as INVALID (isValid: false) ONLY if:
- Document is pure marketing content with no installation steps
- Document is just a features list or FAQ
- Document contains no actual commands or procedures

Return a JSON object with:
{
  "isValid": boolean,
  "issues": [
    {
      "severity": "error" | "warning",
      "message": "Explanation"
    }
  ]
}

If the document has installation commands and basic setup steps, mark it as valid even if it's not perfect. We can generate a basic playbook from basic installation guides.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_completion_tokens: 2000,
  });

  const result = JSON.parse(completion.choices[0].message.content || "{}");
  return result as ValidationResult;
}

export async function generateQuestionnaire(content: string, documentName: string): Promise<Question[]> {
  const prompt = `You are an expert DevOps engineer. Analyze this installation documentation and generate a questionnaire to collect the necessary deployment parameters.

Document: ${documentName}
Content:
${content.substring(0, 15000)} ${content.length > 15000 ? '...[truncated]' : ''}

Generate a questionnaire with questions needed to create an Ansible playbook. Extract requirements from the document (e.g., if PostgreSQL 14 is mentioned, ask how to provision it).

Always include these base questions:
1. Cloud provider selection (AWS/GCP/Azure)
2. Deployment region
3. Initial instance count
4. Auto-scaling preference

Then add document-specific questions based on:
- Database requirements (if mentioned)
- Application server configuration
- Optional features (monitoring, backups, SSL)
- Custom parameters from the documentation

Return a JSON object with a "questions" array:
{
  "questions": [
    {
      "id": "unique_id",
      "type": "provider" | "select" | "radio" | "checkbox" | "text" | "number" | "textarea",
      "label": "Question text",
      "description": "Optional helpful description",
      "required": true/false,
      "options": ["option1", "option2"],  // for select, radio, checkbox
      "placeholder": "placeholder text"   // for text inputs
    }
  ]
}

Question type guide:
- provider: for cloud provider selection (AWS/GCP/Azure)
- select: single choice from dropdown
- radio: single choice with visible options
- checkbox: multiple selections
- number: numeric input
- text: short text
- textarea: longer text input`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_completion_tokens: 4000,
  });

  const result = JSON.parse(completion.choices[0].message.content || "{}");
  
  // Handle both array and object responses
  if (Array.isArray(result)) {
    return result as Question[];
  }
  
  return result.questions || [];
}

export async function generatePlaybook(
  content: string,
  answers: Record<string, any>,
  documentName: string
): Promise<string> {
  const prompt = `You are an expert DevOps engineer. Generate a complete, production-ready Ansible playbook based on the installation documentation and user's deployment preferences.

Installation Documentation: ${documentName}
Content:
${content.substring(0, 12000)} ${content.length > 12000 ? '...[truncated]' : ''}

Deployment Configuration:
${JSON.stringify(answers, null, 2)}

Generate a complete Ansible playbook that:
1. Follows Ansible best practices and YAML syntax
2. Implements all installation steps from the documentation
3. Incorporates the user's deployment preferences (cloud provider, scaling, features)
4. Includes proper error handling and idempotency
5. Is cloud-provider appropriate (use appropriate package managers, paths, etc.)
6. Includes comments explaining each section

The playbook should be ready to execute and create a working deployment.

Return ONLY the Ansible YAML playbook content, no additional explanation.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 8000,
  });

  return completion.choices[0].message.content || "";
}
