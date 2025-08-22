import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { faqTable } from '../db/schema';
import { type CreateFaqInput } from '../schema';
import { createFaq } from '../handlers/create_faq';
import { eq } from 'drizzle-orm';

// Simple test input with all required fields
const testInput: CreateFaqInput = {
  question: 'What services do you offer?',
  answer: 'We offer a wide range of digital services including web development, mobile apps, and digital marketing.',
  category: 'General',
  order_index: 1,
  is_active: true
};

describe('createFaq', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a FAQ entry', async () => {
    const result = await createFaq(testInput);

    // Basic field validation
    expect(result.question).toEqual('What services do you offer?');
    expect(result.answer).toEqual(testInput.answer);
    expect(result.category).toEqual('General');
    expect(result.order_index).toEqual(1);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save FAQ to database', async () => {
    const result = await createFaq(testInput);

    // Query using proper drizzle syntax
    const faqs = await db.select()
      .from(faqTable)
      .where(eq(faqTable.id, result.id))
      .execute();

    expect(faqs).toHaveLength(1);
    expect(faqs[0].question).toEqual('What services do you offer?');
    expect(faqs[0].answer).toEqual(testInput.answer);
    expect(faqs[0].category).toEqual('General');
    expect(faqs[0].order_index).toEqual(1);
    expect(faqs[0].is_active).toEqual(true);
    expect(faqs[0].created_at).toBeInstanceOf(Date);
    expect(faqs[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create FAQ with null category', async () => {
    const inputWithNullCategory: CreateFaqInput = {
      question: 'How do I get started?',
      answer: 'Simply contact us through our contact form.',
      category: null,
      order_index: 2,
      is_active: true
    };

    const result = await createFaq(inputWithNullCategory);

    expect(result.question).toEqual('How do I get started?');
    expect(result.answer).toEqual('Simply contact us through our contact form.');
    expect(result.category).toBeNull();
    expect(result.order_index).toEqual(2);
    expect(result.is_active).toEqual(true);
  });

  it('should create inactive FAQ', async () => {
    const inactiveInput: CreateFaqInput = {
      question: 'Is this service discontinued?',
      answer: 'This service is currently under review.',
      category: 'Deprecated',
      order_index: 99,
      is_active: false
    };

    const result = await createFaq(inactiveInput);

    expect(result.question).toEqual('Is this service discontinued?');
    expect(result.is_active).toEqual(false);
    expect(result.category).toEqual('Deprecated');
    expect(result.order_index).toEqual(99);
  });

  it('should handle different order indices', async () => {
    // Create multiple FAQs with different order indices
    const faq1 = await createFaq({
      question: 'First question?',
      answer: 'First answer.',
      category: 'Test',
      order_index: 1,
      is_active: true
    });

    const faq2 = await createFaq({
      question: 'Second question?',
      answer: 'Second answer.',
      category: 'Test',
      order_index: 2,
      is_active: true
    });

    expect(faq1.order_index).toEqual(1);
    expect(faq2.order_index).toEqual(2);

    // Verify both are saved
    const allFaqs = await db.select()
      .from(faqTable)
      .execute();

    expect(allFaqs).toHaveLength(2);
    expect(allFaqs.find(f => f.id === faq1.id)?.order_index).toEqual(1);
    expect(allFaqs.find(f => f.id === faq2.id)?.order_index).toEqual(2);
  });

  it('should handle long content', async () => {
    const longInput: CreateFaqInput = {
      question: 'What is your detailed process for web development projects?',
      answer: `Our web development process involves several key phases:

1. Discovery and Planning: We work with you to understand your business goals, target audience, and technical requirements.

2. Design and Prototyping: Our design team creates wireframes and mockups to visualize the final product.

3. Development: Our experienced developers build your website using modern technologies and best practices.

4. Testing: We thoroughly test your website across different browsers and devices to ensure optimal performance.

5. Deployment: We deploy your website to production servers and provide ongoing support.

6. Maintenance: We offer ongoing maintenance and updates to keep your website secure and up-to-date.

This comprehensive approach ensures that your website meets your needs and exceeds your expectations.`,
      category: 'Development Process',
      order_index: 10,
      is_active: true
    };

    const result = await createFaq(longInput);

    expect(result.question).toEqual(longInput.question);
    expect(result.answer).toEqual(longInput.answer);
    expect(result.category).toEqual('Development Process');
    expect(result.answer.length).toBeGreaterThan(500);
  });
});