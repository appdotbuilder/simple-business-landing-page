import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type CreateServiceInput, type Service } from '../schema';

export const createService = async (input: CreateServiceInput): Promise<Service> => {
  try {
    // Insert service record
    const result = await db.insert(servicesTable)
      .values({
        title: input.title,
        description: input.description,
        icon: input.icon,
        price: input.price?.toString(), // Convert number to string for numeric column
        is_active: input.is_active, // Boolean column - no conversion needed
        order_index: input.order_index // Integer column - no conversion needed
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const service = result[0];
    return {
      ...service,
      price: service.price ? parseFloat(service.price) : null // Convert string back to number or null
    };
  } catch (error) {
    console.error('Service creation failed:', error);
    throw error;
  }
};