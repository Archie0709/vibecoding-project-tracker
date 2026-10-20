import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders user-written Markdown (12a, FR-21).
 *
 * Safety (NFR-16): react-markdown does NOT render raw HTML by default (no rehype-raw),
 * and its default URL transform strips unsafe link schemes such as `javascript:`, so
 * pasted content can't run scripts (OWASP XSS Prevention).
 * GFM adds tables, task lists and ~~strikethrough~~, matching what developers use on GitHub.
 *
 * Elements are styled individually with Tailwind so they follow DESIGN.md.
 */
const components = {
  h1: (props) => <h4 className="mb-2 mt-3 text-base font-semibold text-text-primary first:mt-0" {...props} />,
  h2: (props) => <h5 className="mb-2 mt-3 text-sm font-semibold text-text-primary first:mt-0" {...props} />,
  h3: (props) => <h6 className="mb-1 mt-3 text-sm font-semibold text-text-primary first:mt-0" {...props} />,
  h4: (props) => <h6 className="mb-1 mt-2 text-sm font-medium text-text-primary first:mt-0" {...props} />,
  p: (props) => <p className="mb-2 last:mb-0" {...props} />,
  ul: (props) => <ul className="mb-2 list-disc space-y-0.5 pl-5 last:mb-0" {...props} />,
  ol: (props) => <ol className="mb-2 list-decimal space-y-0.5 pl-5 last:mb-0" {...props} />,
  li: (props) => <li className="marker:text-text-muted" {...props} />,
  a: (props) => (
    <a
      className="text-brand-accent underline underline-offset-2"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote className="mb-2 border-l-2 border-border-strong pl-3 text-text-muted" {...props} />
  ),
  hr: () => <hr className="my-3 border-border-subtle" />,
  pre: (props) => (
    <pre className="mb-2 overflow-x-auto rounded-md bg-surface-page p-3 font-mono text-[13px] leading-relaxed" {...props} />
  ),
  code: ({ className, ...props }) => (
    // Inline code gets a chip; code inside <pre> inherits the block styling.
    <code className={`rounded bg-surface-page px-1 py-0.5 font-mono text-[13px] [pre_&]:bg-transparent [pre_&]:p-0 ${className ?? ''}`} {...props} />
  ),
  table: (props) => (
    <div className="mb-2 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  th: (props) => <th className="border border-border-subtle px-2 py-1 font-semibold" {...props} />,
  td: (props) => <td className="border border-border-subtle px-2 py-1" {...props} />,
  input: (props) => <input className="mr-1.5 accent-brand-primary" disabled {...props} />,
};

export default function Markdown({ children }) {
  return (
    <div className="break-words text-sm leading-relaxed text-text-primary">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
