import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const base = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  cover: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: base.extend({ category: z.string(), readingTime: z.string().default('6 分钟') }),
});
const brands = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/brands' }),
  schema: base.extend({ rating: z.number().min(0).max(5), price: z.number(), protocol: z.string(), latency: z.string(), unlock: z.string(), affiliateId: z.string().optional() }),
});
const topics = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/topics' }),
  schema: base.extend({ eyebrow: z.string().default('专题指南') }),
});

export const collections = { blog, brands, topics };
