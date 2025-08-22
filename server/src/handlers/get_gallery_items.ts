import { db } from '../db';
import { galleryTable } from '../db/schema';
import { type GalleryItem } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  try {
    // Query all active gallery items ordered by order_index
    const results = await db.select()
      .from(galleryTable)
      .where(eq(galleryTable.is_active, true))
      .orderBy(asc(galleryTable.order_index))
      .execute();

    // Return results with proper date coercion
    return results.map(item => ({
      ...item,
      created_at: new Date(item.created_at)
    }));
  } catch (error) {
    console.error('Failed to fetch gallery items:', error);
    throw error;
  }
};