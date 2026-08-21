'use client';

import { NotebookCell, NotebookOutput } from '@/types/blog';
import MarkdownRenderer from './MarkdownRenderer';

/**
 * Renders a parsed Jupyter notebook: markdown cells get full prose/math
 * treatment, code cells are syntax-highlighted, and each code cell's outputs
 * (stdout, plots, DataFrame tables, errors) are shown directly beneath it.
 */
export default function NotebookRenderer({ cells }: { cells: NotebookCell[] }) {
    return (
        <div className="notebook">
            {cells.map((cell, index) =>
                cell.type === 'markdown' ? (
                    <MarkdownRenderer key={index} content={cell.source} />
                ) : (
                    <CodeCell key={index} source={cell.source} language={cell.language} outputs={cell.outputs} />
                )
            )}
        </div>
    );
}

function CodeCell({
    source,
    language,
    outputs,
}: {
    source: string;
    language: string;
    outputs: NotebookOutput[];
}) {
    return (
        <div className="my-6">
            <div className="[&_pre]:my-0">
                <MarkdownRenderer content={'```' + language + '\n' + source + '\n```'} />
            </div>
            {outputs.length > 0 && (
                <div className="mt-2 space-y-2">
                    {outputs.map((output, index) => (
                        <OutputBlock key={index} output={output} />
                    ))}
                </div>
            )}
        </div>
    );
}

function OutputBlock({ output }: { output: NotebookOutput }) {
    if (output.kind === 'image') {
        return (
            <div className="bg-white rounded-lg p-3 inline-block max-w-full border border-neutral-200 dark:border-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={output.src} alt="Notebook output" loading="lazy" className="max-w-full h-auto" />
            </div>
        );
    }

    if (output.kind === 'html') {
        return (
            <div
                className="nb-html overflow-x-auto text-sm"
                dangerouslySetInnerHTML={{ __html: output.html }}
            />
        );
    }

    // text (stdout/stderr) and error
    const isError = output.kind === 'error';
    const isStderr = output.kind === 'text' && output.stream === 'stderr';
    const tone =
        isError || isStderr
            ? 'text-error border-error/30 bg-error/5'
            : 'text-neutral-700 dark:text-neutral-500 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50';

    return (
        <pre className={`font-mono text-sm whitespace-pre-wrap break-words rounded-lg border px-4 py-3 overflow-x-auto ${tone}`}>
            {output.text}
        </pre>
    );
}
