import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput, type BlogPost } from '../schema';

export const createBlogPost = async (input: CreateBlogPostInput): Promise<BlogPost> => {
  try {
    // Set published_at timestamp if the post is published
    const publishedAt = input.is_published ? new Date() : null;

    // Insert blog post record
    const result = await db.insert(blogPostsTable)
      .values({
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        featured_image: input.featured_image,
        meta_title: input.meta_title,
        meta_description: input.meta_description,
        is_published: input.is_published,
        published_at: publishedAt
      })
      .returning()
      .execute();

    // Return the created blog post
    const blogPost = result[0];
    return blogPost;
  } catch (error) {
    console.error('Blog post creation failed:', error);
    throw error;
  }
};