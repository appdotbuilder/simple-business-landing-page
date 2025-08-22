import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { getPages } from '../handlers/get_pages';

describe('getPages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no pages exist', async () => {
    const result = await getPages();
    expect(result).toEqual([]);
  });

  it('should return all published pages', async () => {
    // Create test pages - both published and unpublished
    await db.insert(pagesTable)
      .values([
        {
          slug: 'home',
          title: 'Home Page',
          meta_title: 'Welcome to Our Site',
          meta_description: 'The home page of our website',
          content: 'Welcome to our home page!',
          is_published: true
        },
        {
          slug: 'about',
          title: 'About Us',
          meta_title: null,
          meta_description: null,
          content: 'Learn about our company',
          is_published: true
        },
        {
          slug: 'draft',
          title: 'Draft Page',
          meta_title: null,
          meta_description: null,
          content: 'This is a draft',
          is_published: false // This should NOT be returned
        }
      ])
      .execute();

    const result = await getPages();

    // Should only return the 2 published pages
    expect(result).toHaveLength(2);
    
    // Verify the published pages are returned
    const slugs = result.map(page => page.slug);
    expect(slugs).toContain('home');
    expect(slugs).toContain('about');
    expect(slugs).not.toContain('draft');

    // Verify page structure
    result.forEach(page => {
      expect(page.id).toBeDefined();
      expect(page.slug).toBeDefined();
      expect(page.title).toBeDefined();
      expect(page.content).toBeDefined();
      expect(page.is_published).toBe(true);
      expect(page.created_at).toBeInstanceOf(Date);
      expect(page.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return pages with correct field types', async () => {
    await db.insert(pagesTable)
      .values({
        slug: 'test-page',
        title: 'Test Page',
        meta_title: 'Test Meta Title',
        meta_description: 'Test meta description',
        content: 'Test content',
        is_published: true
      })
      .execute();

    const result = await getPages();

    expect(result).toHaveLength(1);
    const page = result[0];

    // Verify field types
    expect(typeof page.id).toBe('number');
    expect(typeof page.slug).toBe('string');
    expect(typeof page.title).toBe('string');
    expect(typeof page.meta_title).toBe('string');
    expect(typeof page.meta_description).toBe('string');
    expect(typeof page.content).toBe('string');
    expect(typeof page.is_published).toBe('boolean');
    expect(page.created_at).toBeInstanceOf(Date);
    expect(page.updated_at).toBeInstanceOf(Date);

    // Verify actual values
    expect(page.slug).toEqual('test-page');
    expect(page.title).toEqual('Test Page');
    expect(page.meta_title).toEqual('Test Meta Title');
    expect(page.meta_description).toEqual('Test meta description');
    expect(page.content).toEqual('Test content');
    expect(page.is_published).toBe(true);
  });

  it('should handle pages with null meta fields', async () => {
    await db.insert(pagesTable)
      .values({
        slug: 'simple-page',
        title: 'Simple Page',
        meta_title: null,
        meta_description: null,
        content: 'Simple content',
        is_published: true
      })
      .execute();

    const result = await getPages();

    expect(result).toHaveLength(1);
    const page = result[0];

    expect(page.slug).toEqual('simple-page');
    expect(page.title).toEqual('Simple Page');
    expect(page.meta_title).toBeNull();
    expect(page.meta_description).toBeNull();
    expect(page.content).toEqual('Simple content');
    expect(page.is_published).toBe(true);
  });

  it('should only return published pages', async () => {
    // Create multiple unpublished pages
    await db.insert(pagesTable)
      .values([
        {
          slug: 'draft-1',
          title: 'Draft 1',
          meta_title: null,
          meta_description: null,
          content: 'Draft content 1',
          is_published: false
        },
        {
          slug: 'draft-2',
          title: 'Draft 2',
          meta_title: null,
          meta_description: null,
          content: 'Draft content 2',
          is_published: false
        }
      ])
      .execute();

    const result = await getPages();

    // Should return empty array since all pages are unpublished
    expect(result).toEqual([]);
  });
});