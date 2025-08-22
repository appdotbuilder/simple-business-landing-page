import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type CreatePageInput, type Page } from '../schema';

export const createPage = async (input: CreatePageInput): Promise<Page> => {
  try {
    // Insert page record
    const result = await db.insert(pagesTable)
      .values({
        slug: input.slug,
        title: input.title,
        meta_title: input.meta_title,
        meta_description: input.meta_description,
        content: input.content,
        is_published: input.is_published
      })
      .returning()
      .execute();

    const page = result[0];
    return page;
  } catch (error) {
    console.error('Page creation failed:', error);
    throw error;
  }
};