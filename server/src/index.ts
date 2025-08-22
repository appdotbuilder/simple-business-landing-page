import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createPageInputSchema,
  getPageBySlugInputSchema,
  createServiceInputSchema,
  createProductInputSchema,
  createGalleryItemInputSchema,
  createBlogPostInputSchema,
  getBlogPostBySlugInputSchema,
  createFaqInputSchema,
  createContactMessageInputSchema,
  paginationSchema,
} from './schema';

// Import handlers
import { getPages } from './handlers/get_pages';
import { getPageBySlug } from './handlers/get_page_by_slug';
import { createPage } from './handlers/create_page';
import { getServices } from './handlers/get_services';
import { createService } from './handlers/create_service';
import { getProducts } from './handlers/get_products';
import { createProduct } from './handlers/create_product';
import { getGalleryItems } from './handlers/get_gallery_items';
import { createGalleryItem } from './handlers/create_gallery_item';
import { getBlogPosts } from './handlers/get_blog_posts';
import { getBlogPostBySlug } from './handlers/get_blog_post_by_slug';
import { createBlogPost } from './handlers/create_blog_post';
import { getFaqs } from './handlers/get_faqs';
import { createFaq } from './handlers/create_faq';
import { createContactMessage } from './handlers/create_contact_message';
import { getContactMessages } from './handlers/get_contact_messages';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Page management routes (for static content like Beranda, Tentang Kami, etc.)
  getPages: publicProcedure
    .query(() => getPages()),
  getPageBySlug: publicProcedure
    .input(getPageBySlugInputSchema)
    .query(({ input }) => getPageBySlug(input)),
  createPage: publicProcedure
    .input(createPageInputSchema)
    .mutation(({ input }) => createPage(input)),

  // Service management routes (for Layanan page)
  getServices: publicProcedure
    .query(() => getServices()),
  createService: publicProcedure
    .input(createServiceInputSchema)
    .mutation(({ input }) => createService(input)),

  // Product management routes (for Produk page)
  getProducts: publicProcedure
    .query(() => getProducts()),
  createProduct: publicProcedure
    .input(createProductInputSchema)
    .mutation(({ input }) => createProduct(input)),

  // Gallery management routes (for Galeri page)
  getGalleryItems: publicProcedure
    .query(() => getGalleryItems()),
  createGalleryItem: publicProcedure
    .input(createGalleryItemInputSchema)
    .mutation(({ input }) => createGalleryItem(input)),

  // Blog management routes (for Blog page)
  getBlogPosts: publicProcedure
    .input(paginationSchema.optional())
    .query(({ input }) => getBlogPosts(input)),
  getBlogPostBySlug: publicProcedure
    .input(getBlogPostBySlugInputSchema)
    .query(({ input }) => getBlogPostBySlug(input)),
  createBlogPost: publicProcedure
    .input(createBlogPostInputSchema)
    .mutation(({ input }) => createBlogPost(input)),

  // FAQ management routes (for FAQ page)
  getFaqs: publicProcedure
    .query(() => getFaqs()),
  createFaq: publicProcedure
    .input(createFaqInputSchema)
    .mutation(({ input }) => createFaq(input)),

  // Contact management routes (for Kontak page)
  createContactMessage: publicProcedure
    .input(createContactMessageInputSchema)
    .mutation(({ input }) => createContactMessage(input)),
  getContactMessages: publicProcedure
    .input(paginationSchema.optional())
    .query(({ input }) => getContactMessages(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();