import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { MermaidZoom } from '@/components/mdx/mermaid-zoom';
import { CallbackFlowchart } from '@/components/mdx/callback-flowchart';
import { DanaNoticeCallout } from '@/components/mdx/dana-notice-callout';
import { DirectPaymentFlowchart } from '@/components/mdx/direct-payment-flowchart';
import { RedirectPaymentFlowchart } from '@/components/mdx/redirect-payment-flowchart';
import { SignatureFlowchart } from '@/components/mdx/signature-flowchart';
import { IpDomainValidationFlowchart } from '@/components/mdx/ip-domain-validation-flowchart';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    CallbackFlowchart,
    DanaNoticeCallout,
    DirectPaymentFlowchart,
    RedirectPaymentFlowchart,
    SignatureFlowchart,
    IpDomainValidationFlowchart,
    ...components,
    pre: ({ ref: _ref, ...props }) => (
      <div className="mdx-pre-wrapper border-2 border-black dark:border-white shadow-brutal dark:shadow-[4px_4px_0px_0px_#ffffff] bg-background rounded-none overflow-hidden my-6 transition-all w-full [&_.fd-scroll-container]:w-full [&_pre]:bg-transparent! [&_figure]:bg-transparent! [&_figure]:m-0!">
        <defaultMdxComponents.pre {...props} />
      </div>
    ),
    table: ({ ref: _ref, ...props }) => (
      <div className="mdx-table-wrapper border-2 border-black dark:border-white shadow-brutal dark:shadow-[4px_4px_0px_0px_#ffffff] bg-background rounded-none my-6 transition-all w-full overflow-x-auto">
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
        return <MermaidZoom src={props.src} alt={props.alt || 'Diagram Flow iPaymu'} />;
      }
      if (defaultMdxComponents.img) {
        return <defaultMdxComponents.img {...props} />
      }
      return <img {...props} alt={props.alt || ""} />
    },
  };
}
