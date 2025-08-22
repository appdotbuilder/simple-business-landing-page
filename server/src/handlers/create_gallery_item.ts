import { type CreateGalleryItemInput, type GalleryItem } from '../schema';

export async function createGalleryItem(input: CreateGalleryItemInput): Promise<GalleryItem> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is creating a new gallery item with image and optional description.
    // Gallery items will be displayed on the "Galeri" page.
    return Promise.resolve({
        id: 0,
        title: input.title,
        description: input.description || null,
        image_url: input.image_url,
        category: input.category || null,
        order_index: input.order_index,
        is_active: input.is_active,
        created_at: new Date()
    } as GalleryItem);
}