import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type Service } from '../schema';
import { eq, asc } from 'drizzle-orm';

export async function getServices(): Promise<Service[]> {
  try {
    // Fetch all active services ordered by order_index
    const results = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.is_active, true))
      .orderBy(asc(servicesTable.order_index))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(service => ({
      ...service,
      price: service.price ? parseFloat(service.price) : null // Convert numeric field
    }));
  } catch (error) {
    console.error('Failed to fetch services:', error);
    throw error;
  }
}