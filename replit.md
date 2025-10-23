# CloudForge - Infrastructure Automation Platform

## Overview

CloudForge is an AI-powered infrastructure automation platform that transforms bare-metal installation documentation into cloud deployment playbooks. The platform analyzes installation guides (uploaded files or URLs), validates their completeness, generates dynamic questionnaires to gather deployment parameters, and produces Ansible playbooks for automated deployment on AWS, GCP, and Azure.

The application follows a multi-step workflow: document upload → processing animation → AI validation → configuration screen (with help modals and AI auto-complete) → playbook generation → deployment monitoring → validation checks.

## Current Status (October 23, 2025)

**Fully Implemented:**
- ✅ File upload system with drag-and-drop support (PDF, Markdown, Text, Word)
- ✅ URL-based document fetching with comprehensive SSRF protection
- ✅ OpenAI GPT-5 integration for AI-powered analysis
- ✅ Document validation with detailed error reporting
- ✅ Dynamic questionnaire generation based on document analysis
- ✅ Cloud platform selection as first question (AWS/GCP/Azure/Cloud Agnostic)
- ✅ Ansible playbook generation from user configurations
- ✅ Dark mode DevOps-inspired UI
- ✅ Error handling and loading states throughout
- ✅ Processing screen with animated milestones and typing effects
- ✅ Unified configuration screen with all fields visible at once
- ✅ Help icons with detailed explanations and examples for each field
- ✅ AI-powered auto-complete for configuration fields
- ✅ Soft copy storage with revert functionality for auto-completed fields

**Security Features:**
- Accepts documentation URLs from any public domain
- SSRF attack prevention:
  - Blocks direct IP addresses (IPv4 and IPv6)
  - Blocks localhost and internal domains
  - Blocks private network ranges (10.x, 172.16-31.x, 192.168.x)
  - Blocks cloud metadata endpoints
- Follows redirects safely (fetch API validates redirect chains)
- Protocol restriction (HTTP/HTTPS only)
- Content-type validation (text/HTML documents only)
- Size limits (5MB max)
- 30-second fetch timeout

**Known Considerations:**
- AI validation may be strict - uses GPT-5 to determine if documents contain valid installation instructions
- AI processing times: 10-60 seconds per request (validation, questionnaire, playbook)
- Validation criteria has been tuned to be lenient - accepts basic installation guides with commands

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React with TypeScript using Vite as the build tool
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management
- shadcn/ui component library based on Radix UI primitives

**Design System:**
- Dark mode as the primary interface with light mode alternative
- Color palette inspired by developer platforms (GitHub, Vercel, Linear)
- Typography: Inter for UI elements, JetBrains Mono for code/technical content
- Tailwind CSS for styling with custom theme configuration
- CSS variables for theme switching between light/dark modes

**Component Architecture:**
- Modular component structure in `client/src/components`
- UI primitives in `client/src/components/ui` (buttons, cards, forms, dialogs, etc.)
- Feature components for each workflow step:
  - DocumentUpload: File and URL upload interface
  - ProcessingScreen: Animated milestone tracking with typing effects
  - ValidationScreen: Document validation results with auto-transition
  - ConfigurationScreen: Unified configuration form with help modals and AI auto-complete
  - DynamicQuestionnaire: Legacy step-by-step questionnaire (kept for compatibility)
  - PlaybookViewer: Generated playbook display and download
  - DeploymentDashboard: Deployment monitoring interface
  - ValidationResults: Post-deployment validation checks
- Shared ThemeProvider context for theme management
- Toast notifications system for user feedback

**State Management:**
- Local component state for UI interactions
- React Query for API calls and server state caching
- Context API for theme management
- Step-based navigation state in the Home page component

### Backend Architecture

**Framework:**
- Express.js server with TypeScript
- ESM module system throughout the codebase

**API Structure:**
- RESTful endpoints under `/api` prefix
- File upload handling with Multer (10MB limit, in-memory storage)
- Routes in `server/routes.ts`:
  - `POST /api/projects/upload` - File upload and project creation
  - `POST /api/projects/url` - URL-based document import
  - `POST /api/projects/:id/validate` - Document validation
  - `POST /api/projects/:id/questionnaire` - Generate configuration questions
  - `POST /api/projects/:id/autocomplete` - AI auto-complete for configuration fields
  - `POST /api/projects/:id/playbook` - Generate Ansible playbook
  - `GET /api/projects/:id` - Retrieve project details

**Business Logic:**
- `server/ai-service.ts` - OpenAI integration for document analysis, questionnaire generation, and playbook creation
- `server/storage.ts` - Data persistence abstraction with in-memory implementation (IStorage interface)
- Project workflow states: uploaded → validated → configured → playbook_generated → deployed → validated

**AI Integration:**
- Uses Replit's AI Integrations service (OpenAI-compatible API)
- GPT-5 model for document validation, requirement extraction, and playbook generation
- Structured prompts for consistent JSON responses
- Functions:
  - validateDocument: Analyzes installation guides for completeness
  - generateQuestionnaire: Creates configuration questions with help text and examples
  - generatePlaybook: Generates Ansible playbooks from configurations
  - autoCompleteConfiguration: AI-powered auto-fill for configuration fields based on user descriptions

### Data Storage

**Database:**
- PostgreSQL with Neon serverless driver
- Drizzle ORM for type-safe database queries
- WebSocket connection support for serverless environments

**Schema Design:**
- `projects` table: Stores uploaded documents, analysis results, configurations, and generated playbooks
  - Fields: id, name, documentName, documentContent, analysisResult (JSONB), configuration (JSONB), playbook (text), status, createdAt
- `deployments` table: Tracks deployment executions and logs
  - Fields: id, projectId (foreign key), cloudProvider, status, logs (JSONB), createdAt

**Data Flow:**
- In-memory storage implementation (MemStorage) for development
- Database schema defined in `shared/schema.ts` with Zod validation
- Drizzle migrations in `migrations/` directory
- Schema push via `npm run db:push`

### External Dependencies

**AI Services:**
- Replit AI Integrations (OpenAI API proxy)
- No API key required - uses environment variables for base URL and credentials
- Used for document validation, requirement extraction, and playbook generation

**Cloud Provider Integration:**
- Designed to support AWS, GCP, and Azure deployments
- Ansible playbook generation targets multiple cloud platforms
- Cloud provider selection through dynamic questionnaire

**Database:**
- Neon PostgreSQL serverless database
- Connection via `DATABASE_URL` environment variable
- WebSocket support for serverless environments

**UI Libraries:**
- Radix UI primitives for accessible components
- Lucide React for icons
- date-fns for date formatting
- cmdk for command palette functionality

**Development Tools:**
- Replit-specific plugins: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner
- TypeScript for type safety across frontend and backend
- ESBuild for production bundling

**Session Management:**
- connect-pg-simple for PostgreSQL-backed sessions
- Express session middleware (configuration expected but not fully visible in files)