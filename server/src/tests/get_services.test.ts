import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable } from '../db/schema';
import { getServices } from '../handlers/get_services';

describe('getServices', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no services exist', async () => {
    const result = await getServices();
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should fetch all active services ordered by order_index', async () => {
    // Create test services with different order_index values
    await db.insert(servicesTable).values([
      {
        title: 'Service C',
        description: 'Third service',
        icon: 'icon-c',
        price: '99.99',
        is_active: true,
        order_index: 3
      },
      {
        title: 'Service A',
        description: 'First service',
        icon: 'icon-a',
        price: '49.99',
        is_active: true,
        order_index: 1
      },
      {
        title: 'Service B',
        description: 'Second service',
        icon: 'icon-b',
        price: '79.99',
        is_active: true,
        order_index: 2
      }
    ]).execute();

    const result = await getServices();

    expect(result).toHaveLength(3);
    
    // Verify services are ordered by order_index
    expect(result[0].title).toEqual('Service A');
    expect(result[0].order_index).toEqual(1);
    expect(result[1].title).toEqual('Service B');
    expect(result[1].order_index).toEqual(2);
    expect(result[2].title).toEqual('Service C');
    expect(result[2].order_index).toEqual(3);
  });

  it('should only return active services', async () => {
    // Create both active and inactive services
    await db.insert(servicesTable).values([
      {
        title: 'Active Service',
        description: 'This service is active',
        icon: 'icon-active',
        price: '50.00',
        is_active: true,
        order_index: 1
      },
      {
        title: 'Inactive Service',
        description: 'This service is inactive',
        icon: 'icon-inactive',
        price: '60.00',
        is_active: false,
        order_index: 2
      }
    ]).execute();

    const result = await getServices();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Active Service');
    expect(result[0].is_active).toBe(true);
  });

  it('should properly convert numeric price field', async () => {
    // Create service with numeric price
    await db.insert(servicesTable).values({
      title: 'Priced Service',
      description: 'Service with price',
      icon: 'icon-priced',
      price: '123.45',
      is_active: true,
      order_index: 1
    }).execute();

    const result = await getServices();

    expect(result).toHaveLength(1);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].price).toEqual(123.45);
  });

  it('should handle null price field correctly', async () => {
    // Create service without price
    await db.insert(servicesTable).values({
      title: 'Free Service',
      description: 'Service without price',
      icon: 'icon-free',
      price: null,
      is_active: true,
      order_index: 1
    }).execute();

    const result = await getServices();

    expect(result).toHaveLength(1);
    expect(result[0].price).toBeNull();
  });

  it('should include all service fields in response', async () => {
    // Create service with all fields populated
    await db.insert(servicesTable).values({
      title: 'Complete Service',
      description: 'Service with all fields',
      icon: 'icon-complete',
      price: '199.99',
      is_active: true,
      order_index: 5
    }).execute();

    const result = await getServices();

    expect(result).toHaveLength(1);
    
    const service = result[0];
    expect(service.id).toBeDefined();
    expect(service.title).toEqual('Complete Service');
    expect(service.description).toEqual('Service with all fields');
    expect(service.icon).toEqual('icon-complete');
    expect(service.price).toEqual(199.99);
    expect(service.is_active).toBe(true);
    expect(service.order_index).toEqual(5);
    expect(service.created_at).toBeInstanceOf(Date);
    expect(service.updated_at).toBeInstanceOf(Date);
  });

  it('should handle services with same order_index consistently', async () => {
    // Create services with same order_index
    await db.insert(servicesTable).values([
      {
        title: 'Service X',
        description: 'First service with order 1',
        icon: 'icon-x',
        price: '10.00',
        is_active: true,
        order_index: 1
      },
      {
        title: 'Service Y',
        description: 'Second service with order 1',
        icon: 'icon-y',
        price: '20.00',
        is_active: true,
        order_index: 1
      }
    ]).execute();

    const result = await getServices();

    expect(result).toHaveLength(2);
    // Both services should have order_index 1
    result.forEach(service => {
      expect(service.order_index).toEqual(1);
    });
  });
});