import { db } from '../db';
import { productsTable } from '../db/schema';
import { type Product } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getProducts = async (): Promise<Product[]> => {
  try {
    // Fetch all active products ordered by creation date (newest first)
    const results = await db.select()
      .from(productsTable)
      .where(eq(productsTable.is_active, true))
      .orderBy(desc(productsTable.created_at))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(product => ({
      ...product,
      price: parseFloat(product.price) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};