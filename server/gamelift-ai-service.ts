// AI service for analyzing games and determining GameLift resource requirements
import OpenAI from 'openai';

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// Comprehensive game analysis for migration consulting
export interface ComprehensiveGameAnalysis {
  currentState: {
    hasMultiplayer: boolean; // Does it currently have multiplayer?
    multiplayerType: 'none' | 'local' | 'online_basic' | 'online_advanced'; // Current multiplayer sophistication
    networkingPresent: boolean; // Has any network code?
    clientServerModel: boolean; // Uses client-server architecture (vs peer-to-peer)?
    developmentStage: 'prototype' | 'alpha' | 'beta' | 'production' | 'live' | 'unknown';
  };
  technology: {
    gameEngine: string; // Unity, Unreal, Godot, Custom, Unknown
    primaryLanguages: string[]; // C++, C#, JavaScript, Python, etc.
    frameworks: string[]; // Photon, Mirror, Netcode, etc.
    existingBackend: boolean; // Has backend services already?
    backendTech: string[]; // Node.js, Python, etc.
  };
  gameDetails: {
    genre: string; // FPS, Battle Royale, MOBA, Racing, Turn-based, etc.
    gameplayStyle: string; // Fast-paced, Turn-based, Real-time strategy, etc.
    sessionType: 'match-based' | 'persistent-world' | 'room-based' | 'arena' | 'unknown';
    estimatedComplexity: 'low' | 'medium' | 'high'; // Network complexity
  };
  features: {
    currentFeatures: string[]; // What the game currently has
    missingMultiplayerFeatures: string[]; // What's needed for multiplayer
    potentialEnhancements: string[]; // Features that could be added
  };
  awsReadiness: {
    readinessScore: number; // 1-10 scale
    migrationPath: 'beginner' | 'intermediate' | 'advanced'; // Suggested learning path
    estimatedEffort: 'low' | 'medium' | 'high' | 'very_high';
    blockers: string[]; // What's preventing immediate migration
    quickWins: string[]; // Easy improvements to get started
  };
}

interface GameArchitecture {
  gameType: string; // e.g., "multiplayer FPS", "turn-based strategy", "MOBA"
  networkModel: string; // "client-server", "peer-to-peer", "hybrid"
  sessionModel: string; // "persistent", "match-based", "room-based"
  estimatedPlayerCount: {
    min: number;
    max: number;
    typical: number;
  };
  technicalDetails: {
    programmingLanguages: string[];
    frameworks: string[];
    databaseNeeds: boolean;
    storageNeeds: boolean;
  };
}

interface FleetConfiguration {
  fleetType: 'spot' | 'on-demand' | 'hybrid';
  instanceTypes: string[]; // e.g., ["c5.large", "c5.xlarge"]
  reasoning: string;
  scalingPolicy: {
    minInstances: number;
    maxInstances: number;
    targetUtilization: number; // percentage
    scaleUpThreshold: number;
    scaleDownThreshold: number;
  };
}

interface AuxiliaryServices {
  s3: boolean;
  dynamodb: boolean;
  elasticache: boolean;
  rds: boolean;
  cloudwatch: boolean;
  reasoning: string;
}

export interface GameLiftResourcePlan {
  architecture: GameArchitecture;
  fleet: FleetConfiguration;
  auxiliaryServices: AuxiliaryServices;
  estimatedCosts: {
    initialSetup: string; // Description
    monthlyOperational: string; // Description
  };
  recommendations: string[];
}

// Perform comprehensive analysis of game's current state for migration consulting
export async function analyzeGameComprehensively(
  gameMarkdown: string,
  detectedLanguages: string[],
  gameName: string,
  repositoryManifest?: any
): Promise<ComprehensiveGameAnalysis> {
  console.log(`[Migration AI] Performing comprehensive analysis of "${gameName}"...`);

  const systemPrompt = `You are an expert AWS GameLift migration consultant who deeply analyzes games to provide personalized migration guidance.

Your task is to thoroughly understand the game's:
1. Current state - Does it have multiplayer? What stage of development?
2. Technology stack - Engine, languages, frameworks, existing backend
3. Game details - Genre, gameplay style, session type, network complexity
4. Existing features vs. what's needed for multiplayer
5. AWS migration readiness - What's blocking migration? What are quick wins?

Analyze the game from the perspective of helping developers migrate to AWS GameLift. Be realistic about:
- What they currently have
- What they need to add for multiplayer
- How ready they are for AWS migration
- Specific blockers and opportunities

Respond with valid JSON only, following this structure:
{
  "currentState": {
    "hasMultiplayer": boolean,
    "multiplayerType": "none | local | online_basic | online_advanced",
    "networkingPresent": boolean,
    "clientServerModel": boolean,
    "developmentStage": "prototype | alpha | beta | production | live | unknown"
  },
  "technology": {
    "gameEngine": "Unity | Unreal | Godot | Custom | Unknown",
    "primaryLanguages": ["array of languages"],
    "frameworks": ["array of frameworks/libraries"],
    "existingBackend": boolean,
    "backendTech": ["array of backend technologies if present"]
  },
  "gameDetails": {
    "genre": "string (FPS, Battle Royale, MOBA, Racing, Turn-based, etc.)",
    "gameplayStyle": "string (Fast-paced, Turn-based, Real-time, etc.)",
    "sessionType": "match-based | persistent-world | room-based | arena | unknown",
    "estimatedComplexity": "low | medium | high"
  },
  "features": {
    "currentFeatures": ["array of features the game currently has"],
    "missingMultiplayerFeatures": ["what's needed to add multiplayer"],
    "potentialEnhancements": ["features that could improve the game"]
  },
  "awsReadiness": {
    "readinessScore": number (1-10, where 10 is fully ready),
    "migrationPath": "beginner | intermediate | advanced",
    "estimatedEffort": "low | medium | high | very_high",
    "blockers": ["array of specific blockers preventing migration"],
    "quickWins": ["array of easy improvements to get started"]
  }
}

Be honest and helpful. If the game is single-player, set hasMultiplayer to false and identify what's needed.
If it's a prototype, reflect that in developmentStage and readinessScore.`;

  const userPrompt = `Analyze this game comprehensively for AWS GameLift migration:

Game Name: ${gameName}
Detected Languages: ${detectedLanguages.join(', ')}
${repositoryManifest ? `\nRepository contains ${repositoryManifest.fileCount || 0} files` : ''}

Game Documentation:
${gameMarkdown}

Provide a comprehensive analysis of the game's current state, technology, and AWS migration readiness.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from AI service');
    }

    const analysis: ComprehensiveGameAnalysis = JSON.parse(content);
    
    console.log(`[Migration AI] Comprehensive analysis complete for "${gameName}"`);
    console.log(`[Migration AI] Genre: ${analysis.gameDetails.genre}`);
    console.log(`[Migration AI] Has Multiplayer: ${analysis.currentState.hasMultiplayer}`);
    console.log(`[Migration AI] AWS Readiness: ${analysis.awsReadiness.readinessScore}/10`);
    
    return analysis;
  } catch (error: any) {
    console.error('[Migration AI] Analysis error:', error);
    
    if (error.message?.includes('API') || error.message?.includes('rate limit')) {
      throw new Error('AI service temporarily unavailable. Please try again in a moment.');
    }
    
    throw new Error(`Failed to analyze game: ${error.message}`);
  }
}

// Analyze game documentation and code to determine resource requirements
export async function analyzeGameForGameLift(
  gameMarkdown: string,
  detectedLanguages: string[],
  gameName: string
): Promise<GameLiftResourcePlan> {
  console.log(`[GameLift AI] Analyzing "${gameName}" for AWS GameLift resources...`);

  const systemPrompt = `You are an AWS GameLift expert who analyzes game documentation to determine optimal cloud resource requirements.

Your task is to:
1. Understand the game architecture, type, and networking model
2. Estimate concurrent player capacity needs
3. Recommend appropriate EC2 instance types for game servers
4. Determine scaling policies
5. Identify auxiliary AWS services needed
6. Provide cost estimation guidance

Respond with valid JSON only, following this exact structure:
{
  "architecture": {
    "gameType": "string (e.g., multiplayer FPS, turn-based strategy)",
    "networkModel": "string (client-server, peer-to-peer, hybrid)",
    "sessionModel": "string (persistent, match-based, room-based)",
    "estimatedPlayerCount": {
      "min": number,
      "max": number,
      "typical": number
    },
    "technicalDetails": {
      "programmingLanguages": ["string"],
      "frameworks": ["string"],
      "databaseNeeds": boolean,
      "storageNeeds": boolean
    }
  },
  "fleet": {
    "fleetType": "spot | on-demand | hybrid",
    "instanceTypes": ["string array of EC2 instance types"],
    "reasoning": "string explaining instance type selection",
    "scalingPolicy": {
      "minInstances": number,
      "maxInstances": number,
      "targetUtilization": number (50-80 typical),
      "scaleUpThreshold": number,
      "scaleDownThreshold": number
    }
  },
  "auxiliaryServices": {
    "s3": boolean,
    "dynamodb": boolean,
    "elasticache": boolean,
    "rds": boolean,
    "cloudwatch": boolean,
    "reasoning": "string explaining service selections"
  },
  "estimatedCosts": {
    "initialSetup": "string description",
    "monthlyOperational": "string description"
  },
  "recommendations": ["array of actionable recommendations"]
}

Guidelines:
- For small games (<100 players): c5.large or m5.large
- For medium games (100-1000 players): c5.xlarge, c6g.xlarge
- For large games (1000+ players): c5.2xlarge, c6g.2xlarge or larger
- Use spot fleets for cost-sensitive workloads with flexible timing
- Use on-demand for production critical workloads
- Always include CloudWatch for monitoring
- Recommend S3 for game builds and logs
- Suggest DynamoDB for player data/sessions if needed`;

  const userPrompt = `Analyze this game for AWS GameLift deployment:

Game Name: ${gameName}
Detected Languages: ${detectedLanguages.join(', ')}

Game Documentation:
${gameMarkdown}

Provide a comprehensive resource plan optimized for AWS GameLift.`;

  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from AI service');
    }

    const resourcePlan: GameLiftResourcePlan = JSON.parse(content);
    
    console.log(`[GameLift AI] Analysis complete for "${gameName}"`);
    console.log(`[GameLift AI] Game Type: ${resourcePlan.architecture.gameType}`);
    console.log(`[GameLift AI] Recommended Instances: ${resourcePlan.fleet.instanceTypes.join(', ')}`);
    
    return resourcePlan;
  } catch (error: any) {
    console.error('[GameLift AI] Analysis error:', error);
    
    // Provide fallback recommendation on error
    if (error.message?.includes('API') || error.message?.includes('rate limit')) {
      throw new Error('AI service temporarily unavailable. Please try again in a moment.');
    }
    
    throw new Error(`Failed to analyze game: ${error.message}`);
  }
}

// Generate AWS migration recommendations based on analysis and user goals
export async function generateMigrationRecommendations(
  comprehensiveAnalysis: ComprehensiveGameAnalysis,
  clarifyingResponses: {
    targetPlayerCount?: string;
    geographicReach?: string;
    latencyRequirements?: string;
    primaryGameModes?: string[];
    monetizationStrategy?: string;
    developmentStage?: string;
    multiplayerPlans?: string;
  }
): Promise<any> {
  console.log('[Migration AI] Generating AWS migration recommendations...');

  const awsGameLiftKnowledge = `
AWS GameLift Migration Options:

1. **GameLift Anywhere** - Beginner-Friendly Hybrid Approach
   - Start with local testing (no cloud costs)
   - Run game servers on your own hardware/on-premises
   - Migrate gradually to cloud when ready
   - Single GameLift SDK works everywhere
   - Perfect for: Prototypes, local development, testing, gradual migration
   - Use Case: "Test locally, scale globally"

2. **Managed EC2 Fleets** - Full Cloud Production
   - AWS manages EC2 instances running your game servers
   - Auto-scaling based on player demand
   - Spot instances for up to 70% cost savings
   - Multi-region deployment for global reach
   - Perfect for: Production multiplayer games, session-based matches
   - Requires: Server SDK integration (C++, C#, Go)

3. **Managed Container Fleets** - Platform Flexibility
   - Containerized game servers (Docker)
   - Easy version updates without new fleets
   - Multi-platform support
   - Automated deployment pipelines
   - Perfect for: Cross-platform games, frequent updates
   - Requires: Docker knowledge, container configuration

4. **Realtime Servers** - Lightweight No-Code Servers
   - Pre-built server framework with minimal custom code
   - JavaScript configuration scripts
   - Built-in GameLift features
   - Perfect for: Simple multiplayer, casual games, rapid prototyping
   - No server code needed - just game logic in JS

5. **FleetIQ** - Cost-Optimized Self-Managed
   - Direct control over EC2 + Auto Scaling
   - GameLift optimizes Spot instance placement
   - Keep existing tooling and pipelines
   - Perfect for: Cost-sensitive workloads, existing infrastructure
   - Minimal SDK integration required

AWS Services Integration:
- **FlexMatch**: Skill-based matchmaking, latency-based placement, party support, up to 200 players
- **DynamoDB**: Player data, leaderboards, matchmaking tickets (single-digit ms response)
- **S3**: Game builds, content delivery, replay storage
- **Lambda**: Backend service logic, matchmaking requests
- **API Gateway**: REST API endpoints with JWT auth
- **CloudWatch**: Monitoring, metrics, distributed tracing
- **Cognito**: Player authentication and identity
- **CloudFront**: CDN for game assets

SDK Integration Steps:
1. Server SDK: InitSDK() → ProcessReady() → Handle game sessions
2. Client Backend: AWS SDK → Create/search game sessions → Return connection info
3. Testing: Use GameLift Local for local iteration without cloud uploads
4. Deployment: Upload builds → Create fleets → Configure queues → Deploy multi-region`;

  const systemPrompt = `You are an expert AWS GameLift migration consultant. Based on the game analysis and user's goals, recommend the optimal AWS GameLift migration path.

Use this AWS GameLift knowledge:
${awsGameLiftKnowledge}

Provide personalized recommendations that:
1. Match their current development stage and technical capability
2. Consider their player count goals and geographic reach
3. Account for latency requirements and game complexity
4. Provide realistic migration timeline and effort estimates
5. Include specific AWS services they'll need
6. Give step-by-step migration guidance
7. Suggest quick wins and long-term improvements

Respond with valid JSON only:
{
  "recommendedPath": "anywhere | managed_ec2 | managed_containers | realtime | fleetiq",
  "pathReasoning": "Detailed explanation of why this path is best for their situation",
  "awsServicesBreakdown": {
    "core": [{"service": "string", "purpose": "string", "priority": "essential|recommended|optional"}],
    "backend": [{"service": "string", "purpose": "string", "priority": "essential|recommended|optional"}],
    "enhancement": [{"service": "string", "purpose": "string", "priority": "essential|recommended|optional"}]
  },
  "migrationSteps": [
    {"phase": "string", "title": "string", "description": "string", "estimatedTime": "string", "tasks": ["array of specific tasks"]}
  ],
  "sdkIntegrationGuide": {
    "serverSDK": {"language": "C++|C#|Go", "steps": ["array of integration steps"], "codeSnippets": ["key code examples"]},
    "clientBackend": {"technology": "Lambda|Express|etc", "steps": ["array of steps"], "endpoints": ["API endpoints needed"]},
    "testing": {"approach": "string", "tools": ["GameLift Local", "etc"], "steps": ["testing steps"]}
  },
  "costEstimates": {
    "initial": "string estimate",
    "monthly": "string estimate with breakdown",
    "savings": ["cost optimization tips"]
  }
}`;

  const userPrompt = `Generate AWS GameLift migration recommendations:

GAME ANALYSIS:
- Genre: ${comprehensiveAnalysis.gameDetails.genre}
- Current State: ${comprehensiveAnalysis.currentState.hasMultiplayer ? 'Has multiplayer' : 'Single-player'}
- Multiplayer Type: ${comprehensiveAnalysis.currentState.multiplayerType}
- Game Engine: ${comprehensiveAnalysis.technology.gameEngine}
- Languages: ${comprehensiveAnalysis.technology.primaryLanguages.join(', ')}
- Development Stage: ${comprehensiveAnalysis.currentState.developmentStage}
- AWS Readiness: ${comprehensiveAnalysis.awsReadiness.readinessScore}/10
- Blockers: ${comprehensiveAnalysis.awsReadiness.blockers.join(', ')}

USER GOALS:
- Target Players: ${clarifyingResponses.targetPlayerCount || 'Not specified'}
- Geographic Reach: ${clarifyingResponses.geographicReach || 'Not specified'}
- Latency Needs: ${clarifyingResponses.latencyRequirements || 'Not specified'}
- Game Modes: ${clarifyingResponses.primaryGameModes?.join(', ') || 'Not specified'}
- Multiplayer Plans: ${clarifyingResponses.multiplayerPlans || 'Not specified'}
- Development Stage: ${clarifyingResponses.developmentStage || 'Not specified'}

Provide a personalized migration plan.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from AI service');
    }

    const recommendations = JSON.parse(content);
    console.log(`[Migration AI] Recommended path: ${recommendations.recommendedPath}`);
    
    return recommendations;
  } catch (error: any) {
    console.error('[Migration AI] Recommendation generation error:', error);
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
}

// Generate feature suggestions for enhancing the game with AWS services
export async function generateFeatureSuggestions(
  comprehensiveAnalysis: ComprehensiveGameAnalysis,
  migrationRecommendations: any
): Promise<any> {
  console.log('[Migration AI] Generating feature suggestions...');

  const systemPrompt = `You are an AWS GameLift consultant suggesting multiplayer features developers can add to their game using AWS services.

Based on the game's current state and chosen migration path, suggest:
1. Features they can add to enhance multiplayer experience
2. How to implement each feature using AWS services
3. Priority/difficulty of each feature
4. Expected impact on player experience

Focus on practical, achievable features that leverage AWS GameLift ecosystem:
- FlexMatch for matchmaking (skill-based, latency-based, party support)
- DynamoDB for leaderboards, player progression, stats
- S3 for replay systems, user-generated content
- Lambda for tournaments, events, daily challenges
- CloudWatch for analytics and player insights
- Cognito for player accounts and authentication

Respond with valid JSON only:
{
  "suggestedFeatures": [
    {
      "name": "string",
      "description": "string",
      "category": "matchmaking|progression|social|analytics|content",
      "difficulty": "easy|medium|hard",
      "impact": "low|medium|high",
      "awsServices": ["services used"],
      "benefits": ["player benefits"]
    }
  ],
  "implementationGuides": [
    {
      "featureName": "string",
      "steps": ["implementation steps"],
      "awsConfiguration": "configuration details",
      "codeExample": "brief code snippet or approach",
      "estimatedTime": "time to implement"
    }
  ],
  "priorityRanking": {
    "quickWins": ["features to do first"],
    "mediumTerm": ["features for after initial launch"],
    "longTerm": ["advanced features for mature product"]
  }
}`;

  const userPrompt = `Suggest multiplayer features for this game:

GAME:
- Genre: ${comprehensiveAnalysis.gameDetails.genre}
- Current Features: ${comprehensiveAnalysis.features.currentFeatures.join(', ')}
- Missing Features: ${comprehensiveAnalysis.features.missingMultiplayerFeatures.join(', ')}
- Potential Enhancements: ${comprehensiveAnalysis.features.potentialEnhancements.join(', ')}

MIGRATION PATH: ${migrationRecommendations.recommendedPath}
AVAILABLE AWS SERVICES: ${JSON.stringify(migrationRecommendations.awsServicesBreakdown)}

Suggest 5-8 practical features they can add, prioritized by impact and difficulty.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from AI service');
    }

    const suggestions = JSON.parse(content);
    console.log(`[Migration AI] Generated ${suggestions.suggestedFeatures?.length || 0} feature suggestions`);
    
    return suggestions;
  } catch (error: any) {
    console.error('[Migration AI] Feature suggestion error:', error);
    throw new Error(`Failed to generate feature suggestions: ${error.message}`);
  }
}

// Validate resource plan has all required fields
export function validateResourcePlan(plan: any): plan is GameLiftResourcePlan {
  return (
    plan &&
    plan.architecture &&
    plan.fleet &&
    plan.auxiliaryServices &&
    plan.estimatedCosts &&
    Array.isArray(plan.recommendations) &&
    typeof plan.architecture.gameType === 'string' &&
    Array.isArray(plan.fleet.instanceTypes) &&
    plan.fleet.instanceTypes.length > 0
  );
}
