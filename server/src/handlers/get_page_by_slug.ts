import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type GetPageBySlugInput, type Page } from '../schema';
import { eq, and } from 'drizzle-orm';

export const getPageBySlug = async (input: GetPageBySlugInput): Promise<Page | null> => {
  try {
    // Query for published page with matching slug
    const result = await db.select()
      .from(pagesTable)
      .where(
        and(
          eq(pagesTable.slug, input.slug),
          eq(pagesTable.is_published, true)
        )
      )
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    const page = result[0];
    return {
      ...page,
      // No numeric conversions needed for pages table
    };
  } catch (error) {
    console.error('Failed to get page by slug:', error);
    throw error;
  }
};