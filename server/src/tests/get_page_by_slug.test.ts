import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type GetPageBySlugInput } from '../schema';
import { getPageBySlug } from '../handlers/get_page_by_slug';
import { eq } from 'drizzle-orm';

describe('getPageBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  const createTestPage = async (overrides = {}) => {
    const defaultPage = {
      slug: 'test-page',
      title: 'Test Page',
      meta_title: 'Test Meta Title',
      meta_description: 'Test meta description for SEO',
      content: '<h1>Welcome</h1><p>This is test content.</p>',
      is_published: true,
    };

    const result = await db.insert(pagesTable)
      .values({ ...defaultPage, ...overrides })
      .returning()
      .execute();

    return result[0];
  };

  it('should return published page by slug', async () => {
    // Create test page
    const testPage = await createTestPage();
    
    const input: GetPageBySlugInput = {
      slug: 'test-page'
    };

    const result = await getPageBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testPage.id);
    expect(result!.slug).toEqual('test-page');
    expect(result!.title).toEqual('Test Page');
    expect(result!.meta_title).toEqual('Test Meta Title');
    expect(result!.meta_description).toEqual('Test meta description for SEO');
    expect(result!.content).toEqual('<h1>Welcome</h1><p>This is test content.</p>');
    expect(result!.is_published).toBe(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent slug', async () => {
    const input: GetPageBySlugInput = {
      slug: 'non-existent-page'
    };

    const result = await getPageBySlug(input);

    expect(result).toBeNull();
  });

  it('should return null for unpublished page', async () => {
    // Create unpublished page
    await createTestPage({
      slug: 'unpublished-page',
      title: 'Unpublished Page',
      is_published: false
    });

    const input: GetPageBySlugInput = {
      slug: 'unpublished-page'
    };

    const result = await getPageBySlug(input);

    expect(result).toBeNull();
  });

  it('should handle pages with null meta fields', async () => {
    // Create page with null meta fields
    await createTestPage({
      slug: 'simple-page',
      title: 'Simple Page',
      meta_title: null,
      meta_description: null,
      content: 'Simple content without meta tags'
    });

    const input: GetPageBySlugInput = {
      slug: 'simple-page'
    };

    const result = await getPageBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.slug).toEqual('simple-page');
    expect(result!.title).toEqual('Simple Page');
    expect(result!.meta_title).toBeNull();
    expect(result!.meta_description).toBeNull();
    expect(result!.content).toEqual('Simple content without meta tags');
    expect(result!.is_published).toBe(true);
  });

  it('should find correct page when multiple pages exist', async () => {
    // Create multiple pages
    await createTestPage({
      slug: 'home',
      title: 'Home Page',
      content: 'Home page content'
    });
    
    await createTestPage({
      slug: 'about',
      title: 'About Us',
      content: 'About us content'
    });
    
    await createTestPage({
      slug: 'contact',
      title: 'Contact',
      content: 'Contact page content'
    });

    const input: GetPageBySlugInput = {
      slug: 'about'
    };

    const result = await getPageBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.slug).toEqual('about');
    expect(result!.title).toEqual('About Us');
    expect(result!.content).toEqual('About us content');
  });

  it('should handle special characters in slug', async () => {
    // Create page with special characters in slug
    await createTestPage({
      slug: 'kebijakan-privasi',
      title: 'Kebijakan Privasi',
      content: 'Halaman kebijakan privasi'
    });

    const input: GetPageBySlugInput = {
      slug: 'kebijakan-privasi'
    };

    const result = await getPageBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.slug).toEqual('kebijakan-privasi');
    expect(result!.title).toEqual('Kebijakan Privasi');
  });

  it('should verify page exists in database after successful retrieval', async () => {
    // Create test page
    const testPage = await createTestPage({
      slug: 'verify-page',
      title: 'Verify Page'
    });

    const input: GetPageBySlugInput = {
      slug: 'verify-page'
    };

    const result = await getPageBySlug(input);

    // Verify in database
    const dbPage = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.id, result!.id))
      .execute();

    expect(dbPage).toHaveLength(1);
    expect(dbPage[0].slug).toEqual('verify-page');
    expect(dbPage[0].title).toEqual('Verify Page');
    expect(dbPage[0].is_published).toBe(true);
  });
});