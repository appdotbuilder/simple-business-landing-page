import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostBySlugInput, type BlogPost } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function getBlogPostBySlug(input: GetBlogPostBySlugInput): Promise<BlogPost | null> {
  try {
    // Query for published blog post with matching slug
    const results = await db.select()
      .from(blogPostsTable)
      .where(
        and(
          eq(blogPostsTable.slug, input.slug),
          eq(blogPostsTable.is_published, true)
        )
      )
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    const blogPost = results[0];
    
    // Convert numeric fields back to numbers and return
    return {
      ...blogPost,
      // No numeric fields to convert in blog posts schema
    };
  } catch (error) {
    console.error('Failed to fetch blog post by slug:', error);
    throw error;
  }
}