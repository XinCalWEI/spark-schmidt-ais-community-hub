import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const common = {
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  updatedAt: z.coerce.date().optional(),
};

const opportunities = defineCollection({
  loader: glob({ base: './src/content/opportunities', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...common,
    title: z.string(),
    summary: z.string(),
    organization: z.string(),
    type: z.enum(['fellowship', 'job', 'grant', 'event', 'collaboration', 'challenge', 'other']),
    audiences: z.array(z.string()).default([]),
    locations: z.array(z.string()).default([]),
    deadline: z.coerce.date().optional(),
    deadlineLabel: z.string().optional(),
    rolling: z.boolean().default(false),
    officialUrl: z.url(),
    officialUrlLabel: z.string().optional(),
    applicationUrl: z.url().optional(),
    awardAmount: z.string().optional(),
    verifiedAt: z.coerce.date(),
    status: z.enum(['open', 'rolling', 'closing-soon', 'expired']),
  }),
});

const resources = defineCollection({
  loader: glob({ base: './src/content/resources', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...common,
    title: z.string(),
    summary: z.string(),
    type: z.enum(['tutorial', 'documentation', 'code', 'dataset', 'recording', 'report', 'toolkit', 'tool']),
    topics: z.array(z.string()).default([]),
    audiences: z.array(z.string()).default([]),
    level: z.enum(['introductory', 'intermediate', 'advanced', 'all-levels']).default('all-levels'),
    authors: z.array(z.string()).default([]),
    externalUrl: z.url(),
    license: z.string().optional(),
    verifiedAt: z.coerce.date(),
    status: z.enum(['available', 'planned', 'archived']).default('available'),
  }),
});

const events = defineCollection({
  loader: glob({ base: './src/content/events', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...common,
    title: z.string(),
    summary: z.string(),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
    dateLabel: z.string().optional(),
    timezone: z.string().optional(),
    format: z.enum(['in-person', 'online', 'hybrid', 'to-be-confirmed']),
    location: z.string().optional(),
    registrationUrl: z.url().optional(),
    status: z.enum(['planning', 'upcoming', 'in-progress', 'completed', 'cancelled']),
  }),
});

const stories = defineCollection({
  loader: glob({ base: './src/content/stories', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...common,
    title: z.string(),
    summary: z.string(),
    publishedAt: z.coerce.date(),
    authors: z.array(z.string()).default([]),
    type: z.enum(['announcement', 'story', 'project-highlight', 'report']),
  }),
});

const programScheduleItem = z.object({
  time: z.string().min(1),
  title: z.string().min(1),
  kind: z.enum(['arrival', 'meal', 'session', 'break', 'discussion', 'workshop', 'project-work', 'community', 'reflection']),
  description: z.string().min(1).optional(),
  details: z.array(z.string().min(1)).default([]),
}).strict();

const sessions = defineCollection({
  loader: glob({ base: './src/content/sessions', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...common,
    title: z.string(),
    summary: z.string(),
    day: z.number().int().min(0).max(10),
    order: z.number().int().min(0),
    dayTitle: z.string(),
    format: z.enum(['welcome', 'talks', 'workshop', 'project-work', 'reflection', 'community']),
    status: z.enum(['illustrative', 'confirmed', 'changed']).default('illustrative'),
    dayNotes: z.array(z.string().min(1)).default([]),
    schedule: z.array(programScheduleItem).min(1),
  }).strict(),
});

const fellows = defineCollection({
  loader: glob({ base: './src/content/fellows', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ...common,
    name: z.string(),
    fellowshipStatus: z.enum(['current', 'alumni']),
    cohort: z.string().optional(),
    title: z.string().optional(),
    institution: z.string(),
    summary: z.string(),
    disciplines: z.array(z.string()).default([]),
    profileUrl: z.url().optional(),
    consentToPublish: z.boolean().default(false),
  }),
});

export const collections = { opportunities, resources, events, stories, sessions, fellows };
