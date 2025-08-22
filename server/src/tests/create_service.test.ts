import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type CreateServiceInput } from '../schema';
import { createService } from '../handlers/create_service';
import { eq, gte, between, and } from 'drizzle-orm';

// Simple test input with all required fields
const testInput: CreateServiceInput = {
  title: 'Website Development',
  description: 'Professional website development services for your business',
  icon: 'fas fa-code',
  price: 2500000,
  is_active: true,
  order_index: 1
};

// Test input without optional fields
const minimalInput: CreateServiceInput = {
  title: 'Basic Consultation',
  description: 'Free consultation service for potential clients',
  icon: null,
  price: null,
  is_active: true,
  order_index: 0
};

describe('createService', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a service with all fields', async () => {
    const result = await createService(testInput);

    // Basic field validation
    expect(result.title).toEqual('Website Development');
    expect(result.description).toEqual(testInput.description);
    expect(result.icon).toEqual('fas fa-code');
    expect(result.price).toEqual(2500000);
    expect(typeof result.price).toBe('number');
    expect(result.is_active).toEqual(true);
    expect(result.order_index).toEqual(1);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a service with null optional fields', async () => {
    const result = await createService(minimalInput);

    // Basic field validation
    expect(result.title).toEqual('Basic Consultation');
    expect(result.description).toEqual(minimalInput.description);
    expect(result.icon).toBeNull();
    expect(result.price).toBeNull();
    expect(result.is_active).toEqual(true);
    expect(result.order_index).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save service to database', async () => {
    const result = await createService(testInput);

    // Query using proper drizzle syntax
    const services = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, result.id))
      .execute();

    expect(services).toHaveLength(1);
    expect(services[0].title).toEqual('Website Development');
    expect(services[0].description).toEqual(testInput.description);
    expect(services[0].icon).toEqual('fas fa-code');
    expect(parseFloat(services[0].price!)).toEqual(2500000);
    expect(services[0].is_active).toEqual(true);
    expect(services[0].order_index).toEqual(1);
    expect(services[0].created_at).toBeInstanceOf(Date);
    expect(services[0].updated_at).toBeInstanceOf(Date);
  });

  it('should save service with null values to database', async () => {
    const result = await createService(minimalInput);

    // Query using proper drizzle syntax
    const services = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, result.id))
      .execute();

    expect(services).toHaveLength(1);
    expect(services[0].title).toEqual('Basic Consultation');
    expect(services[0].description).toEqual(minimalInput.description);
    expect(services[0].icon).toBeNull();
    expect(services[0].price).toBeNull();
    expect(services[0].is_active).toEqual(true);
    expect(services[0].order_index).toEqual(0);
  });

  it('should query services by date range correctly', async () => {
    // Create test service
    await createService(testInput);

    // Test date filtering - demonstration of correct date handling
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Proper query building - step by step
    const services = await db.select()
      .from(servicesTable)
      .where(
        and(
          gte(servicesTable.created_at, yesterday),
          between(servicesTable.created_at, yesterday, tomorrow)
        )
      )
      .execute();

    expect(services.length).toBeGreaterThan(0);
    services.forEach(service => {
      expect(service.created_at).toBeInstanceOf(Date);
      expect(service.created_at >= yesterday).toBe(true);
      expect(service.created_at <= tomorrow).toBe(true);
    });
  });

  it('should handle different price values correctly', async () => {
    // Test with zero price
    const zeroInput: CreateServiceInput = {
      ...testInput,
      price: 0
    };

    const resultZero = await createService(zeroInput);
    expect(resultZero.price).toEqual(0);
    expect(typeof resultZero.price).toBe('number');

    // Test with decimal price
    const decimalInput: CreateServiceInput = {
      ...testInput,
      title: 'Hourly Consultation',
      price: 150000.50
    };

    const resultDecimal = await createService(decimalInput);
    expect(resultDecimal.price).toEqual(150000.50);
    expect(typeof resultDecimal.price).toBe('number');
  });

  it('should create services with different order indices', async () => {
    // Create multiple services with different order indices
    const service1 = await createService({
      ...testInput,
      title: 'Service 1',
      order_index: 3
    });

    const service2 = await createService({
      ...testInput,
      title: 'Service 2',
      order_index: 1
    });

    expect(service1.order_index).toEqual(3);
    expect(service2.order_index).toEqual(1);

    // Verify both services exist in database
    const allServices = await db.select()
      .from(servicesTable)
      .execute();

    expect(allServices).toHaveLength(2);
    const orderIndices = allServices.map(s => s.order_index).sort();
    expect(orderIndices).toEqual([1, 3]);
  });
});