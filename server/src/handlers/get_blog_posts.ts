import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type BlogPost, type PaginationInput } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getBlogPosts = async (input?: PaginationInput): Promise<BlogPost[]> => {
  try {
    // Apply default pagination values if input is not provided
    const page = input?.page || 1;
    const limit = input?.limit || 10;
    const offset = (page - 1) * limit;

    // Build the query to get published blog posts, ordered by published_at (most recent first)
    const results = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.is_published, true))
      .orderBy(desc(blogPostsTable.published_at))
      .limit(limit)
      .offset(offset)
      .execute();

    // Return the results - no numeric conversions needed for blog posts
    return results;
  } catch (error) {
    console.error('Failed to get blog posts:', error);
    throw error;
  }
};