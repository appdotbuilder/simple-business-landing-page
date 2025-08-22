import { db } from '../db';
import { galleryTable } from '../db/schema';
import { type CreateGalleryItemInput, type GalleryItem } from '../schema';

export const createGalleryItem = async (input: CreateGalleryItemInput): Promise<GalleryItem> => {
  try {
    // Insert gallery item record
    const result = await db.insert(galleryTable)
      .values({
        title: input.title,
        description: input.description,
        image_url: input.image_url,
        category: input.category,
        order_index: input.order_index,
        is_active: input.is_active
      })
      .returning()
      .execute();

    // Return the created gallery item
    const galleryItem = result[0];
    return galleryItem;
  } catch (error) {
    console.error('Gallery item creation failed:', error);
    throw error;
  }
};