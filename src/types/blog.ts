export interface BlogPostMeta {
    /** URL slug, derived from the source filename (without extension). */
    slug: string;
    /** Post title shown in listings and at the top of the post. */
    title: string;
    /** ISO date string (YYYY-MM-DD) used for sorting and display. */
    date: string;
    /** Short summary shown on the blog index card. */
    summary?: string;
    /** Topic tags used for filtering on the index page. */
    tags: string[];
    /** When true, the post is hidden from the index and not built. */
    draft?: boolean;
    /** Estimated reading time in minutes, computed from word count. */
    readingTime: number;
    /** Source format: a plain markdown file or a Jupyter notebook. */
    format: 'markdown' | 'notebook';
}

/** A single rendered output of a notebook code cell. */
export type NotebookOutput =
    | { kind: 'text'; text: string; stream?: 'stdout' | 'stderr' }
    | { kind: 'image'; src: string }
    | { kind: 'html'; html: string }
    | { kind: 'error'; text: string };

/** A normalized notebook cell ready for rendering. */
export type NotebookCell =
    | { type: 'markdown'; source: string }
    | { type: 'code'; source: string; language: string; outputs: NotebookOutput[] };

export interface BlogPost extends BlogPostMeta {
    /** Raw markdown body (markdown posts only; empty for notebooks). */
    content: string;
    /** Parsed notebook cells (notebook posts only). */
    cells?: NotebookCell[];
}
