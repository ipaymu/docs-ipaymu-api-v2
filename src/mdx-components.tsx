import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    pre: ({ ref: _ref, ...props }) => (
      <div className="mdx-pre-wrapper border-2 border-black dark:border-white shadow-brutal dark:shadow-[4px_4px_0px_0px_#ffffff] bg-background rounded-none overflow-hidden my-6 transition-all [&_pre]:bg-transparent! [&_figure]:bg-transparent! [&_figure]:m-0!">
        <defaultMdxComponents.pre {...props} />
      </div>
    ),
    table: ({ ref: _ref, ...props }) => (
      <div className="mdx-table-wrapper border-2 border-black dark:border-white shadow-brutal dark:shadow-[4px_4px_0px_0px_#ffffff] bg-background rounded-none overflow-hidden my-6 transition-all w-full overflow-x-auto">
        <table className="w-full text-left text-sm m-0!" {...props} />
      </div>
    ),
    th: ({ ref: _ref, ...props }) => (
      <th className="border-b-2 border-black dark:border-white px-4 py-3 font-semibold bg-secondary/20 dark:bg-zinc-900/50" {...props} />
    ),
    td: ({ ref: _ref, ...props }) => (
      <td className="border-b border-black dark:border-white px-4 py-3" {...props} />
    ),
    tr: ({ ref: _ref, ...props }) => (
      <tr className="hover:bg-muted/50 transition-colors" {...props} />
    ),
    img: (props) => {
      if (typeof props.src === 'string' && props.src.startsWith('data:image/svg')) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={props.src} alt={props.alt || 'Mermaid Diagram'} className="w-full max-h-[400px] mx-auto dark:invert my-6 rounded-none border-2 border-black dark:border-white shadow-brutal dark:shadow-[4px_4px_0px_0px_#ffffff]" />
      }
      if (defaultMdxComponents.img) {
        return <defaultMdxComponents.img {...props} />
      }
      return <img {...props} alt={props.alt || ""} />
    },
  };
}
