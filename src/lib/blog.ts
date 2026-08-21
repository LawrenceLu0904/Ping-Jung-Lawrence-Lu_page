import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost, BlogPostMeta } from '@/types/blog';
import { parseNotebook } from '@/lib/notebook';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
const SOURCE_EXT = /\.(md|ipynb)$/;

/** Normalize a frontmatter date (string or YAML Date) to a YYYY-MM-DD string. */
function normalizeDate(value: unknown): string {
    if (value instanceof Date) {
        // Use UTC parts so the day doesn't shift across timezones.
        return value.toISOString().slice(0, 10);
    }
    if (typeof value === 'string') {
        return value.trim();
    }
    return '';
}

/** Rough reading time: ~200 words per minute, minimum 1 minute. */
function estimateReadingTime(text: string): number {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

function listSourceFiles(): string[] {
    if (!fs.existsSync(BLOG_DIR)) {
        return [];
    }
    // Ignore notebook checkpoint folders / non-source files.
    return fs.readdirSync(BLOG_DIR).filter((file) => SOURCE_EXT.test(file));
}

/** Build the shared metadata (title/date/tags/...) from a frontmatter object. */
function buildMeta(
    slug: string,
    data: Record<string, unknown>,
    format: BlogPostMeta['format'],
    readingTime: number
): BlogPostMeta {
    return {
        slug,
        title: typeof data.title === 'string' ? data.title : slug,
        date: normalizeDate(data.date),
        summary: typeof data.summary === 'string' ? data.summary : undefined,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        draft: data.draft === true,
        readingTime,
        format,
    };
}

function readPost(filename: string): BlogPost | null {
    try {
        const filePath = path.join(BLOG_DIR, filename);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const slug = filename.replace(SOURCE_EXT, '');

        if (filename.endsWith('.ipynb')) {
            const { frontmatter, cells, plainText } = parseNotebook(raw);
            const meta = buildMeta(slug, frontmatter, 'notebook', estimateReadingTime(plainText));
            return { ...meta, content: '', cells };
        }

        const { data, content } = matter(raw);
        const meta = buildMeta(slug, data, 'markdown', estimateReadingTime(content));
        return { ...meta, content };
    } catch (error) {
        console.error(`Error loading blog post ${filename}:`, error);
        return null;
    }
}

/** All published posts (drafts excluded), newest first. */
export function getAllPosts(): BlogPost[] {
    return listSourceFiles()
        .map(readPost)
        .filter((post): post is BlogPost => post !== null && !post.draft)
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Lightweight metadata for every published post (no body/cells). */
export function getAllPostsMeta(): BlogPostMeta[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return getAllPosts().map(({ content, cells, ...meta }) => meta);
}

/** A single published post by slug, or null if not found / draft. */
export function getPostBySlug(slug: string): BlogPost | null {
    const post = getAllPosts().find((p) => p.slug === slug);
    return post ?? null;
}

/** Unique tags across all published posts, sorted alphabetically. */
export function getAllTags(): string[] {
    const tags = new Set<string>();
    getAllPosts().forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
}
