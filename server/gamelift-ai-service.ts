// AI service for analyzing games and determining GameLift resource requirements
import OpenAI from 'openai';

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

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
