import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactMessagesTable } from '../db/schema';
import { type PaginationInput, type CreateContactMessageInput } from '../schema';
import { getContactMessages } from '../handlers/get_contact_messages';
import { eq } from 'drizzle-orm';

describe('getContactMessages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create test contact messages
  const createTestMessage = async (overrides: Partial<CreateContactMessageInput> = {}) => {
    const messageData: CreateContactMessageInput = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      subject: 'Test Subject',
      message: 'This is a test message',
      ...overrides
    };

    const result = await db.insert(contactMessagesTable)
      .values(messageData)
      .returning()
      .execute();

    return result[0];
  };

  it('should return empty array when no contact messages exist', async () => {
    const result = await getContactMessages();

    expect(result).toEqual([]);
  });

  it('should return contact messages with default pagination', async () => {
    // Create test messages
    await createTestMessage({ name: 'Alice', email: 'alice@example.com' });
    await createTestMessage({ name: 'Bob', email: 'bob@example.com' });
    await createTestMessage({ name: 'Charlie', email: 'charlie@example.com' });

    const result = await getContactMessages();

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Charlie'); // Should be ordered by created_at DESC
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe('Alice');

    // Verify all required fields are present
    result.forEach(message => {
      expect(message.id).toBeDefined();
      expect(message.name).toBeDefined();
      expect(message.email).toBeDefined();
      expect(message.message).toBeDefined();
      expect(message.is_read).toBe(false); // Default value
      expect(message.created_at).toBeInstanceOf(Date);
    });
  });

  it('should apply custom pagination correctly', async () => {
    // Create 15 test messages
    for (let i = 1; i <= 15; i++) {
      await createTestMessage({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        message: `Message ${i}`
      });
    }

    // Test first page with limit 5
    const firstPageInput: PaginationInput = { page: 1, limit: 5 };
    const firstPage = await getContactMessages(firstPageInput);

    expect(firstPage).toHaveLength(5);
    expect(firstPage[0].name).toBe('User 15'); // Most recent first

    // Test second page
    const secondPageInput: PaginationInput = { page: 2, limit: 5 };
    const secondPage = await getContactMessages(secondPageInput);

    expect(secondPage).toHaveLength(5);
    expect(secondPage[0].name).toBe('User 10'); // Next 5 messages

    // Test third page
    const thirdPageInput: PaginationInput = { page: 3, limit: 5 };
    const thirdPage = await getContactMessages(thirdPageInput);

    expect(thirdPage).toHaveLength(5);
    expect(thirdPage[0].name).toBe('User 5'); // Last 5 messages
  });

  it('should handle page beyond available data', async () => {
    // Create only 2 messages
    await createTestMessage({ name: 'Alice', email: 'alice@example.com' });
    await createTestMessage({ name: 'Bob', email: 'bob@example.com' });

    // Request page 5 with limit 10 (should return empty)
    const input: PaginationInput = { page: 5, limit: 10 };
    const result = await getContactMessages(input);

    expect(result).toEqual([]);
  });

  it('should handle messages with null optional fields', async () => {
    // Create message with minimal required fields
    await createTestMessage({
      name: 'John Doe',
      email: 'john@example.com',
      phone: null,
      subject: null,
      message: 'Test message'
    });

    const result = await getContactMessages();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('John Doe');
    expect(result[0].email).toBe('john@example.com');
    expect(result[0].phone).toBeNull();
    expect(result[0].subject).toBeNull();
    expect(result[0].message).toBe('Test message');
  });

  it('should preserve is_read status', async () => {
    // Create message and mark as read
    const message = await createTestMessage({ name: 'Alice', email: 'alice@example.com' });

    // Update to mark as read
    await db.update(contactMessagesTable)
      .set({ is_read: true })
      .where(eq(contactMessagesTable.id, message.id))
      .execute();

    const result = await getContactMessages();

    expect(result).toHaveLength(1);
    expect(result[0].is_read).toBe(true);
  });

  it('should order messages by created_at descending', async () => {
    // Create messages with slight delay to ensure different timestamps
    const message1 = await createTestMessage({ name: 'First', email: 'first@example.com' });
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const message2 = await createTestMessage({ name: 'Second', email: 'second@example.com' });
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const message3 = await createTestMessage({ name: 'Third', email: 'third@example.com' });

    const result = await getContactMessages();

    expect(result).toHaveLength(3);
    // Most recent should be first
    expect(result[0].name).toBe('Third');
    expect(result[1].name).toBe('Second');
    expect(result[2].name).toBe('First');

    // Verify timestamps are properly ordered
    expect(result[0].created_at.getTime()).toBeGreaterThan(result[1].created_at.getTime());
    expect(result[1].created_at.getTime()).toBeGreaterThan(result[2].created_at.getTime());
  });

  it('should work without input parameter', async () => {
    await createTestMessage({ name: 'Test User', email: 'test@example.com' });

    // Call without any input (should use defaults)
    const result = await getContactMessages();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Test User');
  });

  it('should handle large limit values correctly', async () => {
    // Create 5 messages
    for (let i = 1; i <= 5; i++) {
      await createTestMessage({
        name: `User ${i}`,
        email: `user${i}@example.com`
      });
    }

    // Request with limit larger than available data
    const input: PaginationInput = { page: 1, limit: 100 };
    const result = await getContactMessages(input);

    expect(result).toHaveLength(5); // Should return all available messages
  });
});