import { Metadata } from 'next';
import { getAllPostsMeta, getAllTags } from '@/lib/blog';
import BlogIndex from '@/components/blog/BlogIndex';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'A learning log — notes on the math and code I find interesting.',
};

export default function BlogPage() {
    const posts = getAllPostsMeta();
    const tags = getAllTags();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogIndex posts={posts} tags={tags} />
        </div>
    );
}
