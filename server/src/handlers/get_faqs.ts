import { db } from '../db';
import { faqTable } from '../db/schema';
import { type FAQ } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getFaqs = async (): Promise<FAQ[]> => {
  try {
    // Fetch all active FAQs ordered by order_index
    const results = await db.select()
      .from(faqTable)
      .where(eq(faqTable.is_active, true))
      .orderBy(asc(faqTable.order_index))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(faq => ({
      ...faq,
      // No numeric columns in FAQ table that need conversion
    }));
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
    throw error;
  }
};