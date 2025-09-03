import { App, MarkdownRenderer } from 'obsidian';
import { useCallback, useEffect, useRef } from 'react';
import { LifeinweeksView } from 'src/LifeinweeksView';

export default function useMarkdownRenderer(app: App, view: LifeinweeksView) {
  const contentRef = useRef<HTMLDivElement | null>(null);

// Cached render method
  const renderMarkdown = useCallback(
    async (path: string, content: string) => {
    // content is the file content passed in from outside
      if (!contentRef.current || !path || !app || !view) return;

      const target = content;

      if (contentRef.current.hasChildNodes()) {
        contentRef.current.empty(); // Use innerHTML = '' to clear child elements
      }
      
      await MarkdownRenderer.render(app, target, contentRef.current, path, view);

      contentRef.current?.toggleClass(['markdown-rendered'], true);
    }, 
    [app, view],
  );

  useEffect(() => {
    return () => {
      if (contentRef.current) {
        contentRef.current.empty();
      }
    };
  }, [renderMarkdown]);

  return {
    render: renderMarkdown,
    ref: contentRef,
  };
}
