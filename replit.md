# AWS GameLift Migration Consultant

## Overview

The AWS GameLift Migration Consultant is an AI-powered platform designed to assist game developers in migrating their multiplayer games from standalone setups to fully AWS-hosted environments using AWS GameLift. It accepts game packages via GitHub URLs or ZIP file uploads, analyzes them comprehensively using AI, and provides personalized migration pathways, feature suggestions, and detailed roadmaps with SDK integration instructions. The platform aims to streamline the complex process of cloud migration for game developers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript, using Vite for fast development. It utilizes Wouter for routing and TanStack Query for server state management. The design follows a dark mode, gaming-inspired aesthetic, implemented with Tailwind CSS and Framer Motion for enterprise-grade animations. UI components are built using shadcn/ui, based on Radix UI primitives. The application follows a multi-step workflow for game package submission, analysis, clarification, and recommendation display.

### Backend Architecture

The backend is an Express.js server developed with TypeScript. It provides RESTful APIs for game package uploads (both ZIP and GitHub), comprehensive AI analysis, processing of clarifying questions, and generation of migration plans and feature suggestions. Key services handle GitHub cloning, ZIP extraction, and markdown validation.

### AI Integration

The system integrates with Replit AI Integrations (OpenAI-compatible API) utilizing the GPT-4o model. This AI is responsible for comprehensive game analysis, generating personalized migration recommendations across five AWS GameLift pathways (Anywhere, Managed EC2, Containers, Realtime, FleetIQ), and suggesting multiplayer features. The AI prompts are embedded with extensive AWS GameLift knowledge.

### Data Storage

The application uses PostgreSQL with Drizzle ORM for data persistence, leveraging Neon for serverless capabilities. The schema includes tables for game submissions, comprehensive analyses, clarifying responses, migration recommendations, and feature suggestions, ensuring a structured approach to storing workflow-related data.

## External Dependencies

**AI Services:**
- Replit AI Integrations (OpenAI API proxy) for GPT-4o model access.

**Database:**
- Neon PostgreSQL serverless database.

**UI Libraries:**
- Radix UI primitives for accessible components.
- Lucide React for icons.
- Framer Motion for animations.
- Tailwind CSS for styling.
- shadcn/ui component library.

**Development Tools:**
- TypeScript for type safety.
- Vite for frontend tooling.
- Express.js for the backend server.
- Multer for handling file uploads.
- Drizzle ORM for database interactions.
- Zod for validation.