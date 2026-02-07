import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 text-gray-900">{children}</h1>,
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800">{children}</h3>
    ),
    p: ({ children }) => <p className="mb-4 text-gray-600 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-gray-600">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-gray-600">{children}</ol>,
    li: ({ children }) => <li className="mb-2">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
    a: ({ href, children }) => (
      <a href={href} className="text-primary-600 hover:text-primary-700 underline">
        {children}
      </a>
    ),
    ...components,
  };
}
