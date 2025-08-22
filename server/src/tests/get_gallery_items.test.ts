import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { galleryTable } from '../db/schema';
import { type CreateGalleryItemInput } from '../schema';
import { getGalleryItems } from '../handlers/get_gallery_items';

describe('getGalleryItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no gallery items exist', async () => {
    const result = await getGalleryItems();

    expect(result).toHaveLength(0);
  });

  it('should return active gallery items ordered by order_index', async () => {
    // Create test gallery items with different order_index values
    await db.insert(galleryTable)
      .values([
        {
          title: 'Gallery Item 3',
          description: 'Third item',
          image_url: 'https://example.com/image3.jpg',
          category: 'nature',
          order_index: 3,
          is_active: true
        },
        {
          title: 'Gallery Item 1',
          description: 'First item',
          image_url: 'https://example.com/image1.jpg',
          category: 'architecture',
          order_index: 1,
          is_active: true
        },
        {
          title: 'Gallery Item 2',
          description: 'Second item',
          image_url: 'https://example.com/image2.jpg',
          category: null,
          order_index: 2,
          is_active: true
        }
      ])
      .execute();

    const result = await getGalleryItems();

    expect(result).toHaveLength(3);
    
    // Check ordering by order_index
    expect(result[0].title).toEqual('Gallery Item 1');
    expect(result[0].order_index).toEqual(1);
    expect(result[1].title).toEqual('Gallery Item 2');
    expect(result[1].order_index).toEqual(2);
    expect(result[2].title).toEqual('Gallery Item 3');
    expect(result[2].order_index).toEqual(3);

    // Verify all fields are properly returned
    expect(result[0].id).toBeDefined();
    expect(result[0].description).toEqual('First item');
    expect(result[0].image_url).toEqual('https://example.com/image1.jpg');
    expect(result[0].category).toEqual('architecture');
    expect(result[0].is_active).toEqual(true);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should exclude inactive gallery items', async () => {
    // Create both active and inactive gallery items
    await db.insert(galleryTable)
      .values([
        {
          title: 'Active Item',
          description: 'This should be returned',
          image_url: 'https://example.com/active.jpg',
          category: 'visible',
          order_index: 1,
          is_active: true
        },
        {
          title: 'Inactive Item',
          description: 'This should be hidden',
          image_url: 'https://example.com/inactive.jpg',
          category: 'hidden',
          order_index: 2,
          is_active: false
        }
      ])
      .execute();

    const result = await getGalleryItems();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Active Item');
    expect(result[0].is_active).toEqual(true);
  });

  it('should handle gallery items with null optional fields', async () => {
    // Create gallery item with minimal required fields
    await db.insert(galleryTable)
      .values({
        title: 'Minimal Item',
        description: null,
        image_url: 'https://example.com/minimal.jpg',
        category: null,
        order_index: 1,
        is_active: true
      })
      .execute();

    const result = await getGalleryItems();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Minimal Item');
    expect(result[0].description).toBeNull();
    expect(result[0].category).toBeNull();
    expect(result[0].image_url).toEqual('https://example.com/minimal.jpg');
  });

  it('should handle multiple items with same order_index', async () => {
    // Create gallery items with same order_index to test stable ordering
    await db.insert(galleryTable)
      .values([
        {
          title: 'Item A',
          description: 'First with same order',
          image_url: 'https://example.com/a.jpg',
          category: 'test',
          order_index: 5,
          is_active: true
        },
        {
          title: 'Item B',
          description: 'Second with same order',
          image_url: 'https://example.com/b.jpg',
          category: 'test',
          order_index: 5,
          is_active: true
        }
      ])
      .execute();

    const result = await getGalleryItems();

    expect(result).toHaveLength(2);
    // Both should have the same order_index
    expect(result[0].order_index).toEqual(5);
    expect(result[1].order_index).toEqual(5);
    // Ensure both items are returned
    const titles = result.map(item => item.title).sort();
    expect(titles).toEqual(['Item A', 'Item B']);
  });

  it('should return items with proper date formatting', async () => {
    await db.insert(galleryTable)
      .values({
        title: 'Date Test Item',
        description: 'Testing date format',
        image_url: 'https://example.com/date.jpg',
        category: 'test',
        order_index: 1,
        is_active: true
      })
      .execute();

    const result = await getGalleryItems();

    expect(result).toHaveLength(1);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(typeof result[0].created_at.getTime()).toBe('number');
  });
});