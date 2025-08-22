import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactMessagesTable } from '../db/schema';
import { type CreateContactMessageInput } from '../schema';
import { createContactMessage } from '../handlers/create_contact_message';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInputFull: CreateContactMessageInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  subject: 'Business Inquiry',
  message: 'I would like to know more about your services.'
};

// Test input with minimal required fields
const testInputMinimal: CreateContactMessageInput = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  phone: null,
  subject: null,
  message: 'Hello, I need help with something.'
};

describe('createContactMessage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a contact message with all fields', async () => {
    const result = await createContactMessage(testInputFull);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.phone).toEqual('+1234567890');
    expect(result.subject).toEqual('Business Inquiry');
    expect(result.message).toEqual('I would like to know more about your services.');
    expect(result.is_read).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a contact message with minimal fields', async () => {
    const result = await createContactMessage(testInputMinimal);

    // Basic field validation
    expect(result.name).toEqual('Jane Smith');
    expect(result.email).toEqual('jane.smith@example.com');
    expect(result.phone).toBeNull();
    expect(result.subject).toBeNull();
    expect(result.message).toEqual('Hello, I need help with something.');
    expect(result.is_read).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save contact message to database', async () => {
    const result = await createContactMessage(testInputFull);

    // Query the database to verify the message was saved
    const messages = await db.select()
      .from(contactMessagesTable)
      .where(eq(contactMessagesTable.id, result.id))
      .execute();

    expect(messages).toHaveLength(1);
    expect(messages[0].name).toEqual('John Doe');
    expect(messages[0].email).toEqual('john.doe@example.com');
    expect(messages[0].phone).toEqual('+1234567890');
    expect(messages[0].subject).toEqual('Business Inquiry');
    expect(messages[0].message).toEqual('I would like to know more about your services.');
    expect(messages[0].is_read).toEqual(false);
    expect(messages[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple contact messages independently', async () => {
    // Create first message
    const result1 = await createContactMessage(testInputFull);
    
    // Create second message
    const result2 = await createContactMessage(testInputMinimal);

    // Verify both messages exist and have different IDs
    expect(result1.id).not.toEqual(result2.id);
    
    // Query database to verify both messages exist
    const allMessages = await db.select()
      .from(contactMessagesTable)
      .execute();

    expect(allMessages).toHaveLength(2);
    
    // Find each message by name to verify they're both there
    const johnMessage = allMessages.find(msg => msg.name === 'John Doe');
    const janeMessage = allMessages.find(msg => msg.name === 'Jane Smith');
    
    expect(johnMessage).toBeDefined();
    expect(janeMessage).toBeDefined();
    expect(johnMessage?.email).toEqual('john.doe@example.com');
    expect(janeMessage?.email).toEqual('jane.smith@example.com');
  });

  it('should handle long message content', async () => {
    const longMessage = 'A'.repeat(1000); // 1000 character message
    const longMessageInput: CreateContactMessageInput = {
      name: 'Test User',
      email: 'test@example.com',
      phone: null,
      subject: null,
      message: longMessage
    };

    const result = await createContactMessage(longMessageInput);

    expect(result.message).toEqual(longMessage);
    expect(result.message.length).toEqual(1000);
    expect(result.name).toEqual('Test User');
    expect(result.email).toEqual('test@example.com');
  });
});