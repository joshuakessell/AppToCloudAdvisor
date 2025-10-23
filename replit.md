# AWS GameLift Migration Consultant

## Overview

AWS GameLift Migration Consultant is an AI-powered platform that analyzes game packages and provides comprehensive migration guidance for transitioning from standalone to fully AWS-hosted multiplayer games. The platform accepts game packages via GitHub URL or ZIP file upload, uses GPT-5 to perform comprehensive game analysis, asks clarifying questions about multiplayer plans, recommends personalized AWS GameLift migration pathways, suggests multiplayer features to add, and delivers step-by-step migration roadmaps with SDK integration instructions.

The application follows a multi-step workflow: game upload → comprehensive analysis → clarifying questions → migration pathway selection → feature suggestions → detailed migration roadmap with SDK integration guides.

## Current Status (October 23, 2025)

**Fully Implemented:**
- ✅ Dual-path upload system: GitHub repository URLs or ZIP file uploads
- ✅ Game package ingestion with markdown validation (game.md or README.md required)
- ✅ Decompression bomb protection (10k files, 500MB max for ZIPs)
- ✅ GitHub URL fetching with repository cloning
- ✅ OpenAI GPT-5 integration via Replit AI Integrations for comprehensive game analysis
- ✅ AI-powered comprehensive game analysis (architecture, multiplayer capabilities, AWS readiness assessment)
- ✅ Interactive clarifying questions form to understand user's migration goals
- ✅ AI-generated migration recommendations with 5 AWS GameLift pathways (Anywhere, Managed EC2, Containers, Realtime, FleetIQ)
- ✅ AWS services breakdown with detailed rationale for each recommended service
- ✅ Multiplayer feature suggestions categorized by priority and impact
- ✅ Step-by-step migration roadmap with phase breakdowns and time estimates
- ✅ SDK integration guides (Server SDK, Client Backend, Testing) with code examples
- ✅ Dark mode gaming-inspired UI with processing animations and typing effects
- ✅ Comprehensive error handling and loading states throughout

**Migration Consultant Features:**
- **Comprehensive Game Analysis**: Detects game type, architecture, languages, existing multiplayer features, and AWS readiness score
- **Clarifying Questions**: Collects user goals (player count, geographic reach, latency needs, game modes, monetization, dev stage, multiplayer priority)
- **Five Migration Pathways**: 
  - GameLift Anywhere (hybrid cloud, use existing servers)
  - Managed EC2 Fleets (full AWS control, custom game servers)
  - Container Fleets (Docker-based deployment, modern DevOps)
  - Realtime Servers (lightweight WebSocket multiplayer)
  - FleetIQ (hybrid approach, AWS + on-prem optimization)
- **AWS Services Recommendations**: Core (GameLift, EC2, VPC), Backend (DynamoDB, ElastiCache, Lambda), Enhancement (CloudWatch, S3, SQS)
- **Feature Suggestions**: Matchmaking systems, progression tracking, social features, analytics, content delivery
- **Migration Roadmap**: Setup → Development → Integration → Testing → Deployment phases with detailed tasks and time estimates
- **SDK Integration**: Language-specific Server SDK guides, Client Backend implementation, Testing strategies with code examples

**Security Features:**
- ZIP file upload limit: 50MB
- Decompression bomb protection: max 10,000 files, 500MB uncompressed
- GitHub URL validation (public repositories only)
- No SSRF risks (GitHub API used for cloning)
- Markdown content validation (game.md or README.md required)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React with TypeScript using Vite as the build tool
- Wouter for client-side routing
- TanStack Query (React Query) for server state management
- shadcn/ui component library based on Radix UI primitives

**Design System:**
- Dark mode as the primary interface
- Gaming/DevOps-inspired color palette
- Typography: Inter for UI elements, JetBrains Mono for code/technical content
- Tailwind CSS for styling with custom theme configuration
- CSS variables for theme switching

**Component Architecture:**
- Modular component structure in `client/src/components`
- UI primitives in `client/src/components/ui` (buttons, cards, forms, accordions, tabs, etc.)
- Feature components for each workflow step:
  - **DocumentUpload**: Dual-path upload (GitHub URL or ZIP file) with validation
  - **ProcessingScreen**: Animated milestone tracking with typing effects (4 stages)
  - **ValidationScreen**: Analysis success/failure with AWS readiness score display
  - **ClarifyingQuestions**: Interactive form collecting migration goals and requirements
  - **MigrationPathwayVisualization**: Displays recommended AWS pathway with detailed rationale, services breakdown, and cost estimates
  - **FeatureSuggestionsDisplay**: Shows multiplayer features categorized by priority with implementation guides
  - **MigrationGuideRoadmap**: Step-by-step migration phases with SDK integration instructions and code examples
- Shared ThemeProvider context for theme management
- Toast notifications system for user feedback

**State Management:**
- Local component state for UI interactions
- React Query for API calls and server state caching
- Context API for theme management
- Step-based navigation state in the Home page component
- Migration plan and feature suggestions storage for visualization

**Workflow Steps:**
1. `upload` - Game package upload (ZIP or GitHub URL)
2. `processing` - Comprehensive AI analysis with animated progress
3. `validating` - Display analysis results and AWS readiness score
4. `clarifying` - Interactive questions form for migration goals
5. `migration-plan` - Loading state while generating migration recommendations
6. `pathway` - Display recommended AWS pathway and services
7. `features` - Optional feature suggestions display
8. `roadmap` - Final migration roadmap with SDK guides

### Backend Architecture

**Framework:**
- Express.js server with TypeScript
- ESM module system throughout the codebase

**API Structure:**
- RESTful endpoints under `/api` prefix
- File upload handling with Multer (50MB limit for game packages)
- Routes in `server/routes.ts`:
  - `POST /api/games/upload` - ZIP file upload and extraction
  - `POST /api/games/github` - GitHub repository import
  - `POST /api/games/:id/analyze-comprehensive` - Comprehensive AI game analysis
  - `POST /api/games/:id/clarifying-responses` - Submit clarifying question responses
  - `POST /api/games/:id/generate-migration-plan` - Generate personalized migration recommendations
  - `POST /api/games/:id/generate-feature-suggestions` - Generate multiplayer feature suggestions
  - `GET /api/games/:id` - Retrieve game details

**Business Logic:**
- `server/game-package-service.ts` - GitHub cloning, ZIP extraction, markdown validation, language detection
- `server/gamelift-migration-consultant.ts` - GPT-5 integration for comprehensive analysis, migration recommendations, and feature suggestions
- `server/storage.ts` - Data persistence abstraction with in-memory implementation (IStorage interface)
- Workflow states: uploaded → analyzed → clarified → migration_planned → features_suggested

**AI Integration:**
- Uses Replit's AI Integrations service (OpenAI-compatible API)
- GPT-5 model for comprehensive game analysis and migration consulting
- Structured prompts with embedded AWS GameLift knowledge
- Three AI Functions:
  - **analyzeGameComprehensively**: Deep analysis of game architecture, multiplayer capabilities, tech stack, and AWS readiness (0-10 score)
  - **generateMigrationRecommendations**: Creates personalized AWS pathway, services breakdown, migration steps, and SDK integration guides
  - **generateFeatureSuggestions**: Suggests multiplayer features based on game type with implementation guides and AWS service recommendations

**AWS GameLift Knowledge Embedded in Prompts:**
- 5 migration pathways with detailed characteristics and use cases
- AWS services ecosystem (GameLift, EC2, DynamoDB, ElastiCache, Lambda, S3, CloudWatch, etc.)
- FlexMatch matchmaking system
- Spot Fleets and Auto Scaling policies
- Hybrid hosting (GameLift Anywhere)
- Container deployment strategies
- Realtime Servers for WebSocket games
- SDK integration patterns (Server SDK + Client Backend)

### Data Storage

**Database:**
- PostgreSQL with Neon serverless driver
- Drizzle ORM for type-safe database queries
- WebSocket connection support for serverless environments

**Schema Design:**
- `game_submissions` table: Stores uploaded game packages and metadata
  - Fields: id, name, submissionType (github/zip), githubUrl, artifactPath, markdownContent, detectedLanguages, status, createdAt
- `comprehensive_analyses` table: AI-generated comprehensive game analysis
  - Fields: id, gameSubmissionId, gameType, currentArchitecture, existingMultiplayerFeatures (JSONB), awsReadiness (JSONB), technicalRequirements (JSONB), createdAt
- `clarifying_responses` table: User responses to clarifying questions
  - Fields: id, gameSubmissionId, targetPlayerCount, geographicReach (array), latencyRequirement, gameModes (array), monetizationModel, developmentStage, multiplayerPriority, additionalContext, createdAt
- `migration_recommendations` table: AI-generated migration pathways and recommendations
  - Fields: id, gameSubmissionId, recommendedPath, pathReasoning, awsServicesBreakdown (JSONB), migrationSteps (JSONB), sdkIntegrationGuide (JSONB), estimatedCosts (JSONB), createdAt
- `feature_suggestions` table: AI-generated multiplayer feature recommendations
  - Fields: id, gameSubmissionId, priorityRoadmap (JSONB), features (JSONB), createdAt

**Data Flow:**
- In-memory storage implementation (MemStorage) for development
- Database schema defined in `shared/schema.ts` with Zod validation
- Drizzle migrations via `npm run db:push`
- Sequential workflow enforcement: analysis must complete before clarifications, clarifications before migration plan, migration plan before features

### External Dependencies

**AI Services:**
- Replit AI Integrations (OpenAI API proxy)
- No API key required - uses environment variables for base URL and credentials
- Used for comprehensive game analysis, migration recommendations, and feature suggestions

**Database:**
- Neon PostgreSQL serverless database
- Connection via `DATABASE_URL` environment variable
- WebSocket support for serverless environments

**UI Libraries:**
- Radix UI primitives for accessible components (Accordion, Tabs, RadioGroup, Select, Checkbox, etc.)
- Lucide React for icons
- date-fns for date formatting
- cmdk for command palette functionality
- react-hook-form for form state management
- zod for form validation

**Development Tools:**
- Replit-specific plugins: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner
- TypeScript for type safety across frontend and backend
- ESBuild for production bundling

**Session Management:**
- connect-pg-simple for PostgreSQL-backed sessions
- Express session middleware

## AWS GameLift Migration Pathways

The platform recommends one of five AWS GameLift migration pathways based on the game's characteristics and user goals:

1. **GameLift Anywhere**: Hybrid cloud approach for gradual migration - use existing infrastructure while leveraging AWS matchmaking and player management
2. **Managed EC2 Fleets**: Traditional dedicated game servers on AWS EC2 with full control and customization
3. **Container Fleets**: Modern containerized deployment using Docker for consistent environments and easier scaling
4. **Realtime Servers**: Lightweight WebSocket-based solution for turn-based or simple multiplayer games
5. **FleetIQ**: Hybrid optimization combining AWS and on-premises infrastructure for cost efficiency

Each pathway includes:
- Detailed rationale and use case description
- Core AWS services (GameLift, EC2, VPC, etc.)
- Backend services (DynamoDB, ElastiCache, Lambda, etc.)
- Enhancement services (CloudWatch, S3, SQS, etc.)
- Migration timeline with phases (Setup, Development, Integration, Testing, Deployment)
- SDK integration guides (Server SDK, Client Backend, Testing strategies)
- Estimated costs (initial setup + monthly operational)

## Multiplayer Feature Recommendations

The platform suggests multiplayer features across five categories:

1. **Matchmaking**: Skill-based matchmaking, ranked modes, party systems, region-based matching
2. **Progression**: Player stats tracking, leaderboards, achievements, seasonal content
3. **Social**: Friend systems, clans/guilds, in-game chat, social feeds
4. **Analytics**: Player behavior tracking, retention metrics, A/B testing, performance monitoring
5. **Content**: Live events, downloadable content, user-generated content, seasonal updates

Each feature includes:
- Priority level (Quick Wins, Medium-Term, Long-Term)
- Difficulty rating (Beginner/Intermediate/Advanced)
- Impact assessment (High/Medium/Low)
- AWS services needed
- Player benefits
- Implementation guide with steps, AWS configuration, code examples, and time estimates

## Known Considerations

- AI analysis times: 10-60 seconds per game package (depends on complexity)
- Migration plan generation: 15-45 seconds (includes pathway selection and SDK guides)
- Feature suggestions generation: 10-30 seconds
- All AI responses use GPT-5 via Replit AI Integrations
- AWS GameLift knowledge is embedded in AI prompts, not fetched from live AWS APIs
- Cost estimates in migration recommendations are rough approximations for planning purposes
- Users should validate AWS service pricing through official AWS pricing calculator
