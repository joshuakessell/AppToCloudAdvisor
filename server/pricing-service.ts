// AWS GameLift Pricing Service
// Static pricing data for EC2 instances, GameLift services, and data transfer
// Prices are approximate and should be updated periodically

export interface InstancePricing {
  instanceType: string;
  vcpus: number;
  memory: string;
  hourlyRate: number; // USD per hour
  gameLiftMultiplier: number; // GameLift adds this multiplier to EC2 cost
}

export interface DataTransferPricing {
  type: string; // 'internet_out', 'inter_region', 'intra_region'
  pricePerGB: number;
}

export interface StoragePricing {
  type: string; // 'build_storage', 'script_storage'
  pricePerGBMonth: number;
}

// EC2 Instance pricing by region (us-east-1 baseline)
// Common GameLift instance families: c5, c6g (compute-optimized for game servers)
export const EC2_INSTANCE_PRICING: Record<string, InstancePricing[]> = {
  'us-east-1': [
    // C5 family - Compute Optimized
    { instanceType: 'c5.large', vcpus: 2, memory: '4 GiB', hourlyRate: 0.085, gameLiftMultiplier: 1.5 },
    { instanceType: 'c5.xlarge', vcpus: 4, memory: '8 GiB', hourlyRate: 0.17, gameLiftMultiplier: 1.5 },
    { instanceType: 'c5.2xlarge', vcpus: 8, memory: '16 GiB', hourlyRate: 0.34, gameLiftMultiplier: 1.5 },
    { instanceType: 'c5.4xlarge', vcpus: 16, memory: '32 GiB', hourlyRate: 0.68, gameLiftMultiplier: 1.5 },
    
    // C6g family - Graviton2, better price/performance
    { instanceType: 'c6g.large', vcpus: 2, memory: '4 GiB', hourlyRate: 0.068, gameLiftMultiplier: 1.5 },
    { instanceType: 'c6g.xlarge', vcpus: 4, memory: '8 GiB', hourlyRate: 0.136, gameLiftMultiplier: 1.5 },
    { instanceType: 'c6g.2xlarge', vcpus: 8, memory: '16 GiB', hourlyRate: 0.272, gameLiftMultiplier: 1.5 },
    { instanceType: 'c6g.4xlarge', vcpus: 16, memory: '32 GiB', hourlyRate: 0.544, gameLiftMultiplier: 1.5 },
    
    // M5 family - General Purpose (balanced compute/memory)
    { instanceType: 'm5.large', vcpus: 2, memory: '8 GiB', hourlyRate: 0.096, gameLiftMultiplier: 1.5 },
    { instanceType: 'm5.xlarge', vcpus: 4, memory: '16 GiB', hourlyRate: 0.192, gameLiftMultiplier: 1.5 },
    { instanceType: 'm5.2xlarge', vcpus: 8, memory: '32 GiB', hourlyRate: 0.384, gameLiftMultiplier: 1.5 },
  ],
  
  'us-west-2': [
    { instanceType: 'c5.large', vcpus: 2, memory: '4 GiB', hourlyRate: 0.085, gameLiftMultiplier: 1.5 },
    { instanceType: 'c5.xlarge', vcpus: 4, memory: '8 GiB', hourlyRate: 0.17, gameLiftMultiplier: 1.5 },
    { instanceType: 'c5.2xlarge', vcpus: 8, memory: '16 GiB', hourlyRate: 0.34, gameLiftMultiplier: 1.5 },
    { instanceType: 'c6g.large', vcpus: 2, memory: '4 GiB', hourlyRate: 0.068, gameLiftMultiplier: 1.5 },
    { instanceType: 'c6g.xlarge', vcpus: 4, memory: '8 GiB', hourlyRate: 0.136, gameLiftMultiplier: 1.5 },
  ],
  
  'eu-west-1': [
    { instanceType: 'c5.large', vcpus: 2, memory: '4 GiB', hourlyRate: 0.094, gameLiftMultiplier: 1.5 },
    { instanceType: 'c5.xlarge', vcpus: 4, memory: '8 GiB', hourlyRate: 0.188, gameLiftMultiplier: 1.5 },
    { instanceType: 'c5.2xlarge', vcpus: 8, memory: '16 GiB', hourlyRate: 0.376, gameLiftMultiplier: 1.5 },
    { instanceType: 'c6g.large', vcpus: 2, memory: '4 GiB', hourlyRate: 0.075, gameLiftMultiplier: 1.5 },
    { instanceType: 'c6g.xlarge', vcpus: 4, memory: '8 GiB', hourlyRate: 0.15, gameLiftMultiplier: 1.5 },
  ],
  
  'ap-southeast-1': [
    { instanceType: 'c5.large', vcpus: 2, memory: '4 GiB', hourlyRate: 0.098, gameLiftMultiplier: 1.5 },
    { instanceType: 'c5.xlarge', vcpus: 4, memory: '8 GiB', hourlyRate: 0.196, gameLiftMultiplier: 1.5 },
    { instanceType: 'c6g.large', vcpus: 2, memory: '4 GiB', hourlyRate: 0.078, gameLiftMultiplier: 1.5 },
    { instanceType: 'c6g.xlarge', vcpus: 4, memory: '8 GiB', hourlyRate: 0.156, gameLiftMultiplier: 1.5 },
  ],
};

// Data transfer pricing (approximate, varies by volume)
export const DATA_TRANSFER_PRICING: DataTransferPricing[] = [
  { type: 'internet_out', pricePerGB: 0.09 }, // First 10TB/month
  { type: 'inter_region', pricePerGB: 0.02 }, // Between AWS regions
  { type: 'intra_region', pricePerGB: 0.01 }, // Within same region
];

// Storage pricing for game builds
export const STORAGE_PRICING: StoragePricing[] = [
  { type: 'build_storage', pricePerGBMonth: 0.10 }, // GameLift build storage
  { type: 'script_storage', pricePerGBMonth: 0.10 }, // GameLift script storage
];

// GameLift additional service costs
export const GAMELIFT_SERVICE_COSTS = {
  matchmaking: {
    pricePerRequest: 0.000001, // $0.000001 per matchmaking request
    includedRequests: 1000000, // First 1M requests free per month
  },
  flexMatch: {
    pricePerRequest: 0.000005, // Advanced matchmaking
  },
  queuePlacement: {
    pricePerRequest: 0.0, // Queue placement is free
  },
};

// Helper function to get pricing for a specific instance and region
export function getInstancePricing(instanceType: string, region: string): InstancePricing | undefined {
  const regionPricing = EC2_INSTANCE_PRICING[region] || EC2_INSTANCE_PRICING['us-east-1'];
  return regionPricing.find(p => p.instanceType === instanceType);
}

// Helper function to calculate GameLift fleet hourly cost
export function calculateGameLiftFleetCost(instanceType: string, region: string, instanceCount: number): number {
  const pricing = getInstancePricing(instanceType, region);
  if (!pricing) return 0;
  
  const ec2Cost = pricing.hourlyRate;
  const gameLiftCost = ec2Cost * pricing.gameLiftMultiplier;
  return gameLiftCost * instanceCount;
}

// Helper function to calculate monthly cost from hourly rate
export function calculateMonthlyCost(hourlyRate: number): number {
  return hourlyRate * 24 * 30; // Approximate 30-day month
}

// Helper function to estimate data transfer costs
export function calculateDataTransferCost(
  gbPerMonth: number,
  transferType: 'internet_out' | 'inter_region' | 'intra_region' = 'internet_out'
): number {
  const pricing = DATA_TRANSFER_PRICING.find(p => p.type === transferType);
  if (!pricing) return 0;
  return gbPerMonth * pricing.pricePerGB;
}

// Helper function to calculate build storage cost
export function calculateStorageCost(buildSizeGB: number): number {
  const storagePricing = STORAGE_PRICING.find(p => p.type === 'build_storage');
  if (!storagePricing) return 0;
  return buildSizeGB * storagePricing.pricePerGBMonth;
}

// Get available instance types for a region
export function getAvailableInstanceTypes(region: string): string[] {
  const regionPricing = EC2_INSTANCE_PRICING[region] || EC2_INSTANCE_PRICING['us-east-1'];
  return regionPricing.map(p => p.instanceType);
}

// Get all supported regions
export function getSupportedRegions(): string[] {
  return Object.keys(EC2_INSTANCE_PRICING);
}

// Recommend instance type based on game requirements
export function recommendInstanceType(
  concurrentPlayers: number,
  playersPerInstance: number = 20,
  memoryIntensive: boolean = false
): string {
  const requiredInstances = Math.ceil(concurrentPlayers / playersPerInstance);
  
  // For memory-intensive games, prefer m5 family
  if (memoryIntensive) {
    if (requiredInstances <= 5) return 'm5.large';
    if (requiredInstances <= 15) return 'm5.xlarge';
    return 'm5.2xlarge';
  }
  
  // For compute-intensive games, prefer c6g (better price/performance)
  if (requiredInstances <= 5) return 'c6g.large';
  if (requiredInstances <= 15) return 'c6g.xlarge';
  if (requiredInstances <= 30) return 'c6g.2xlarge';
  return 'c6g.4xlarge';
}
