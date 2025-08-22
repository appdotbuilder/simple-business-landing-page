import { db } from '../db';
import { contactMessagesTable } from '../db/schema';
import { type ContactMessage, type PaginationInput } from '../schema';
import { desc } from 'drizzle-orm';

export async function getContactMessages(input?: PaginationInput): Promise<ContactMessage[]> {
  try {
    // Apply default pagination if not provided
    const page = input?.page ?? 1;
    const limit = input?.limit ?? 10;
    const offset = (page - 1) * limit;

    // Build the query with proper ordering and pagination
    let query = db.select()
      .from(contactMessagesTable)
      .orderBy(desc(contactMessagesTable.created_at))
      .limit(limit)
      .offset(offset);

    const results = await query.execute();

    // Return the results (no numeric conversions needed for contact messages)
    return results;
  } catch (error) {
    console.error('Failed to get contact messages:', error);
    throw error;
  }
}