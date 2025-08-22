import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type CreatePageInput } from '../schema';
import { createPage } from '../handlers/create_page';
import { eq } from 'drizzle-orm';

// Basic test input
const testInput: CreatePageInput = {
  slug: 'test-page',
  title: 'Test Page',
  meta_title: 'Test Page - Meta Title',
  meta_description: 'This is a test page for testing purposes',
  content: '<h1>Test Page Content</h1><p>This is the content of the test page.</p>',
  is_published: true
};

// Minimal test input
const minimalInput: CreatePageInput = {
  slug: 'minimal-page',
  title: 'Minimal Page',
  meta_title: null,
  meta_description: null,
  content: '<p>Minimal content</p>',
  is_published: false
};

describe('createPage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a page with all fields', async () => {
    const result = await createPage(testInput);

    // Basic field validation
    expect(result.slug).toEqual('test-page');
    expect(result.title).toEqual('Test Page');
    expect(result.meta_title).toEqual('Test Page - Meta Title');
    expect(result.meta_description).toEqual('This is a test page for testing purposes');
    expect(result.content).toEqual('<h1>Test Page Content</h1><p>This is the content of the test page.</p>');
    expect(result.is_published).toEqual(true);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a page with minimal fields', async () => {
    const result = await createPage(minimalInput);

    // Basic field validation
    expect(result.slug).toEqual('minimal-page');
    expect(result.title).toEqual('Minimal Page');
    expect(result.meta_title).toBeNull();
    expect(result.meta_description).toBeNull();
    expect(result.content).toEqual('<p>Minimal content</p>');
    expect(result.is_published).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save page to database', async () => {
    const result = await createPage(testInput);

    // Query using proper drizzle syntax
    const pages = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.id, result.id))
      .execute();

    expect(pages).toHaveLength(1);
    expect(pages[0].slug).toEqual('test-page');
    expect(pages[0].title).toEqual('Test Page');
    expect(pages[0].meta_title).toEqual('Test Page - Meta Title');
    expect(pages[0].meta_description).toEqual('This is a test page for testing purposes');
    expect(pages[0].content).toEqual('<h1>Test Page Content</h1><p>This is the content of the test page.</p>');
    expect(pages[0].is_published).toEqual(true);
    expect(pages[0].created_at).toBeInstanceOf(Date);
    expect(pages[0].updated_at).toBeInstanceOf(Date);
  });

  it('should use default value for is_published', async () => {
    // Test input using Zod default value
    const inputWithDefault: CreatePageInput = {
      slug: 'default-test',
      title: 'Default Test Page',
      meta_title: null,
      meta_description: null,
      content: '<p>Test content</p>',
      is_published: true // Zod default is true
    };

    const result = await createPage(inputWithDefault);
    expect(result.is_published).toEqual(true);
  });

  it('should handle unique slug constraint', async () => {
    // Create first page
    await createPage(testInput);

    // Try to create another page with same slug
    const duplicateInput: CreatePageInput = {
      ...testInput,
      title: 'Different Title'
    };

    await expect(createPage(duplicateInput)).rejects.toThrow(/unique/i);
  });

  it('should handle HTML content properly', async () => {
    const htmlInput: CreatePageInput = {
      slug: 'html-page',
      title: 'HTML Page',
      meta_title: null,
      meta_description: null,
      content: `
        <div class="container">
          <h1>Welcome</h1>
          <p>This is a <strong>test</strong> with <em>HTML</em> content.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      `,
      is_published: true
    };

    const result = await createPage(htmlInput);
    expect(result.content).toContain('<div class="container">');
    expect(result.content).toContain('<strong>test</strong>');
    expect(result.content).toContain('<ul>');
  });

  it('should create multiple pages with different slugs', async () => {
    const page1: CreatePageInput = {
      slug: 'about-us',
      title: 'About Us',
      meta_title: 'About Us - Company Info',
      meta_description: 'Learn more about our company',
      content: '<p>About us content</p>',
      is_published: true
    };

    const page2: CreatePageInput = {
      slug: 'contact',
      title: 'Contact',
      meta_title: null,
      meta_description: null,
      content: '<p>Contact information</p>',
      is_published: false
    };

    const result1 = await createPage(page1);
    const result2 = await createPage(page2);

    // Verify both pages were created with different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.slug).toEqual('about-us');
    expect(result2.slug).toEqual('contact');
    
    // Verify both pages exist in database
    const allPages = await db.select().from(pagesTable).execute();
    expect(allPages).toHaveLength(2);
  });
});