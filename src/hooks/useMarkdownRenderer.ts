import { App, MarkdownRenderer } from 'obsidian';
import { useCallback, useEffect, useRef } from 'react';
import { LifeinweeksView, VIEW_TYPE_LIFEINWEEKS } from 'src/LifeinweeksView';

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

      const embeds = contentRef.current?.querySelectorAll('.internal-link');
      embeds?.forEach((embed) => {
        const el = embed as HTMLAnchorElement;
        const href = el.getAttribute('data-href');
        if (!href) return;

        const destination = app.metadataCache.getFirstLinkpathDest(href, path);
        if (!destination) embed.classList.add('is-unresolved');

        el.addEventListener('mouseover', (e) => {
          e.stopPropagation();
          app.workspace.trigger('hover-link', {
            event: e,
            source: VIEW_TYPE_LIFEINWEEKS,
            hoverParent: view.containerEl,
            targetEl: el,
            linktext: href,
            sourcePath: el.href,
          });
        });
      });
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
