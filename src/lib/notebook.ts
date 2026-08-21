import matter from 'gray-matter';
import { NotebookCell, NotebookOutput } from '@/types/blog';

/* Minimal nbformat shapes — only the fields we actually read. */
interface RawOutput {
    output_type: 'stream' | 'execute_result' | 'display_data' | 'error';
    name?: string;
    text?: string | string[];
    data?: Record<string, string | string[]>;
    traceback?: string[];
    ename?: string;
    evalue?: string;
}
interface RawCell {
    cell_type: 'markdown' | 'code' | 'raw';
    source: string | string[];
    outputs?: RawOutput[];
}
interface RawNotebook {
    cells?: RawCell[];
    metadata?: {
        language_info?: { name?: string };
        kernelspec?: { language?: string };
        frontmatter?: Record<string, unknown>;
        [key: string]: unknown;
    };
}

export interface ParsedNotebook {
    frontmatter: Record<string, unknown>;
    cells: NotebookCell[];
    /** Concatenated text used only for reading-time estimation. */
    plainText: string;
}

/** nbformat stores text as either a string or an array of line strings. */
function joinSource(source: string | string[] | undefined): string {
    if (Array.isArray(source)) return source.join('');
    return source ?? '';
}

/** Strip ANSI color escape codes (common in tracebacks / colored output). */
function stripAnsi(text: string): string {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\[[0-9;]*m/g, '');
}

/** Remove <script> tags and inline event handlers from notebook HTML output. */
function sanitizeHtml(html: string): string {
    return html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
        .replace(/\son\w+\s*=\s*'[^']*'/gi, '');
}

function imageOutput(data: Record<string, string | string[]>): NotebookOutput | null {
    for (const mime of ['image/png', 'image/jpeg', 'image/gif']) {
        if (data[mime]) {
            const b64 = joinSource(data[mime]).replace(/\s/g, '');
            return { kind: 'image', src: `data:${mime};base64,${b64}` };
        }
    }
    if (data['image/svg+xml']) {
        const svg = joinSource(data['image/svg+xml']);
        return { kind: 'image', src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` };
    }
    return null;
}

/** Convert one nbformat output into our normalized representation. */
function normalizeOutput(out: RawOutput): NotebookOutput | null {
    if (out.output_type === 'stream') {
        return {
            kind: 'text',
            text: joinSource(out.text),
            stream: out.name === 'stderr' ? 'stderr' : 'stdout',
        };
    }
    if (out.output_type === 'error') {
        const trace = (out.traceback ?? []).join('\n');
        const text = trace || `${out.ename ?? 'Error'}: ${out.evalue ?? ''}`;
        return { kind: 'error', text: stripAnsi(text) };
    }
    // execute_result | display_data: pick the richest representation we support.
    const data = out.data ?? {};
    const image = imageOutput(data);
    if (image) return image;
    if (data['text/html']) {
        return { kind: 'html', html: sanitizeHtml(joinSource(data['text/html'])) };
    }
    if (data['text/plain']) {
        return { kind: 'text', text: joinSource(data['text/plain']) };
    }
    return null;
}

function detectLanguage(nb: RawNotebook): string {
    return nb.metadata?.language_info?.name || nb.metadata?.kernelspec?.language || 'python';
}

/**
 * Parse a raw .ipynb JSON string into frontmatter + normalized cells.
 *
 * Frontmatter sources, in priority order:
 *   1. A leading raw/markdown cell whose body is a `--- ... ---` YAML block.
 *   2. The notebook's `metadata.frontmatter` object.
 * The frontmatter cell is dropped from the rendered output.
 */
export function parseNotebook(raw: string): ParsedNotebook {
    const nb = JSON.parse(raw) as RawNotebook;
    const rawCells = nb.cells ?? [];
    const language = detectLanguage(nb);

    let frontmatter: Record<string, unknown> = {
        ...(nb.metadata?.frontmatter as Record<string, unknown> | undefined),
    };

    // Pull frontmatter from a leading YAML cell, if present.
    let startIndex = 0;
    const first = rawCells[0];
    if (first && (first.cell_type === 'raw' || first.cell_type === 'markdown')) {
        const body = joinSource(first.source).trim();
        if (body.startsWith('---')) {
            try {
                const parsed = matter(body);
                if (Object.keys(parsed.data).length > 0) {
                    frontmatter = { ...parsed.data, ...frontmatter };
                    startIndex = 1;
                }
            } catch {
                // Not valid frontmatter — leave the cell in place.
            }
        }
    }

    const cells: NotebookCell[] = [];
    const textParts: string[] = [];

    for (const cell of rawCells.slice(startIndex)) {
        const source = joinSource(cell.source);
        if (cell.cell_type === 'markdown') {
            if (source.trim()) {
                cells.push({ type: 'markdown', source });
                textParts.push(source);
            }
        } else if (cell.cell_type === 'code') {
            const outputs = (cell.outputs ?? [])
                .map(normalizeOutput)
                .filter((o): o is NotebookOutput => o !== null);
            cells.push({ type: 'code', source, language, outputs });
            textParts.push(source);
        }
        // 'raw' cells (other than a frontmatter header) are skipped.
    }

    return { frontmatter, cells, plainText: textParts.join('\n') };
}
