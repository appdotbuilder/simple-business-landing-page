import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { galleryTable } from '../db/schema';
import { type CreateGalleryItemInput } from '../schema';
import { createGalleryItem } from '../handlers/create_gallery_item';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields
const testInput: CreateGalleryItemInput = {
  title: 'Beautiful Landscape',
  description: 'A stunning landscape photograph from our latest project',
  image_url: 'https://example.com/images/landscape.jpg',
  category: 'photography',
  order_index: 1,
  is_active: true
};

describe('createGalleryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a gallery item with all fields', async () => {
    const result = await createGalleryItem(testInput);

    // Basic field validation
    expect(result.title).toEqual('Beautiful Landscape');
    expect(result.description).toEqual('A stunning landscape photograph from our latest project');
    expect(result.image_url).toEqual('https://example.com/images/landscape.jpg');
    expect(result.category).toEqual('photography');
    expect(result.order_index).toEqual(1);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a gallery item with null optional fields', async () => {
    const minimalInput: CreateGalleryItemInput = {
      title: 'Simple Image',
      description: null,
      image_url: 'https://example.com/simple.jpg',
      category: null,
      order_index: 0,
      is_active: true
    };

    const result = await createGalleryItem(minimalInput);

    expect(result.title).toEqual('Simple Image');
    expect(result.description).toBeNull();
    expect(result.image_url).toEqual('https://example.com/simple.jpg');
    expect(result.category).toBeNull();
    expect(result.order_index).toEqual(0);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save gallery item to database', async () => {
    const result = await createGalleryItem(testInput);

    // Query the database to verify the item was saved
    const galleryItems = await db.select()
      .from(galleryTable)
      .where(eq(galleryTable.id, result.id))
      .execute();

    expect(galleryItems).toHaveLength(1);
    const savedItem = galleryItems[0];
    expect(savedItem.title).toEqual('Beautiful Landscape');
    expect(savedItem.description).toEqual('A stunning landscape photograph from our latest project');
    expect(savedItem.image_url).toEqual('https://example.com/images/landscape.jpg');
    expect(savedItem.category).toEqual('photography');
    expect(savedItem.order_index).toEqual(1);
    expect(savedItem.is_active).toEqual(true);
    expect(savedItem.created_at).toBeInstanceOf(Date);
  });

  it('should handle different categories', async () => {
    const categories = ['landscape', 'portrait', 'architecture', 'events'];
    const results = [];

    for (let i = 0; i < categories.length; i++) {
      const input: CreateGalleryItemInput = {
        title: `${categories[i]} Gallery Item`,
        description: `A sample ${categories[i]} image`,
        image_url: `https://example.com/${categories[i]}.jpg`,
        category: categories[i],
        order_index: i,
        is_active: true
      };
      
      const result = await createGalleryItem(input);
      results.push(result);
    }

    expect(results).toHaveLength(4);
    results.forEach((result, index) => {
      expect(result.category).toEqual(categories[index]);
      expect(result.order_index).toEqual(index);
      expect(result.title).toContain(categories[index]);
    });
  });

  it('should handle different order indices correctly', async () => {
    const orderIndices = [0, 5, 10, -1];
    const results = [];

    for (const orderIndex of orderIndices) {
      const input: CreateGalleryItemInput = {
        title: `Order ${orderIndex} Item`,
        description: 'Test order index',
        image_url: 'https://example.com/test.jpg',
        category: 'test',
        order_index: orderIndex,
        is_active: true
      };
      
      const result = await createGalleryItem(input);
      results.push(result);
    }

    expect(results).toHaveLength(4);
    results.forEach((result, index) => {
      expect(result.order_index).toEqual(orderIndices[index]);
    });
  });

  it('should handle active/inactive states', async () => {
    const activeInput: CreateGalleryItemInput = {
      title: 'Active Item',
      description: 'This item is active',
      image_url: 'https://example.com/active.jpg',
      category: 'test',
      order_index: 1,
      is_active: true
    };

    const inactiveInput: CreateGalleryItemInput = {
      title: 'Inactive Item',
      description: 'This item is inactive',
      image_url: 'https://example.com/inactive.jpg',
      category: 'test',
      order_index: 2,
      is_active: false
    };

    const activeResult = await createGalleryItem(activeInput);
    const inactiveResult = await createGalleryItem(inactiveInput);

    expect(activeResult.is_active).toEqual(true);
    expect(inactiveResult.is_active).toEqual(false);

    // Verify in database
    const allItems = await db.select()
      .from(galleryTable)
      .execute();

    expect(allItems).toHaveLength(2);
    const activeFromDb = allItems.find(item => item.title === 'Active Item');
    const inactiveFromDb = allItems.find(item => item.title === 'Inactive Item');

    expect(activeFromDb?.is_active).toEqual(true);
    expect(inactiveFromDb?.is_active).toEqual(false);
  });
});