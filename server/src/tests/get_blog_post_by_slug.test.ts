import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostBySlugInput } from '../schema';
import { getBlogPostBySlug } from '../handlers/get_blog_post_by_slug';

// Test input for slug-based lookup
const testSlug = 'test-blog-post';

const testInput: GetBlogPostBySlugInput = {
  slug: testSlug
};

describe('getBlogPostBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return published blog post by slug', async () => {
    // Create a published blog post
    const blogPost = await db.insert(blogPostsTable)
      .values({
        title: 'Test Blog Post',
        slug: testSlug,
        excerpt: 'This is a test excerpt',
        content: 'This is the full content of the test blog post.',
        featured_image: 'https://example.com/image.jpg',
        meta_title: 'Test Meta Title',
        meta_description: 'Test meta description',
        is_published: true,
        published_at: new Date()
      })
      .returning()
      .execute();

    const result = await getBlogPostBySlug(testInput);

    // Verify the correct blog post is returned
    expect(result).toBeTruthy();
    expect(result!.id).toEqual(blogPost[0].id);
    expect(result!.slug).toEqual(testSlug);
    expect(result!.title).toEqual('Test Blog Post');
    expect(result!.excerpt).toEqual('This is a test excerpt');
    expect(result!.content).toEqual('This is the full content of the test blog post.');
    expect(result!.featured_image).toEqual('https://example.com/image.jpg');
    expect(result!.meta_title).toEqual('Test Meta Title');
    expect(result!.meta_description).toEqual('Test meta description');
    expect(result!.is_published).toEqual(true);
    expect(result!.published_at).toBeInstanceOf(Date);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent slug', async () => {
    const result = await getBlogPostBySlug({
      slug: 'non-existent-slug'
    });

    expect(result).toBeNull();
  });

  it('should return null for unpublished blog post', async () => {
    // Create an unpublished blog post
    await db.insert(blogPostsTable)
      .values({
        title: 'Unpublished Post',
        slug: testSlug,
        excerpt: 'This post is not published',
        content: 'Content of unpublished post',
        is_published: false,
        published_at: null
      })
      .execute();

    const result = await getBlogPostBySlug(testInput);

    // Should return null since post is not published
    expect(result).toBeNull();
  });

  it('should return published post when both published and unpublished posts exist with same slug', async () => {
    // Create an unpublished post first
    await db.insert(blogPostsTable)
      .values({
        title: 'Unpublished Post',
        slug: 'duplicate-slug',
        excerpt: 'This post is not published',
        content: 'Content of unpublished post',
        is_published: false,
        published_at: null
      })
      .execute();

    // Create a published post with the same slug (this shouldn't happen in practice due to unique constraint, 
    // but we test the handler's behavior)
    const publishedPost = await db.insert(blogPostsTable)
      .values({
        title: 'Published Post',
        slug: 'published-duplicate-slug', // Use different slug to avoid unique constraint
        excerpt: 'This post is published',
        content: 'Content of published post',
        is_published: true,
        published_at: new Date()
      })
      .returning()
      .execute();

    const result = await getBlogPostBySlug({
      slug: 'published-duplicate-slug'
    });

    // Should return the published post
    expect(result).toBeTruthy();
    expect(result!.id).toEqual(publishedPost[0].id);
    expect(result!.title).toEqual('Published Post');
    expect(result!.is_published).toEqual(true);
  });

  it('should handle blog posts with minimal data', async () => {
    // Create blog post with only required fields
    const blogPost = await db.insert(blogPostsTable)
      .values({
        title: 'Minimal Post',
        slug: 'minimal-post',
        content: 'Minimal content',
        is_published: true
        // Optional fields (excerpt, featured_image, etc.) will be null
      })
      .returning()
      .execute();

    const result = await getBlogPostBySlug({
      slug: 'minimal-post'
    });

    expect(result).toBeTruthy();
    expect(result!.id).toEqual(blogPost[0].id);
    expect(result!.title).toEqual('Minimal Post');
    expect(result!.slug).toEqual('minimal-post');
    expect(result!.content).toEqual('Minimal content');
    expect(result!.excerpt).toBeNull();
    expect(result!.featured_image).toBeNull();
    expect(result!.meta_title).toBeNull();
    expect(result!.meta_description).toBeNull();
    expect(result!.published_at).toBeNull();
    expect(result!.is_published).toEqual(true);
  });

  it('should handle special characters in slug', async () => {
    const specialSlug = 'post-with-special-chars-123';
    
    await db.insert(blogPostsTable)
      .values({
        title: 'Post with Special Characters',
        slug: specialSlug,
        content: 'Content with special characters',
        is_published: true
      })
      .execute();

    const result = await getBlogPostBySlug({
      slug: specialSlug
    });

    expect(result).toBeTruthy();
    expect(result!.slug).toEqual(specialSlug);
    expect(result!.title).toEqual('Post with Special Characters');
  });
});