import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type PaginationInput } from '../schema';
import { getBlogPosts } from '../handlers/get_blog_posts';

describe('getBlogPosts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no blog posts exist', async () => {
    const result = await getBlogPosts();
    expect(result).toHaveLength(0);
  });

  it('should return published blog posts only', async () => {
    // Create published blog post
    await db.insert(blogPostsTable).values({
      title: 'Published Post',
      slug: 'published-post',
      content: 'This is published content',
      is_published: true,
      published_at: new Date()
    });

    // Create unpublished blog post
    await db.insert(blogPostsTable).values({
      title: 'Draft Post',
      slug: 'draft-post',
      content: 'This is draft content',
      is_published: false,
      published_at: null
    });

    const result = await getBlogPosts();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Published Post');
    expect(result[0].is_published).toBe(true);
  });

  it('should return blog posts ordered by published_at desc', async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Create blog posts with different published dates
    await db.insert(blogPostsTable).values([
      {
        title: 'Oldest Post',
        slug: 'oldest-post',
        content: 'Oldest content',
        is_published: true,
        published_at: yesterday
      },
      {
        title: 'Newest Post',
        slug: 'newest-post',
        content: 'Newest content',
        is_published: true,
        published_at: tomorrow
      },
      {
        title: 'Middle Post',
        slug: 'middle-post',
        content: 'Middle content',
        is_published: true,
        published_at: now
      }
    ]);

    const result = await getBlogPosts();
    expect(result).toHaveLength(3);
    expect(result[0].title).toBe('Newest Post');
    expect(result[1].title).toBe('Middle Post');
    expect(result[2].title).toBe('Oldest Post');
  });

  it('should apply pagination correctly', async () => {
    // Create multiple blog posts
    const posts = Array.from({ length: 15 }, (_, i) => ({
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      content: `Content ${i + 1}`,
      is_published: true,
      published_at: new Date(Date.now() - i * 1000) // Different timestamps for ordering
    }));

    await db.insert(blogPostsTable).values(posts);

    // Test first page
    const firstPageInput: PaginationInput = { page: 1, limit: 5 };
    const firstPage = await getBlogPosts(firstPageInput);
    expect(firstPage).toHaveLength(5);
    expect(firstPage[0].title).toBe('Post 1'); // Most recent

    // Test second page
    const secondPageInput: PaginationInput = { page: 2, limit: 5 };
    const secondPage = await getBlogPosts(secondPageInput);
    expect(secondPage).toHaveLength(5);
    expect(secondPage[0].title).toBe('Post 6');

    // Test third page
    const thirdPageInput: PaginationInput = { page: 3, limit: 5 };
    const thirdPage = await getBlogPosts(thirdPageInput);
    expect(thirdPage).toHaveLength(5);
    expect(thirdPage[0].title).toBe('Post 11');

    // Test fourth page (partial)
    const fourthPageInput: PaginationInput = { page: 4, limit: 5 };
    const fourthPage = await getBlogPosts(fourthPageInput);
    expect(fourthPage).toHaveLength(0); // No more posts
  });

  it('should use default pagination when no input provided', async () => {
    // Create more than 10 blog posts to test default limit
    const posts = Array.from({ length: 15 }, (_, i) => ({
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      content: `Content ${i + 1}`,
      is_published: true,
      published_at: new Date(Date.now() - i * 1000)
    }));

    await db.insert(blogPostsTable).values(posts);

    const result = await getBlogPosts(); // No input - should use defaults
    expect(result).toHaveLength(10); // Default limit of 10
    expect(result[0].title).toBe('Post 1'); // Most recent first
  });

  it('should handle partial pagination input', async () => {
    // Create test data
    const posts = Array.from({ length: 8 }, (_, i) => ({
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      content: `Content ${i + 1}`,
      is_published: true,
      published_at: new Date(Date.now() - i * 1000)
    }));

    await db.insert(blogPostsTable).values(posts);

    // Test with only page specified (should use default limit)
    const pageOnlyInput = { page: 1 } as PaginationInput;
    const pageOnlyResult = await getBlogPosts(pageOnlyInput);
    expect(pageOnlyResult).toHaveLength(8); // All posts (less than default limit of 10)

    // Test with only limit specified (should use default page)
    const limitOnlyInput = { limit: 3 } as PaginationInput;
    const limitOnlyResult = await getBlogPosts(limitOnlyInput);
    expect(limitOnlyResult).toHaveLength(3); // Limited to 3
    expect(limitOnlyResult[0].title).toBe('Post 1');
  });

  it('should return complete blog post data structure', async () => {
    await db.insert(blogPostsTable).values({
      title: 'Complete Post',
      slug: 'complete-post',
      excerpt: 'This is an excerpt',
      content: 'This is the full content',
      featured_image: 'https://example.com/image.jpg',
      meta_title: 'Meta Title',
      meta_description: 'Meta Description',
      is_published: true,
      published_at: new Date()
    });

    const result = await getBlogPosts();
    expect(result).toHaveLength(1);
    
    const post = result[0];
    expect(post.id).toBeDefined();
    expect(post.title).toBe('Complete Post');
    expect(post.slug).toBe('complete-post');
    expect(post.excerpt).toBe('This is an excerpt');
    expect(post.content).toBe('This is the full content');
    expect(post.featured_image).toBe('https://example.com/image.jpg');
    expect(post.meta_title).toBe('Meta Title');
    expect(post.meta_description).toBe('Meta Description');
    expect(post.is_published).toBe(true);
    expect(post.published_at).toBeInstanceOf(Date);
    expect(post.created_at).toBeInstanceOf(Date);
    expect(post.updated_at).toBeInstanceOf(Date);
  });

  it('should handle empty page results correctly', async () => {
    // Create only 3 blog posts
    const posts = Array.from({ length: 3 }, (_, i) => ({
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      content: `Content ${i + 1}`,
      is_published: true,
      published_at: new Date(Date.now() - i * 1000)
    }));

    await db.insert(blogPostsTable).values(posts);

    // Request page beyond available data
    const beyondPageInput: PaginationInput = { page: 5, limit: 10 };
    const result = await getBlogPosts(beyondPageInput);
    expect(result).toHaveLength(0);
  });
});