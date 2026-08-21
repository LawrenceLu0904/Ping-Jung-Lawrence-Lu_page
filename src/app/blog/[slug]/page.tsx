import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { formatPostDate } from '@/lib/blog-format';
import MarkdownRenderer from '@/components/blog/MarkdownRenderer';
import NotebookRenderer from '@/components/blog/NotebookRenderer';

export function generateStaticParams() {
    return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) {
        return {};
    }
    return {
        title: post.title,
        description: post.summary,
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-accent transition-colors mb-8"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to all posts
            </Link>

            <header className="mb-10">
                <h1 className="text-4xl font-serif font-bold text-primary mb-4 leading-tight">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-500">
                    {post.date && <time dateTime={post.date}>{formatPostDate(post.date)}</time>}
                    <span aria-hidden="true">·</span>
                    <span>{post.readingTime} min read</span>
                    {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {post.format === 'notebook' && post.cells ? (
                <NotebookRenderer cells={post.cells} />
            ) : (
                <MarkdownRenderer content={post.content} />
            )}
        </div>
    );
}
