import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type Page } from '../schema';
import { eq } from 'drizzle-orm';

export const getPages = async (): Promise<Page[]> => {
  try {
    // Fetch all published pages from the database
    const results = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.is_published, true))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    throw error;
  }
};