'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';

/**
 * Markdown renderer for long-form blog posts.
 * Adds LaTeX math (KaTeX), GitHub-flavored markdown, and syntax-highlighted
 * code on top of the same typographic styles used elsewhere on the site.
 */
export default function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div className="text-neutral-700 dark:text-neutral-600 leading-relaxed text-lg">
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex, [rehypeHighlight, { detect: true, ignoreMissing: true }]]}
                components={{
                    h1: ({ children }) => <h1 className="text-3xl font-serif font-bold text-primary mt-10 mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-serif font-bold text-primary mt-10 mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-semibold text-primary mt-8 mb-3">{children}</h3>,
                    p: ({ children }) => <p className="mb-5 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-outside mb-5 space-y-2 ml-6">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-outside mb-5 space-y-2 ml-6">{children}</ol>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                    a: ({ ...props }) => (
                        <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent font-medium hover:underline transition-colors"
                        />
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-accent/50 pl-4 italic my-6 text-neutral-600 dark:text-neutral-500">
                            {children}
                        </blockquote>
                    ),
                    strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    hr: () => <hr className="my-8 border-neutral-200 dark:border-neutral-800" />,
                    img: ({ ...props }) => (
                        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                        <img {...props} className="rounded-xl my-6 mx-auto max-w-full" />
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                            <table className="w-full text-base border-collapse">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="border-b-2 border-neutral-300 dark:border-neutral-700">{children}</thead>,
                    th: ({ children }) => <th className="text-left font-semibold text-primary px-3 py-2">{children}</th>,
                    td: ({ children }) => <td className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">{children}</td>,
                    pre: ({ children }) => (
                        <pre className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 my-6 overflow-x-auto text-sm leading-relaxed">
                            {children}
                        </pre>
                    ),
                    code: ({ className, children, ...props }) => {
                        const isBlock = /\b(language-|hljs)/.test(className || '');
                        if (isBlock) {
                            return (
                                <code className={`${className ?? ''} font-mono`} {...props}>
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className="font-mono text-[0.9em] bg-neutral-100 dark:bg-neutral-800 text-accent-dark dark:text-accent px-1.5 py-0.5 rounded">
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
