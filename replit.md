# GameLift Resource Analyzer & Cost Estimator

## Overview

GameLift Resource Analyzer is an AI-powered platform that analyzes game packages and generates AWS GameLift infrastructure recommendations with detailed cost estimates. The platform accepts game packages via GitHub URL or ZIP file upload, uses GPT-5 to analyze game architecture and requirements, determines optimal GameLift resources (fleet types, instance sizes, scaling policies), and provides an interactive cost simulator for estimating infrastructure costs based on traffic variables.

The application follows a multi-step workflow: game package upload → AI analysis → resource visualization → interactive cost simulation with detailed breakdowns.

## Current Status (October 23, 2025)

**Fully Implemented:**
- ✅ Dual-path upload system: GitHub repository URLs or ZIP file uploads
- ✅ Game package ingestion with markdown validation (game.md or README.md required)
- ✅ Decompression bomb protection (10k files, 500MB max for ZIPs)
- ✅ GitHub URL fetching with repository cloning
- ✅ OpenAI GPT-5 integration via Replit AI Integrations for game analysis
- ✅ AI-powered GameLift resource planning (fleet config, scaling policies, auxiliary services)
- ✅ AWS GameLift pricing data system with automatic seeding across 4 regions
- ✅ Cost calculation engine with peak/off-peak modeling and session duration multipliers
- ✅ Interactive cost simulator with sliders for concurrent players, session duration, regions, instance types
- ✅ Resource visualization showing fleet configuration, auto-scaling policies, recommended regions
- ✅ Dark mode gaming-inspired UI with processing animations and typing effects
- ✅ Comprehensive error handling and loading states throughout

**Pricing Features:**
- Static AWS GameLift pricing tables for 4 regions (us-east-1, us-west-2, eu-west-1, ap-southeast-1)
- EC2 instance pricing (11 instance types in us-east-1, 5 in other regions)
- Data transfer pricing (internet egress, inter-region transfer)
- S3 storage pricing for game builds
- GameLift service costs (matchmaking, FlexMatch, monitoring)
- Automatic backfill and stale data refresh (7-day threshold)

**Cost Calculation Model:**
- Peak hours modeling: 8 hours/day at full instance capacity
- Off-peak hours: 16 hours/day at 20% baseline capacity
- Session duration multiplier: 1.0x to 1.5x based on gameplay length
- Spot fleet discount: 30% off on-demand pricing
- Multi-region cost multiplication
- Breakdown: compute + storage + data transfer + GameLift services

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
- UI primitives in `client/src/components/ui` (buttons, cards, forms, sliders, etc.)
- Feature components for each workflow step:
  - **DocumentUpload**: Dual-path upload (GitHub URL or ZIP file) with validation
  - **ProcessingScreen**: Animated milestone tracking with typing effects (4 stages)
  - **ValidationScreen**: Analysis success/failure with issue reporting
  - **GameLiftResourceVisualization**: Fleet config, scaling policies, regions, auxiliary services
  - **GameLiftCostSimulator**: Interactive sliders for cost estimation (concurrent players, session duration, instance types, regions)
- Shared ThemeProvider context for theme management
- Toast notifications system for user feedback

**State Management:**
- Local component state for UI interactions
- React Query for API calls and server state caching
- Context API for theme management
- Step-based navigation state in the Home page component
- Resource plan storage for visualization and cost simulation

### Backend Architecture

**Framework:**
- Express.js server with TypeScript
- ESM module system throughout the codebase

**API Structure:**
- RESTful endpoints under `/api` prefix
- File upload handling with Multer (50MB limit for game packages)
- Routes in `server/routes.ts`:
  - `POST /api/game-submissions/upload` - ZIP file upload and extraction
  - `POST /api/game-submissions/github` - GitHub repository import
  - `POST /api/game-submissions/:id/analyze` - AI-powered game analysis
  - `GET /api/game-submissions/:id` - Retrieve submission details
  - `POST /api/resource-plans/:id/calculate-costs` - Calculate costs with custom parameters
  - `POST /api/resource-plans/:id/scenarios` - Generate multiple traffic scenarios
  - `GET /api/resource-plans/:id/simulations` - List all cost simulations
  - `GET /api/pricing/refresh` - Manually refresh pricing data

**Business Logic:**
- `server/game-package-service.ts` - GitHub cloning, ZIP extraction, markdown validation, language detection
- `server/gamelift-ai-service.ts` - GPT-5 integration for game analysis and resource planning
- `server/cost-calculator.ts` - Cost calculation engine with peak/off-peak modeling
- `server/pricing-service.ts` - AWS pricing data retrieval and management
- `server/seed-pricing.ts` - Static pricing data seeding for 4 AWS regions
- `server/storage.ts` - Data persistence abstraction with in-memory implementation (IStorage interface)
- Workflow states: uploaded → analyzed → resource_planned → cost_simulated

**AI Integration:**
- Uses Replit's AI Integrations service (OpenAI-compatible API)
- GPT-5 model for game architecture analysis and resource planning
- Structured prompts for consistent JSON responses
- Functions:
  - analyzeGamePackage: Analyzes game.md and code to determine architecture, player count, network model
  - generateResourcePlan: Creates GameLift fleet configuration, scaling policies, auxiliary services

### Data Storage

**Database:**
- PostgreSQL with Neon serverless driver
- Drizzle ORM for type-safe database queries
- WebSocket connection support for serverless environments

**Schema Design:**
- `game_submissions` table: Stores uploaded game packages and metadata
  - Fields: id, name, submissionType (github/zip), githubUrl, artifactPath, markdownContent, detectedLanguages, status, createdAt
- `gamelift_resource_plans` table: AI-generated resource recommendations
  - Fields: id, gameSubmissionId, gameType, playerCount, networkModel, fleetConfig (JSONB), scalingPolicies (JSONB), recommendedRegions (JSONB), auxiliaryServices (JSONB), createdAt
- `cost_simulations` table: Cost calculation results
  - Fields: id, resourcePlanId, concurrentPlayers, sessionDurationMinutes, regions (JSONB), instanceFamily, calculatedInitialCost, calculatedMonthlyCost, costBreakdown (JSONB), createdAt
- `pricing_tables` table: AWS GameLift pricing data
  - Fields: id, service (ec2_instances/data_transfer/storage/gamelift_services), region, category, pricingData (JSONB), lastUpdated

**Data Flow:**
- In-memory storage implementation (MemStorage) for development
- Database schema defined in `shared/schema.ts` with Zod validation
- Drizzle migrations via `npm run db:push`
- Automatic pricing data seeding on server start

### External Dependencies

**AI Services:**
- Replit AI Integrations (OpenAI API proxy)
- No API key required - uses environment variables for base URL and credentials
- Used for game analysis and GameLift resource planning

**AWS GameLift Pricing:**
- Static pricing data for 4 regions
- EC2 instance types: c5.large, c5.xlarge, c5.2xlarge, c5.4xlarge, c6g.large, c6g.xlarge, c6g.2xlarge, etc.
- Data transfer rates: internet egress, inter-region transfer
- S3 storage: Standard, Infrequent Access, Glacier
- GameLift services: matchmaking, FlexMatch, monitoring

**Database:**
- Neon PostgreSQL serverless database
- Connection via `DATABASE_URL` environment variable
- WebSocket support for serverless environments

**UI Libraries:**
- Radix UI primitives for accessible components (including Slider)
- Lucide React for icons
- date-fns for date formatting
- cmdk for command palette functionality

**Development Tools:**
- Replit-specific plugins: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner
- TypeScript for type safety across frontend and backend
- ESBuild for production bundling

**Session Management:**
- connect-pg-simple for PostgreSQL-backed sessions
- Express session middleware

## Cost Calculation Formulas

**Monthly Compute Cost:**
```
peakHours = 8 hours/day × 30 days = 240 hours
offPeakHours = 16 hours/day × 30 days = 480 hours

peakCost = instancesNeeded × peakHours
offPeakCost = (instancesNeeded × 0.2) × offPeakHours

baseMonthlyHours = peakCost + offPeakCost
sessionMultiplier = min(1 + sessionDurationHours/10, 1.5)
adjustedHours = baseMonthlyHours × sessionMultiplier

monthlyCost = adjustedHours × hourlyRate × spotDiscount × regionsCount
```

**Storage Cost:**
```
storageMonthlyCost = storageGB × s3Rate × regionsCount
```

**Data Transfer Cost:**
```
dataTransferCost = monthlyTransferGB × (internetRate + interRegionRate)
```

**Total Monthly Cost:**
```
totalMonthly = compute + storage + dataTransfer + gameliftServices
```

## Known Considerations

- AI analysis times: 10-60 seconds per game package (depends on complexity)
- Pricing data is static - manually seeded, not fetched from live AWS APIs
- Session duration multiplier caps at 1.5x to prevent unrealistic cost inflation
- Spot fleet pricing assumes 30% discount from on-demand pricing
- Cost calculations use average monthly hours (730) with peak/off-peak modeling
