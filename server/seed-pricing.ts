// Seed pricing data into the database
import { storage } from "./storage";
import {
  EC2_INSTANCE_PRICING,
  DATA_TRANSFER_PRICING,
  STORAGE_PRICING,
  GAMELIFT_SERVICE_COSTS,
} from "./pricing-service";

export async function seedPricingData() {
  console.log('[Pricing] Seeding AWS GameLift pricing data...');
  
  try {
    // Seed EC2 instance pricing for all regions
    for (const [region, instances] of Object.entries(EC2_INSTANCE_PRICING)) {
      await storage.createPricingTable({
        serviceType: 'ec2_instance',
        region,
        pricingData: instances,
      });
      console.log(`[Pricing] Seeded EC2 instance pricing for ${region}: ${instances.length} instance types`);
    }
    
    // Seed data transfer pricing
    await storage.createPricingTable({
      serviceType: 'data_transfer',
      region: 'global',
      pricingData: DATA_TRANSFER_PRICING,
    });
    console.log('[Pricing] Seeded data transfer pricing');
    
    // Seed storage pricing
    await storage.createPricingTable({
      serviceType: 'storage',
      region: 'global',
      pricingData: STORAGE_PRICING,
    });
    console.log('[Pricing] Seeded storage pricing');
    
    // Seed GameLift service costs
    await storage.createPricingTable({
      serviceType: 'gamelift_services',
      region: 'global',
      pricingData: GAMELIFT_SERVICE_COSTS,
    });
    console.log('[Pricing] Seeded GameLift service costs');
    
    console.log('[Pricing] ✓ All pricing data seeded successfully');
  } catch (error) {
    console.error('[Pricing] Error seeding pricing data:', error);
    throw error;
  }
}

// Check if a specific pricing category exists
async function pricingCategoryExists(serviceType: string, region: string): Promise<boolean> {
  const existing = await storage.getPricingByServiceAndRegion(serviceType, region);
  return existing !== undefined;
}

// Check if pricing data needs refresh (older than 30 days)
export async function isPricingDataStale(serviceType: string, region: string): Promise<boolean> {
  const pricing = await storage.getPricingByServiceAndRegion(serviceType, region);
  if (!pricing) return true;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return pricing.lastUpdated < thirtyDaysAgo;
}

// Refresh stale pricing data
async function refreshStalePricing() {
  console.log('[Pricing] Refreshing stale pricing data...');
  
  // Get all existing tables
  const existingTables = await storage.listPricingTables();
  
  // Update stale EC2 instance pricing
  for (const [region, instances] of Object.entries(EC2_INSTANCE_PRICING)) {
    const existing = await storage.getPricingByServiceAndRegion('ec2_instance', region);
    if (existing && await isPricingDataStale('ec2_instance', region)) {
      await storage.updatePricingTable(existing.id, {
        pricingData: instances,
      });
      console.log(`[Pricing] Refreshed EC2 instance pricing for ${region}`);
    }
  }
  
  // Update other pricing categories
  const globalCategories = [
    { type: 'data_transfer', data: DATA_TRANSFER_PRICING },
    { type: 'storage', data: STORAGE_PRICING },
    { type: 'gamelift_services', data: GAMELIFT_SERVICE_COSTS },
  ];
  
  for (const category of globalCategories) {
    const existing = await storage.getPricingByServiceAndRegion(category.type, 'global');
    if (existing && await isPricingDataStale(category.type, 'global')) {
      await storage.updatePricingTable(existing.id, {
        pricingData: category.data,
      });
      console.log(`[Pricing] Refreshed ${category.type} pricing`);
    }
  }
}

// Initialize pricing data with comprehensive coverage
export async function initializePricingData() {
  console.log('[Pricing] Checking AWS GameLift pricing data...');
  
  let missingCount = 0;
  let staleCount = 0;
  
  // Check and seed EC2 instance pricing for all regions
  for (const [region, instances] of Object.entries(EC2_INSTANCE_PRICING)) {
    const exists = await pricingCategoryExists('ec2_instance', region);
    
    if (!exists) {
      await storage.createPricingTable({
        serviceType: 'ec2_instance',
        region,
        pricingData: instances,
      });
      console.log(`[Pricing] Seeded EC2 instance pricing for ${region}: ${instances.length} instance types`);
      missingCount++;
    } else if (await isPricingDataStale('ec2_instance', region)) {
      staleCount++;
    }
  }
  
  // Check and seed global pricing categories
  const globalCategories = [
    { type: 'data_transfer', data: DATA_TRANSFER_PRICING, desc: 'data transfer pricing' },
    { type: 'storage', data: STORAGE_PRICING, desc: 'storage pricing' },
    { type: 'gamelift_services', data: GAMELIFT_SERVICE_COSTS, desc: 'GameLift service costs' },
  ];
  
  for (const category of globalCategories) {
    const exists = await pricingCategoryExists(category.type, 'global');
    
    if (!exists) {
      await storage.createPricingTable({
        serviceType: category.type,
        region: 'global',
        pricingData: category.data,
      });
      console.log(`[Pricing] Seeded ${category.desc}`);
      missingCount++;
    } else if (await isPricingDataStale(category.type, 'global')) {
      staleCount++;
    }
  }
  
  // Refresh stale data if any
  if (staleCount > 0) {
    console.log(`[Pricing] Found ${staleCount} stale pricing tables, refreshing...`);
    await refreshStalePricing();
  }
  
  // Summary
  if (missingCount === 0 && staleCount === 0) {
    console.log('[Pricing] ✓ All pricing data is current');
  } else if (missingCount > 0) {
    console.log(`[Pricing] ✓ Seeded ${missingCount} missing pricing tables`);
  }
}
