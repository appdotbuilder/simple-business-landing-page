import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { faqTable } from '../db/schema';
import { getFaqs } from '../handlers/get_faqs';
import { eq } from 'drizzle-orm';

describe('getFaqs', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no FAQs exist', async () => {
    const result = await getFaqs();
    expect(result).toEqual([]);
  });

  it('should fetch all active FAQs ordered by order_index', async () => {
    // Create test FAQs with different order_index values
    await db.insert(faqTable).values([
      {
        question: 'Third FAQ',
        answer: 'This is the third FAQ',
        category: 'General',
        order_index: 3,
        is_active: true
      },
      {
        question: 'First FAQ',
        answer: 'This is the first FAQ',
        category: 'General',
        order_index: 1,
        is_active: true
      },
      {
        question: 'Second FAQ',
        answer: 'This is the second FAQ',
        category: 'Support',
        order_index: 2,
        is_active: true
      }
    ]);

    const result = await getFaqs();

    expect(result).toHaveLength(3);
    
    // Check ordering by order_index
    expect(result[0].question).toEqual('First FAQ');
    expect(result[0].order_index).toEqual(1);
    expect(result[1].question).toEqual('Second FAQ');
    expect(result[1].order_index).toEqual(2);
    expect(result[2].question).toEqual('Third FAQ');
    expect(result[2].order_index).toEqual(3);

    // Verify all required fields are present
    result.forEach(faq => {
      expect(faq.id).toBeDefined();
      expect(faq.question).toBeDefined();
      expect(faq.answer).toBeDefined();
      expect(faq.order_index).toBeDefined();
      expect(faq.is_active).toBe(true);
      expect(faq.created_at).toBeInstanceOf(Date);
      expect(faq.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should only return active FAQs', async () => {
    // Create both active and inactive FAQs
    await db.insert(faqTable).values([
      {
        question: 'Active FAQ',
        answer: 'This FAQ is active',
        category: 'General',
        order_index: 1,
        is_active: true
      },
      {
        question: 'Inactive FAQ',
        answer: 'This FAQ is inactive',
        category: 'General',
        order_index: 2,
        is_active: false
      },
      {
        question: 'Another Active FAQ',
        answer: 'This is another active FAQ',
        category: 'Support',
        order_index: 3,
        is_active: true
      }
    ]);

    const result = await getFaqs();

    expect(result).toHaveLength(2);
    expect(result[0].question).toEqual('Active FAQ');
    expect(result[1].question).toEqual('Another Active FAQ');
    
    // Ensure all returned FAQs are active
    result.forEach(faq => {
      expect(faq.is_active).toBe(true);
    });
  });

  it('should handle FAQs with different categories', async () => {
    // Create FAQs with different categories and nullable category
    await db.insert(faqTable).values([
      {
        question: 'General Question',
        answer: 'General answer',
        category: 'General',
        order_index: 1,
        is_active: true
      },
      {
        question: 'Support Question',
        answer: 'Support answer',
        category: 'Support',
        order_index: 2,
        is_active: true
      },
      {
        question: 'Uncategorized Question',
        answer: 'Uncategorized answer',
        category: null,
        order_index: 3,
        is_active: true
      }
    ]);

    const result = await getFaqs();

    expect(result).toHaveLength(3);
    expect(result[0].category).toEqual('General');
    expect(result[1].category).toEqual('Support');
    expect(result[2].category).toBeNull();
  });

  it('should maintain correct ordering with duplicate order_index values', async () => {
    // Create FAQs with same order_index to test ordering stability
    await db.insert(faqTable).values([
      {
        question: 'FAQ B',
        answer: 'Answer B',
        category: 'General',
        order_index: 1,
        is_active: true
      },
      {
        question: 'FAQ A',
        answer: 'Answer A',
        category: 'General',
        order_index: 1,
        is_active: true
      },
      {
        question: 'FAQ C',
        answer: 'Answer C',
        category: 'General',
        order_index: 2,
        is_active: true
      }
    ]);

    const result = await getFaqs();

    expect(result).toHaveLength(3);
    
    // Check that order_index 1 comes before order_index 2
    expect(result[0].order_index).toEqual(1);
    expect(result[1].order_index).toEqual(1);
    expect(result[2].order_index).toEqual(2);
    expect(result[2].question).toEqual('FAQ C');
  });

  it('should handle FAQs with negative order_index values', async () => {
    // Create FAQs with negative order_index to test edge cases
    await db.insert(faqTable).values([
      {
        question: 'Zero FAQ',
        answer: 'Order index zero',
        category: 'General',
        order_index: 0,
        is_active: true
      },
      {
        question: 'Negative FAQ',
        answer: 'Negative order index',
        category: 'General',
        order_index: -1,
        is_active: true
      },
      {
        question: 'Positive FAQ',
        answer: 'Positive order index',
        category: 'General',
        order_index: 1,
        is_active: true
      }
    ]);

    const result = await getFaqs();

    expect(result).toHaveLength(3);
    
    // Check ordering: negative, zero, positive
    expect(result[0].question).toEqual('Negative FAQ');
    expect(result[0].order_index).toEqual(-1);
    expect(result[1].question).toEqual('Zero FAQ');
    expect(result[1].order_index).toEqual(0);
    expect(result[2].question).toEqual('Positive FAQ');
    expect(result[2].order_index).toEqual(1);
  });
});