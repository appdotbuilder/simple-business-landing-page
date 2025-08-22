import { type CreateProductInput, type Product } from '../schema';

export async function createProduct(input: CreateProductInput): Promise<Product> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is creating a new product with pricing and optional image.
    // Products will be displayed on the "Produk" page.
    return Promise.resolve({
        id: 0,
        name: input.name,
        description: input.description,
        price: input.price,
        image_url: input.image_url || null,
        category: input.category || null,
        is_featured: input.is_featured,
        is_active: input.is_active,
        created_at: new Date(),
        updated_at: new Date()
    } as Product);
}