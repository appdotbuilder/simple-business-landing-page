import { z } from 'zod';

// Page schema for static content pages
export const pageSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  content: z.string(),
  is_published: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Page = z.infer<typeof pageSchema>;

// Service schema
export const serviceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  price: z.number().nullable(),
  is_active: z.boolean(),
  order_index: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Service = z.infer<typeof serviceSchema>;

// Product schema
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  image_url: z.string().nullable(),
  category: z.string().nullable(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

// Gallery item schema
export const galleryItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string(),
  category: z.string().nullable(),
  order_index: z.number().int(),
  is_active: z.boolean(),
  created_at: z.coerce.date()
});

export type GalleryItem = z.infer<typeof galleryItemSchema>;

// Blog post schema
export const blogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  featured_image: z.string().nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  is_published: z.boolean(),
  published_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type BlogPost = z.infer<typeof blogPostSchema>;

// FAQ schema
export const faqSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
  category: z.string().nullable(),
  order_index: z.number().int(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type FAQ = z.infer<typeof faqSchema>;

// Contact message schema
export const contactMessageSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  subject: z.string().nullable(),
  message: z.string(),
  is_read: z.boolean(),
  created_at: z.coerce.date()
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

// Input schemas for creating/updating entities

// Page input schemas
export const createPageInputSchema = z.object({
  slug: z.string(),
  title: z.string(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  content: z.string(),
  is_published: z.boolean().default(true)
});

export type CreatePageInput = z.infer<typeof createPageInputSchema>;

export const updatePageInputSchema = z.object({
  id: z.number(),
  slug: z.string().optional(),
  title: z.string().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  content: z.string().optional(),
  is_published: z.boolean().optional()
});

export type UpdatePageInput = z.infer<typeof updatePageInputSchema>;

// Service input schemas
export const createServiceInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().nullable(),
  price: z.number().nullable(),
  is_active: z.boolean().default(true),
  order_index: z.number().int()
});

export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;

// Product input schemas
export const createProductInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  image_url: z.string().nullable(),
  category: z.string().nullable(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true)
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

// Gallery item input schemas
export const createGalleryItemInputSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string(),
  category: z.string().nullable(),
  order_index: z.number().int(),
  is_active: z.boolean().default(true)
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemInputSchema>;

// Blog post input schemas
export const createBlogPostInputSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  featured_image: z.string().nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  is_published: z.boolean().default(false)
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostInputSchema>;

// FAQ input schemas
export const createFaqInputSchema = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string().nullable(),
  order_index: z.number().int(),
  is_active: z.boolean().default(true)
});

export type CreateFaqInput = z.infer<typeof createFaqInputSchema>;

// Contact message input schema
export const createContactMessageInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  subject: z.string().nullable(),
  message: z.string()
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageInputSchema>;

// Query schemas for filtering and pagination
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10)
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const getPageBySlugInputSchema = z.object({
  slug: z.string()
});

export type GetPageBySlugInput = z.infer<typeof getPageBySlugInputSchema>;

export const getBlogPostBySlugInputSchema = z.object({
  slug: z.string()
});

export type GetBlogPostBySlugInput = z.infer<typeof getBlogPostBySlugInputSchema>;