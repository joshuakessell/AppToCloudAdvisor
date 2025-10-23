// Cost calculation engine for AWS GameLift deployments
import { storage } from './storage';
import type { PricingTable } from '@shared/schema';

export interface CostParameters {
  concurrentPlayers: number;
  sessionDurationHours: number;
  regionsCount: number;
  instanceType: string;
  fleetType: 'spot' | 'on-demand';
  storageGB: number; // Game build storage
  monthlyDataTransferGB: number; // Data transfer across regions
}

export interface CostBreakdown {
  compute: {
    hourlyRate: number;
    instancesNeeded: number;
    monthlyHours: number;
    monthlyCost: number;
  };
  storage: {
    sizeGB: number;
    monthlyCost: number;
  };
  dataTransfer: {
    monthlyGB: number;
    monthlyCost: number;
  };
  gameliftServices: {
    matchmakingCost: number;
    monitoringCost: number;
    total: number;
  };
  total: {
    initialSetup: number;
    monthlyOperational: number;
  };
}

// Calculate number of instances needed based on player count
function calculateInstancesNeeded(
  concurrentPlayers: number,
  playersPerInstance: number = 50 // Conservative estimate
): number {
  return Math.ceil(concurrentPlayers / playersPerInstance);
}

// Get pricing for a specific instance type and region
async function getInstancePricing(
  instanceType: string,
  region: string
): Promise<number | null> {
  const pricing = await storage.getPricingByServiceAndRegion('ec2_instance', region);
  
  if (!pricing || !Array.isArray(pricing.pricingData)) {
    return null;
  }
  
  const instanceData = pricing.pricingData.find(
    (item: any) => item.instanceType === instanceType
  );
  
  return instanceData?.hourlyRate || null;
}

// Get data transfer pricing
async function getDataTransferPricing(): Promise<any> {
  const pricing = await storage.getPricingByServiceAndRegion('data_transfer', 'global');
  return pricing?.pricingData || {};
}

// Get storage pricing
async function getStoragePricing(): Promise<any> {
  const pricing = await storage.getPricingByServiceAndRegion('storage', 'global');
  return pricing?.pricingData || {};
}

// Get GameLift service pricing
async function getGameLiftServicePricing(): Promise<any> {
  const pricing = await storage.getPricingByServiceAndRegion('gamelift_services', 'global');
  return pricing?.pricingData || {};
}

// Main cost calculation function
export async function calculateCosts(
  params: CostParameters,
  region: string = 'us-east-1'
): Promise<CostBreakdown> {
  // Get pricing data
  const instanceHourlyRate = await getInstancePricing(params.instanceType, region);
  if (!instanceHourlyRate) {
    throw new Error(`Pricing not found for instance type ${params.instanceType} in ${region}`);
  }
  
  const dataTransferPricing = await getDataTransferPricing();
  const storagePricing = await getStoragePricing();
  const gameliftPricing = await getGameLiftServicePricing();
  
  // Calculate compute costs based on actual usage
  const instancesNeeded = calculateInstancesNeeded(params.concurrentPlayers);
  
  // Estimate actual monthly usage hours based on session duration and player behavior
  // Assumptions:
  // - Average 30 days per month
  // - Players play daily sessions
  // - Servers scale down when not in use (with some baseline overhead)
  const daysPerMonth = 30;
  const peakHoursPerDay = 8; // Assuming peak traffic 8 hours/day
  const baselineHoursPerDay = 24 - peakHoursPerDay; // Off-peak hours with minimal instances
  const baselineInstanceRatio = 0.2; // Keep 20% of instances running off-peak
  
  // Peak hours: full instance count running
  const peakHoursPerMonth = peakHoursPerDay * daysPerMonth;
  const peakCost = instancesNeeded * peakHoursPerMonth;
  
  // Off-peak hours: baseline instance count
  const offPeakHoursPerMonth = baselineHoursPerDay * daysPerMonth;
  const offPeakCost = (instancesNeeded * baselineInstanceRatio) * offPeakHoursPerMonth;
  
  // Session duration affects how long instances stay allocated
  // Longer sessions = more stable instance count
  const sessionDurationMultiplier = Math.min(1 + (params.sessionDurationHours / 10), 1.5); // Max 1.5x
  
  const monthlyHours = peakCost + offPeakCost;
  const adjustedMonthlyHours = monthlyHours * sessionDurationMultiplier;
  
  const spotDiscount = params.fleetType === 'spot' ? 0.7 : 1.0; // 30% discount for spot
  const computeHourlyRate = instanceHourlyRate * spotDiscount;
  const computeMonthlyCost = computeHourlyRate * adjustedMonthlyHours * params.regionsCount;
  
  // Calculate storage costs
  const storageMonthlyRate = storagePricing.s3Standard || 0.023; // per GB/month
  const storageMonthlyCost = params.storageGB * storageMonthlyRate * params.regionsCount;
  
  // Calculate data transfer costs
  const dataTransferRate = dataTransferPricing.internetOut || 0.09; // per GB
  const dataTransferMonthlyCost = params.monthlyDataTransferGB * dataTransferRate;
  
  // Calculate GameLift service costs
  const matchmakingCost = gameliftPricing.flexMatch || 0;
  const monitoringCost = gameliftPricing.monitoring || 0;
  const gameliftServiceTotal = matchmakingCost + monitoringCost;
  
  // Initial setup costs (one-time)
  const initialSetup = instancesNeeded * 10; // Rough estimate for setup overhead
  
  // Total monthly operational costs
  const monthlyOperational = 
    computeMonthlyCost +
    storageMonthlyCost +
    dataTransferMonthlyCost +
    gameliftServiceTotal;
  
  return {
    compute: {
      hourlyRate: computeHourlyRate,
      instancesNeeded,
      monthlyHours: adjustedMonthlyHours,
      monthlyCost: computeMonthlyCost,
    },
    storage: {
      sizeGB: params.storageGB,
      monthlyCost: storageMonthlyCost,
    },
    dataTransfer: {
      monthlyGB: params.monthlyDataTransferGB,
      monthlyCost: dataTransferMonthlyCost,
    },
    gameliftServices: {
      matchmakingCost,
      monitoringCost,
      total: gameliftServiceTotal,
    },
    total: {
      initialSetup,
      monthlyOperational,
    },
  };
}

// Generate multiple cost scenarios for different traffic levels
export async function generateCostScenarios(
  baseParams: Partial<CostParameters>,
  region: string = 'us-east-1'
): Promise<{ scenario: string; params: CostParameters; costs: CostBreakdown }[]> {
  const scenarios = [
    {
      name: 'Low Traffic',
      concurrentPlayers: 100,
      sessionDurationHours: 1,
    },
    {
      name: 'Medium Traffic',
      concurrentPlayers: 500,
      sessionDurationHours: 2,
    },
    {
      name: 'High Traffic',
      concurrentPlayers: 2000,
      sessionDurationHours: 3,
    },
    {
      name: 'Peak Traffic',
      concurrentPlayers: 5000,
      sessionDurationHours: 2,
    },
  ];
  
  const results = [];
  
  for (const scenario of scenarios) {
    const params: CostParameters = {
      concurrentPlayers: scenario.concurrentPlayers,
      sessionDurationHours: scenario.sessionDurationHours,
      regionsCount: baseParams.regionsCount || 1,
      instanceType: baseParams.instanceType || 'c5.large',
      fleetType: baseParams.fleetType || 'on-demand',
      storageGB: baseParams.storageGB || 10,
      monthlyDataTransferGB: baseParams.monthlyDataTransferGB || 100,
    };
    
    const costs = await calculateCosts(params, region);
    
    results.push({
      scenario: scenario.name,
      params,
      costs,
    });
  }
  
  return results;
}

// Calculate cost per player (unit economics)
export function calculateCostPerPlayer(
  totalMonthlyCost: number,
  monthlyActiveUsers: number
): number {
  return monthlyActiveUsers > 0 ? totalMonthlyCost / monthlyActiveUsers : 0;
}

// Estimate monthly active users from concurrent players
export function estimateMonthlyActiveUsers(
  concurrentPlayers: number,
  concurrencyRatio: number = 0.1 // 10% typical concurrency
): number {
  return Math.ceil(concurrentPlayers / concurrencyRatio);
}
