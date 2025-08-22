import { type CreateContactMessageInput, type ContactMessage } from '../schema';

export async function createContactMessage(input: CreateContactMessageInput): Promise<ContactMessage> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is creating a new contact message from the "Kontak" page form.
    // This allows visitors to send inquiries through the contact form.
    return Promise.resolve({
        id: 0,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        subject: input.subject || null,
        message: input.message,
        is_read: false,
        created_at: new Date()
    } as ContactMessage);
}