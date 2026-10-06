import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { MermaidZoom } from '@/components/mdx/mermaid-zoom';
import { CallbackFlowchart } from '@/components/mdx/callback-flowchart';
import { DanaNoticeCallout } from '@/components/mdx/dana-notice-callout';
import { DirectPaymentFlowchart } from '@/components/mdx/direct-payment-flowchart';
import { RedirectPaymentFlowchart } from '@/components/mdx/redirect-payment-flowchart';
import { SignatureFlowchart } from '@/components/mdx/signature-flowchart';
import { IpDomainValidationFlowchart } from '@/components/mdx/ip-domain-validation-flowchart';
import { EnvironmentInlineCode, EnvironmentPre } from '@/components/mdx/environment-code';
import { ApiRequestHeaders } from '@/components/mdx/api-request-headers';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    CallbackFlowchart,
    DanaNoticeCallout,
    DirectPaymentFlowchart,
    RedirectPaymentFlowchart,
    SignatureFlowchart,
    IpDomainValidationFlowchart,
    ApiRequestHeaders,
    ...components,
    code: EnvironmentInlineCode,
    pre: ({ ref: _ref, ...props }) => (
      <div className="mdx-pre-wrapper my-6 w-full overflow-hidden rounded-xl">
        <EnvironmentPre {...props} />
      </div>
    ),
    table: ({ ref: _ref, ...props }) => (
      <div className="mdx-table-wrapper my-6 w-full overflow-x-auto">
        <table className="w-full text-left text-sm m-0!" {...props} />
      </div>
    ),
    th: ({ ref: _ref, ...props }) => (
      <th className="px-4 py-3 font-semibold" {...props} />
    ),
    td: ({ ref: _ref, ...props }) => (
      <td className="px-4 py-3" {...props} />
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
