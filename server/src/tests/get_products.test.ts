import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { getProducts } from '../handlers/get_products';

// Test product inputs
const activeProduct: CreateProductInput = {
  name: 'Active Product',
  description: 'A product that is active',
  price: 29.99,
  image_url: 'https://example.com/active.jpg',
  category: 'electronics',
  is_featured: true,
  is_active: true
};

const inactiveProduct: CreateProductInput = {
  name: 'Inactive Product',
  description: 'A product that is inactive',
  price: 39.99,
  image_url: 'https://example.com/inactive.jpg',
  category: 'electronics',
  is_featured: false,
  is_active: false
};

const secondActiveProduct: CreateProductInput = {
  name: 'Second Active Product',
  description: 'Another active product',
  price: 19.99,
  image_url: null,
  category: 'books',
  is_featured: false,
  is_active: true
};

describe('getProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no products exist', async () => {
    const result = await getProducts();
    expect(result).toEqual([]);
  });

  it('should return only active products', async () => {
    // Create both active and inactive products
    await db.insert(productsTable).values([
      {
        name: activeProduct.name,
        description: activeProduct.description,
        price: activeProduct.price.toString(),
        image_url: activeProduct.image_url,
        category: activeProduct.category,
        is_featured: activeProduct.is_featured,
        is_active: activeProduct.is_active
      },
      {
        name: inactiveProduct.name,
        description: inactiveProduct.description,
        price: inactiveProduct.price.toString(),
        image_url: inactiveProduct.image_url,
        category: inactiveProduct.category,
        is_featured: inactiveProduct.is_featured,
        is_active: inactiveProduct.is_active
      }
    ]).execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Active Product');
    expect(result[0].is_active).toBe(true);
  });

  it('should return products with correct data types', async () => {
    // Create a test product
    await db.insert(productsTable).values({
      name: activeProduct.name,
      description: activeProduct.description,
      price: activeProduct.price.toString(), // Insert as string
      image_url: activeProduct.image_url,
      category: activeProduct.category,
      is_featured: activeProduct.is_featured,
      is_active: activeProduct.is_active
    }).execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    const product = result[0];

    // Verify all field types and values
    expect(product.id).toBeDefined();
    expect(typeof product.id).toBe('number');
    expect(product.name).toEqual('Active Product');
    expect(product.description).toEqual(activeProduct.description);
    expect(product.price).toEqual(29.99);
    expect(typeof product.price).toBe('number'); // Should be converted from string
    expect(product.image_url).toEqual(activeProduct.image_url);
    expect(product.category).toEqual(activeProduct.category);
    expect(product.is_featured).toBe(true);
    expect(product.is_active).toBe(true);
    expect(product.created_at).toBeInstanceOf(Date);
    expect(product.updated_at).toBeInstanceOf(Date);
  });

  it('should return products ordered by creation date (newest first)', async () => {
    // Insert first product
    await db.insert(productsTable).values({
      name: 'First Product',
      description: 'First product created',
      price: activeProduct.price.toString(),
      image_url: activeProduct.image_url,
      category: activeProduct.category,
      is_featured: activeProduct.is_featured,
      is_active: activeProduct.is_active
    }).execute();

    // Add a small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Insert second product
    await db.insert(productsTable).values({
      name: 'Second Product',
      description: 'Second product created',
      price: secondActiveProduct.price.toString(),
      image_url: secondActiveProduct.image_url,
      category: secondActiveProduct.category,
      is_featured: secondActiveProduct.is_featured,
      is_active: secondActiveProduct.is_active
    }).execute();

    const result = await getProducts();

    expect(result).toHaveLength(2);
    // Newest should be first
    expect(result[0].name).toEqual('Second Product');
    expect(result[1].name).toEqual('First Product');
    // Verify ordering by timestamp
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should handle products with null values correctly', async () => {
    // Create product with null image_url and category
    await db.insert(productsTable).values({
      name: 'Product with Nulls',
      description: 'Product with some null fields',
      price: '15.50',
      image_url: null,
      category: null,
      is_featured: false,
      is_active: true
    }).execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    const product = result[0];

    expect(product.name).toEqual('Product with Nulls');
    expect(product.price).toEqual(15.50);
    expect(product.image_url).toBeNull();
    expect(product.category).toBeNull();
    expect(product.is_featured).toBe(false);
    expect(product.is_active).toBe(true);
  });

  it('should return multiple active products from different categories', async () => {
    // Create products from different categories
    await db.insert(productsTable).values([
      {
        name: 'Electronics Product',
        description: 'An electronics product',
        price: '99.99',
        image_url: 'https://example.com/electronics.jpg',
        category: 'electronics',
        is_featured: true,
        is_active: true
      },
      {
        name: 'Books Product',
        description: 'A books product',
        price: '19.99',
        image_url: 'https://example.com/books.jpg',
        category: 'books',
        is_featured: false,
        is_active: true
      },
      {
        name: 'Clothing Product',
        description: 'A clothing product',
        price: '49.99',
        image_url: 'https://example.com/clothing.jpg',
        category: 'clothing',
        is_featured: false,
        is_active: true
      }
    ]).execute();

    const result = await getProducts();

    expect(result).toHaveLength(3);
    
    // Verify all categories are present
    const categories = result.map(p => p.category);
    expect(categories).toContain('electronics');
    expect(categories).toContain('books');
    expect(categories).toContain('clothing');

    // Verify all are active
    result.forEach(product => {
      expect(product.is_active).toBe(true);
    });
  });
});