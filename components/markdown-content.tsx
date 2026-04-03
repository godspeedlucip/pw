import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { MermaidDiagram } from "@/components/mermaid-diagram";

type MarkdownContentProps = {
  content: string;
};

function extractCodeText(children: React.ReactNode) {
  return String(children).replace(/\n$/, "");
}

function isMermaidBlock(language: string | undefined, code: string) {
  if (language === "mermaid") return true;

  const trimmed = code.trimStart();
  return (
    trimmed.startsWith("flowchart") ||
    trimmed.startsWith("graph") ||
    trimmed.startsWith("sequenceDiagram") ||
    trimmed.startsWith("classDiagram") ||
    trimmed.startsWith("stateDiagram") ||
    trimmed.startsWith("erDiagram") ||
    trimmed.startsWith("journey") ||
    trimmed.startsWith("gantt") ||
    trimmed.startsWith("pie") ||
    trimmed.startsWith("mindmap") ||
    trimmed.startsWith("timeline")
  );
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="markdown-content text-slate-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          img: ({ src, alt }) => (
            <img
              src={src || ""}
              alt={alt || ""}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match?.[1]?.toLowerCase();
            const codeText = extractCodeText(children);
            const isInlineCode = !className && !codeText.includes("\n");

            if (!isInlineCode && isMermaidBlock(language, codeText)) {
              return <MermaidDiagram chart={codeText} />;
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}