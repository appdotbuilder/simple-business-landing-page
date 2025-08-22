import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { createProduct } from '../handlers/create_product';
import { eq } from 'drizzle-orm';

// Complete test input with all fields
const testInput: CreateProductInput = {
  name: 'Premium Coffee Beans',
  description: 'High-quality Arabica coffee beans from Indonesia',
  price: 75000,
  image_url: 'https://example.com/coffee-beans.jpg',
  category: 'beverages',
  is_featured: true,
  is_active: true
};

// Minimal test input to test defaults
const minimalInput: CreateProductInput = {
  name: 'Basic Product',
  description: 'Simple product description',
  price: 25000,
  image_url: null,
  category: null,
  is_featured: false, // Zod default applied
  is_active: true     // Zod default applied
};

describe('createProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a product with all fields', async () => {
    const result = await createProduct(testInput);

    // Verify all fields are properly set
    expect(result.name).toEqual('Premium Coffee Beans');
    expect(result.description).toEqual(testInput.description);
    expect(result.price).toEqual(75000);
    expect(typeof result.price).toEqual('number'); // Verify numeric conversion
    expect(result.image_url).toEqual('https://example.com/coffee-beans.jpg');
    expect(result.category).toEqual('beverages');
    expect(result.is_featured).toEqual(true);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a product with minimal fields and handle nulls', async () => {
    const result = await createProduct(minimalInput);

    // Verify basic fields
    expect(result.name).toEqual('Basic Product');
    expect(result.description).toEqual('Simple product description');
    expect(result.price).toEqual(25000);
    expect(typeof result.price).toEqual('number');
    
    // Verify nullable fields
    expect(result.image_url).toBeNull();
    expect(result.category).toBeNull();
    
    // Verify boolean defaults
    expect(result.is_featured).toEqual(false);
    expect(result.is_active).toEqual(true);
    
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save product to database correctly', async () => {
    const result = await createProduct(testInput);

    // Query database to verify data was saved
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    
    const savedProduct = products[0];
    expect(savedProduct.name).toEqual('Premium Coffee Beans');
    expect(savedProduct.description).toEqual(testInput.description);
    expect(parseFloat(savedProduct.price)).toEqual(75000); // Database stores as string
    expect(savedProduct.image_url).toEqual('https://example.com/coffee-beans.jpg');
    expect(savedProduct.category).toEqual('beverages');
    expect(savedProduct.is_featured).toEqual(true);
    expect(savedProduct.is_active).toEqual(true);
    expect(savedProduct.created_at).toBeInstanceOf(Date);
    expect(savedProduct.updated_at).toBeInstanceOf(Date);
  });

  it('should handle decimal prices correctly', async () => {
    const decimalPriceInput: CreateProductInput = {
      name: 'Expensive Item',
      description: 'Item with decimal price',
      price: 99.99,
      image_url: null,
      category: null,
      is_featured: false,
      is_active: true
    };

    const result = await createProduct(decimalPriceInput);

    // Verify decimal price handling
    expect(result.price).toEqual(99.99);
    expect(typeof result.price).toEqual('number');

    // Verify in database
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(parseFloat(products[0].price)).toEqual(99.99);
  });

  it('should create multiple products with different categories', async () => {
    const product1Input: CreateProductInput = {
      name: 'Coffee Product',
      description: 'Coffee related item',
      price: 50000,
      image_url: null,
      category: 'beverages',
      is_featured: true,
      is_active: true
    };

    const product2Input: CreateProductInput = {
      name: 'Food Product',
      description: 'Food related item',
      price: 30000,
      image_url: null,
      category: 'food',
      is_featured: false,
      is_active: true
    };

    // Create both products
    const result1 = await createProduct(product1Input);
    const result2 = await createProduct(product2Input);

    // Verify they have different IDs
    expect(result1.id).not.toEqual(result2.id);
    
    // Verify categories
    expect(result1.category).toEqual('beverages');
    expect(result2.category).toEqual('food');

    // Verify both are in database
    const allProducts = await db.select()
      .from(productsTable)
      .execute();

    expect(allProducts).toHaveLength(2);
    
    const categories = allProducts.map(p => p.category);
    expect(categories).toContain('beverages');
    expect(categories).toContain('food');
  });
});