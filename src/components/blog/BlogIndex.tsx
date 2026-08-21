'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BlogPostMeta } from '@/types/blog';
import { formatPostDate } from '@/lib/blog-format';

interface BlogIndexProps {
    posts: BlogPostMeta[];
    tags: string[];
}

export default function BlogIndex({ posts, tags }: BlogIndexProps) {
    const [activeTag, setActiveTag] = useState<string | null>(null);

    const visiblePosts = useMemo(
        () => (activeTag ? posts.filter((post) => post.tags.includes(activeTag)) : posts),
        [posts, activeTag]
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <div className="mb-8">
                <h1 className="text-4xl font-serif font-bold text-primary mb-4">Blog</h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-500 max-w-2xl">
                    A learning log - notes on the math and code I find interesting.
                </p>
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                    <FilterChip label="All" active={activeTag === null} onClick={() => setActiveTag(null)} />
                    {tags.map((tag) => (
                        <FilterChip
                            key={tag}
                            label={tag}
                            active={activeTag === tag}
                            onClick={() => setActiveTag(tag)}
                        />
                    ))}
                </div>
            )}

            {visiblePosts.length === 0 ? (
                <p className="text-neutral-500">No posts yet. Check back soon.</p>
            ) : (
                <div className="grid gap-6">
                    {visiblePosts.map((post, index) => (
                        <motion.div
                            key={post.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.05 * index }}
                        >
                            <Link href={`/blog/${post.slug}`} className="block group">
                                <article className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
                                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                        <h2 className="text-xl font-semibold text-primary group-hover:text-accent transition-colors">
                                            {post.title}
                                        </h2>
                                        {post.date && (
                                            <span className="text-sm text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded whitespace-nowrap">
                                                {formatPostDate(post.date)}
                                            </span>
                                        )}
                                    </div>
                                    {post.summary && (
                                        <p className="text-base text-neutral-600 dark:text-neutral-500 leading-relaxed mb-4">
                                            {post.summary}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {post.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        <span className="text-xs text-neutral-400 ml-auto">
                                            {post.readingTime} min read
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                active
                    ? 'text-sm px-3 py-1.5 rounded-full bg-accent text-white font-medium transition-colors'
                    : 'text-sm px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-accent/10 hover:text-primary transition-colors'
            }
        >
            {label}
        </button>
    );
}
