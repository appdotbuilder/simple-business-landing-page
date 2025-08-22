import { type CreateServiceInput, type Service } from '../schema';

export async function createService(input: CreateServiceInput): Promise<Service> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is creating a new service with optional pricing and icon.
    // Services will be displayed on the "Layanan" page.
    return Promise.resolve({
        id: 0,
        title: input.title,
        description: input.description,
        icon: input.icon || null,
        price: input.price || null,
        is_active: input.is_active,
        order_index: input.order_index,
        created_at: new Date(),
        updated_at: new Date()
    } as Service);
}