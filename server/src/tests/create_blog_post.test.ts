import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput } from '../schema';
import { createBlogPost } from '../handlers/create_blog_post';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateBlogPostInput = {
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  excerpt: 'This is a test blog post excerpt',
  content: 'This is the full content of the test blog post with more detailed information.',
  featured_image: 'https://example.com/test-image.jpg',
  meta_title: 'Test Blog Post - SEO Title',
  meta_description: 'This is the SEO meta description for the test blog post',
  is_published: true
};

// Test input for unpublished post
const unpublishedInput: CreateBlogPostInput = {
  title: 'Draft Blog Post',
  slug: 'draft-blog-post',
  excerpt: null,
  content: 'This is a draft blog post content.',
  featured_image: null,
  meta_title: null,
  meta_description: null,
  is_published: false
};

describe('createBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a published blog post with all fields', async () => {
    const result = await createBlogPost(testInput);

    // Verify all fields are correctly set
    expect(result.title).toEqual('Test Blog Post');
    expect(result.slug).toEqual('test-blog-post');
    expect(result.excerpt).toEqual('This is a test blog post excerpt');
    expect(result.content).toEqual('This is the full content of the test blog post with more detailed information.');
    expect(result.featured_image).toEqual('https://example.com/test-image.jpg');
    expect(result.meta_title).toEqual('Test Blog Post - SEO Title');
    expect(result.meta_description).toEqual('This is the SEO meta description for the test blog post');
    expect(result.is_published).toBe(true);
    expect(result.published_at).toBeInstanceOf(Date);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an unpublished blog post with null published_at', async () => {
    const result = await createBlogPost(unpublishedInput);

    // Verify unpublished post characteristics
    expect(result.title).toEqual('Draft Blog Post');
    expect(result.slug).toEqual('draft-blog-post');
    expect(result.excerpt).toBeNull();
    expect(result.content).toEqual('This is a draft blog post content.');
    expect(result.featured_image).toBeNull();
    expect(result.meta_title).toBeNull();
    expect(result.meta_description).toBeNull();
    expect(result.is_published).toBe(false);
    expect(result.published_at).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save blog post to database correctly', async () => {
    const result = await createBlogPost(testInput);

    // Query the database to verify the post was saved
    const blogPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, result.id))
      .execute();

    expect(blogPosts).toHaveLength(1);
    const savedPost = blogPosts[0];
    
    expect(savedPost.title).toEqual('Test Blog Post');
    expect(savedPost.slug).toEqual('test-blog-post');
    expect(savedPost.excerpt).toEqual('This is a test blog post excerpt');
    expect(savedPost.content).toEqual('This is the full content of the test blog post with more detailed information.');
    expect(savedPost.featured_image).toEqual('https://example.com/test-image.jpg');
    expect(savedPost.meta_title).toEqual('Test Blog Post - SEO Title');
    expect(savedPost.meta_description).toEqual('This is the SEO meta description for the test blog post');
    expect(savedPost.is_published).toBe(true);
    expect(savedPost.published_at).toBeInstanceOf(Date);
    expect(savedPost.created_at).toBeInstanceOf(Date);
    expect(savedPost.updated_at).toBeInstanceOf(Date);
  });

  it('should handle minimal blog post with only required fields', async () => {
    const minimalInput: CreateBlogPostInput = {
      title: 'Minimal Post',
      slug: 'minimal-post',
      excerpt: null,
      content: 'Minimal content.',
      featured_image: null,
      meta_title: null,
      meta_description: null,
      is_published: false // Default value from Zod schema
    };

    const result = await createBlogPost(minimalInput);

    expect(result.title).toEqual('Minimal Post');
    expect(result.slug).toEqual('minimal-post');
    expect(result.content).toEqual('Minimal content.');
    expect(result.excerpt).toBeNull();
    expect(result.featured_image).toBeNull();
    expect(result.meta_title).toBeNull();
    expect(result.meta_description).toBeNull();
    expect(result.is_published).toBe(false);
    expect(result.published_at).toBeNull();
  });

  it('should handle unique slug constraint', async () => {
    // Create first blog post
    await createBlogPost(testInput);

    // Attempt to create another post with the same slug
    const duplicateInput: CreateBlogPostInput = {
      ...testInput,
      title: 'Different Title'
    };

    await expect(createBlogPost(duplicateInput)).rejects.toThrow(/duplicate key value violates unique constraint/i);
  });

  it('should set published_at timestamp only for published posts', async () => {
    const publishedResult = await createBlogPost({
      ...testInput,
      is_published: true
    });

    const unpublishedResult = await createBlogPost({
      ...unpublishedInput,
      slug: 'unpublished-test',
      is_published: false
    });

    // Published post should have published_at timestamp
    expect(publishedResult.published_at).toBeInstanceOf(Date);
    expect(publishedResult.is_published).toBe(true);

    // Unpublished post should have null published_at
    expect(unpublishedResult.published_at).toBeNull();
    expect(unpublishedResult.is_published).toBe(false);
  });
});