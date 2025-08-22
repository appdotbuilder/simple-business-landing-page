import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  numeric, 
  boolean, 
  integer 
} from 'drizzle-orm/pg-core';

// Pages table for static content (Beranda, Tentang Kami, etc.)
export const pagesTable = pgTable('pages', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  meta_title: text('meta_title'), // SEO meta title
  meta_description: text('meta_description'), // SEO meta description
  content: text('content').notNull(),
  is_published: boolean('is_published').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Services table for the "Layanan" page
export const servicesTable = pgTable('services', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon'), // Icon class or URL
  price: numeric('price', { precision: 10, scale: 2 }), // Optional pricing
  is_active: boolean('is_active').notNull().default(true),
  order_index: integer('order_index').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Products table for the "Produk" page
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  image_url: text('image_url'),
  category: text('category'),
  is_featured: boolean('is_featured').notNull().default(false),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Gallery table for the "Galeri" page
export const galleryTable = pgTable('gallery', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  image_url: text('image_url').notNull(),
  category: text('category'),
  order_index: integer('order_index').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Blog posts table for the "Blog" page
export const blogPostsTable = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featured_image: text('featured_image'),
  meta_title: text('meta_title'), // SEO meta title
  meta_description: text('meta_description'), // SEO meta description
  is_published: boolean('is_published').notNull().default(false),
  published_at: timestamp('published_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// FAQ table for the "FAQ" page
export const faqTable = pgTable('faq', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category'),
  order_index: integer('order_index').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Contact messages table for the "Kontak" page
export const contactMessagesTable = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject'),
  message: text('message').notNull(),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type Page = typeof pagesTable.$inferSelect;
export type NewPage = typeof pagesTable.$inferInsert;

export type Service = typeof servicesTable.$inferSelect;
export type NewService = typeof servicesTable.$inferInsert;

export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;

export type GalleryItem = typeof galleryTable.$inferSelect;
export type NewGalleryItem = typeof galleryTable.$inferInsert;

export type BlogPost = typeof blogPostsTable.$inferSelect;
export type NewBlogPost = typeof blogPostsTable.$inferInsert;

export type FAQ = typeof faqTable.$inferSelect;
export type NewFAQ = typeof faqTable.$inferInsert;

export type ContactMessage = typeof contactMessagesTable.$inferSelect;
export type NewContactMessage = typeof contactMessagesTable.$inferInsert;

// Export all tables for relation queries
export const tables = {
  pages: pagesTable,
  services: servicesTable,
  products: productsTable,
  gallery: galleryTable,
  blogPosts: blogPostsTable,
  faq: faqTable,
  contactMessages: contactMessagesTable,
};