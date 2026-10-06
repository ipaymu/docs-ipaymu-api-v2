"use client";

import { Children, cloneElement, isValidElement, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from "react";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { replaceRequestEnvironment, useEnvironment, type Environment } from "@/components/environment";

function transformCode(node: ReactNode, environment: Environment): ReactNode {
  if (typeof node === "string") return replaceRequestEnvironment(node, environment);
  if (Array.isArray(node)) return Children.map(node, (child) => transformCode(child, environment));
  if (!isValidElement(node)) return node;

  const element = node as ReactElement<{ children?: ReactNode }>;
  if (element.props.children === undefined) return node;
  return cloneElement(element, { children: Children.map(element.props.children, (child) => transformCode(child, environment)) });
}

export function EnvironmentInlineCode(props: ComponentPropsWithoutRef<"code">) {
  const { environment } = useEnvironment();
  return <code {...props}>{transformCode(props.children, environment)}</code>;
}

export function EnvironmentPre(props: ComponentPropsWithoutRef<"pre">) {
  const { environment } = useEnvironment();
  const Pre = defaultMdxComponents.pre;
  return <Pre {...props}>{transformCode(props.children, environment)}</Pre>;
}
