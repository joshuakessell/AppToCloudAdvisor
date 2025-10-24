import { storage } from './storage';
import { calculateCosts, generateCostScenarios, type CostParameters } from './cost-calculator';
import OpenAI from 'openai';
import type { GameSubmission } from '@shared/schema';

export interface CostOptimizationResult {
  score: number; // 0-100, higher is better
  currentCosts: {
    monthlyEstimate: number;
    breakdown: any;
  };
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedSavings: number;
    implementation: string;
  }>;
  alternativeConfigurations: Array<{
    name: string;
    description: string;
    monthlyEstimate: number;
    savingsPercentage: number;
    tradeoffs: string[];
  }>;
  insights: {
    costDrivers: string[];
    quickWins: string[];
    longTermOptimizations: string[];
  };
}

export async function executeCostOptimizationScan(
  gameSubmissionId: string
): Promise<CostOptimizationResult> {
  const submission = await storage.getGameSubmission(gameSubmissionId);
  if (!submission) {
    throw new Error('Game submission not found');
  }

  const resourcePlan = await storage.getResourcePlanBySubmissionId(gameSubmissionId);
  if (!resourcePlan) {
    throw new Error('Resource plan not found - please complete initial analysis first');
  }

  // Get GameLift resource plan from submission's analysisResult field
  // Note: analysisResult contains GameLiftResourcePlan, not ComprehensiveGameAnalysis
  const resourcePlanData = submission.analysisResult as any;

  // Extract current configuration from resource plan
  const fleetConfig = resourcePlan.fleetConfig as any;
  const currentInstanceType = fleetConfig?.instanceTypes?.[0] || 'c5.large';
  const currentFleetType: 'spot' | 'on-demand' = fleetConfig?.fleetType === 'spot' ? 'spot' : 'on-demand';

  // Extract player count estimates from resource plan architecture
  const architecture = resourcePlanData?.architecture || {};
  const estimatedPlayerCount = architecture.estimatedPlayerCount || {
    min: 50,
    max: 5000,
    typical: 1000,
  };

  // Determine session type from architecture
  const sessionType = architecture.sessionModel || 'match-based';
  const sessionDurationHours = sessionType === 'persistent' ? 4 : 2;

  // Estimate regions based on geographic reach (default to single region)
  const regionsCount = 1;

  // Calculate current costs based on actual game data
  const currentParams: CostParameters = {
    concurrentPlayers: estimatedPlayerCount.typical,
    sessionDurationHours,
    regionsCount,
    instanceType: currentInstanceType,
    fleetType: currentFleetType,
    storageGB: 10, // Reasonable default for game build storage
    monthlyDataTransferGB: estimatedPlayerCount.typical * 0.1, // Rough estimate: 100MB per player per month
  };

  const currentCosts = await calculateCosts(currentParams, 'us-east-1');

  // Generate alternative cost scenarios with different instance types
  const alternatives = await generateAlternativeConfigurations(currentParams, submission);

  // Use AI to analyze code for cost optimization opportunities
  const aiRecommendations = await analyzeCodeForCostOptimizations(
    submission,
    resourcePlanData,
    currentCosts
  );

  // Calculate cost optimization score
  const score = calculateOptimizationScore(currentCosts, alternatives, aiRecommendations);

  return {
    score,
    currentCosts: {
      monthlyEstimate: currentCosts.total.monthlyOperational,
      breakdown: currentCosts,
    },
    recommendations: aiRecommendations,
    alternativeConfigurations: alternatives,
    insights: {
      costDrivers: identifyCostDrivers(currentCosts),
      quickWins: identifyQuickWins(aiRecommendations),
      longTermOptimizations: identifyLongTermOptimizations(aiRecommendations),
    },
  };
}

async function generateAlternativeConfigurations(
  baseParams: CostParameters,
  submission: GameSubmission
): Promise<Array<{
  name: string;
  description: string;
  monthlyEstimate: number;
  savingsPercentage: number;
  tradeoffs: string[];
}>> {
  const alternatives = [];

  // Alternative 1: Graviton instances (ARM-based, better price/performance)
  if (baseParams.instanceType.startsWith('c5')) {
    const gravitonParams = { ...baseParams, instanceType: 'c6g.large' };
    const gravitonCosts = await calculateCosts(gravitonParams, 'us-east-1');
    const baseCosts = await calculateCosts(baseParams, 'us-east-1');
    const savings = ((baseCosts.total.monthlyOperational - gravitonCosts.total.monthlyOperational) / baseCosts.total.monthlyOperational) * 100;

    alternatives.push({
      name: 'AWS Graviton Instances',
      description: 'Switch to ARM-based c6g instances for better price/performance',
      monthlyEstimate: gravitonCosts.total.monthlyOperational,
      savingsPercentage: Math.max(0, savings),
      tradeoffs: [
        'Requires ARM-compatible game server build',
        'May need code modifications for architecture compatibility',
        'Better energy efficiency and cost per vCPU',
      ],
    });
  }

  // Alternative 2: Spot instances
  if (baseParams.fleetType === 'on-demand') {
    const spotParams = { ...baseParams, fleetType: 'spot' as const };
    const spotCosts = await calculateCosts(spotParams, 'us-east-1');
    const currentCosts = await calculateCosts(baseParams, 'us-east-1');
    const savings = ((currentCosts.total.monthlyOperational - spotCosts.total.monthlyOperational) / currentCosts.total.monthlyOperational) * 100;

    alternatives.push({
      name: 'Spot Fleet Configuration',
      description: 'Use EC2 Spot instances for up to 70% cost savings',
      monthlyEstimate: spotCosts.total.monthlyOperational,
      savingsPercentage: Math.max(0, savings),
      tradeoffs: [
        'Instances can be interrupted with 2-minute notice',
        'Requires graceful termination handling',
        'Best for flexible, fault-tolerant workloads',
        'GameLift handles instance replacement automatically',
      ],
    });
  }

  // Alternative 3: Smaller instance type (if applicable)
  const smallerInstance = getSmallerInstanceType(baseParams.instanceType);
  if (smallerInstance) {
    const smallerParams = { ...baseParams, instanceType: smallerInstance };
    const smallerCosts = await calculateCosts(smallerParams, 'us-east-1');
    const currentCosts = await calculateCosts(baseParams, 'us-east-1');
    const savings = ((currentCosts.total.monthlyOperational - smallerCosts.total.monthlyOperational) / currentCosts.total.monthlyOperational) * 100;

    alternatives.push({
      name: 'Right-sized Instances',
      description: `Downsize to ${smallerInstance} if current capacity is over-provisioned`,
      monthlyEstimate: smallerCosts.total.monthlyOperational,
      savingsPercentage: Math.max(0, savings),
      tradeoffs: [
        'Lower compute capacity per instance',
        'May need more instances for same player count',
        'Better utilization if current instances are underused',
      ],
    });
  }

  return alternatives;
}

async function analyzeCodeForCostOptimizations(
  submission: GameSubmission,
  resourcePlanData: any,
  currentCosts: any
): Promise<Array<{
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedSavings: number;
  implementation: string;
}>> {
  const openai = new OpenAI({
    baseURL: "https://api.replit.com/v1/agents/openai",
    apiKey: process.env.REPLIT_AGENT_API_TOKEN,
  });

  // Extract relevant information from GameLift resource plan
  const architecture = resourcePlanData?.architecture || {};
  const fleet = resourcePlanData?.fleet || {};
  const auxiliaryServices = resourcePlanData?.auxiliaryServices || {};

  const gameType = architecture.gameType || 'multiplayer game';
  const networkModel = architecture.networkModel || 'unknown';
  const sessionType = architecture.sessionModel || 'match-based';
  const estimatedPlayerCount = architecture.estimatedPlayerCount || {};

  const prompt = `You are an AWS GameLift cost optimization expert. Analyze this game server and provide specific, actionable cost optimization recommendations.

Game Information:
- Name: ${submission.name}
- Type: ${gameType}
- Network Model: ${networkModel}
- Session Model: ${sessionType}
- Est. Player Count: ${estimatedPlayerCount.min || 0}-${estimatedPlayerCount.max || 0} (typical: ${estimatedPlayerCount.typical || 0})
- Current Fleet Type: ${fleet.fleetType || 'unknown'}
- Current Instance Types: ${fleet.instanceTypes?.join(', ') || 'unknown'}
- Current Monthly Cost Estimate: $${currentCosts.total.monthlyOperational.toFixed(2)}

Cost Breakdown:
- Compute: $${currentCosts.compute.monthlyCost.toFixed(2)}/month
- Storage: $${currentCosts.storage.monthlyCost.toFixed(2)}/month
- Data Transfer: $${currentCosts.dataTransfer.monthlyCost.toFixed(2)}/month
- GameLift Services: $${currentCosts.gameliftServices.total.toFixed(2)}/month

Provide 5-7 specific cost optimization recommendations. For each recommendation:
1. Title: Brief, actionable title
2. Description: Detailed explanation (2-3 sentences)
3. Priority: high, medium, or low
4. Estimated Savings: Realistic monthly dollar amount
5. Implementation: Concrete steps to implement

Focus on:
- Network bandwidth optimization (compression, delta updates)
- Session management efficiency (graceful shutdowns, session packing)
- Auto-scaling configuration (scale down aggressively during low traffic)
- Data transfer reduction strategies
- Resource utilization improvements
- GameLift FleetIQ optimization

Return a JSON array of recommendations.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in AWS GameLift cost optimization. Provide practical, specific recommendations in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);
    return parsed.recommendations || [];
  } catch (error) {
    console.error('[Cost Scan] AI analysis error:', error);
    
    // Fallback recommendations if AI fails
    return [
      {
        title: 'Enable Network Compression',
        description: 'Implement data compression for network traffic to reduce bandwidth usage by 40-60%. Use protocols like Protocol Buffers or MessagePack instead of JSON.',
        priority: 'high' as const,
        estimatedSavings: currentCosts.dataTransfer.monthlyCost * 0.5,
        implementation: 'Replace JSON serialization with Protocol Buffers. Enable gzip compression for large payloads.',
      },
      {
        title: 'Optimize Auto-Scaling Rules',
        description: 'Configure aggressive scale-down policies during off-peak hours. Reduce minimum instance count and increase target utilization.',
        priority: 'high' as const,
        estimatedSavings: currentCosts.compute.monthlyCost * 0.25,
        implementation: 'Set target tracking to 70% CPU utilization. Configure scale-in cooldown to 5 minutes. Reduce minimum capacity to 1 instance.',
      },
      {
        title: 'Implement Session Packing',
        description: 'Maximize players per instance by implementing efficient session management. Pack multiple game sessions onto single instances when possible.',
        priority: 'medium' as const,
        estimatedSavings: currentCosts.compute.monthlyCost * 0.2,
        implementation: 'Use GameLift FleetIQ for automatic bin-packing. Configure flexible player counts per session.',
      },
    ];
  }
}

function calculateOptimizationScore(
  currentCosts: any,
  alternatives: any[],
  recommendations: any[]
): number {
  let score = 50; // Base score

  // Factor 1: Potential savings from alternatives (0-30 points)
  const maxSavings = Math.max(...alternatives.map(a => a.savingsPercentage), 0);
  score += Math.min(30, maxSavings);

  // Factor 2: Number of high-priority recommendations (0-20 points)
  const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;
  score += Math.min(20, highPriorityCount * 5);

  return Math.min(100, Math.round(score));
}

function identifyCostDrivers(costs: any): string[] {
  const drivers = [];
  const total = costs.total.monthlyOperational;

  if (costs.compute.monthlyCost / total > 0.6) {
    drivers.push('Compute costs are the primary driver (>60% of total)');
  }

  if (costs.dataTransfer.monthlyCost / total > 0.2) {
    drivers.push('Data transfer costs are significant (>20% of total)');
  }

  if (costs.gameliftServices.total / total > 0.15) {
    drivers.push('GameLift service costs are notable (>15% of total)');
  }

  return drivers.length > 0 ? drivers : ['Costs are well-distributed across services'];
}

function identifyQuickWins(recommendations: any[]): string[] {
  return recommendations
    .filter(r => r.priority === 'high')
    .slice(0, 3)
    .map(r => r.title);
}

function identifyLongTermOptimizations(recommendations: any[]): string[] {
  return recommendations
    .filter(r => r.priority === 'medium' || r.priority === 'low')
    .slice(0, 3)
    .map(r => r.title);
}

function getSmallerInstanceType(currentType: string): string | null {
  const sizeMap: Record<string, string | null> = {
    'c5.4xlarge': 'c5.2xlarge',
    'c5.2xlarge': 'c5.xlarge',
    'c5.xlarge': 'c5.large',
    'c5.large': null,
    'c6g.4xlarge': 'c6g.2xlarge',
    'c6g.2xlarge': 'c6g.xlarge',
    'c6g.xlarge': 'c6g.large',
    'c6g.large': null,
    'm5.4xlarge': 'm5.2xlarge',
    'm5.2xlarge': 'm5.xlarge',
    'm5.xlarge': 'm5.large',
    'm5.large': null,
  };

  return sizeMap[currentType] || null;
}
