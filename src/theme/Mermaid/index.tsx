import React, {useEffect, useRef, type ReactNode} from 'react';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import Translate from '@docusaurus/Translate';
import type {Mounted} from 'pele';
import type {Props} from '@theme/Mermaid';

import styles from './styles.module.css';

function ErrorFallback({
  error,
  tryAgain,
}: {
  error: Error;
  tryAgain: () => void;
}): ReactNode {
  return (
    <div className="alert alert--danger" role="alert">
      <p>{error.message}</p>
      <button
        type="button"
        className="button button--outline button--sm"
        onClick={tryAgain}>
        <Translate
          id="theme.ErrorPageContent.tryAgain"
          description="The label of the button to try again rendering when the React error boundary captures an error">
          Try again
        </Translate>
      </button>
    </div>
  );
}

// Pele replaces Mermaid.js as the rendering engine: it renders the same
// Mermaid syntax to SVG synchronously and themes via --pele-* CSS variables
// (mapped to the site palette in src/css/custom.css). The module is imported
// dynamically so diagrams stay out of the main bundle.
let pelePromise: Promise<typeof import('pele')> | null = null;

function loadPele(): Promise<typeof import('pele')> {
  pelePromise ??= import('pele');
  return pelePromise;
}

function PeleDiagram({value}: Props): ReactNode {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) {
      return undefined;
    }
    let mounted: Mounted | undefined;
    let stale = false;
    loadPele().then((pele) => {
      // mount() doesn't throw: parse/render errors are drawn inside the
      // container (styled with --pele-error), like Obsidian does.
      if (!stale) {
        mounted = pele.mount(container, value);
      }
    });
    return () => {
      stale = true;
      mounted?.destroy();
      container.innerHTML = '';
    };
  }, [value]);

  // Keep the stable docusaurus-mermaid-container className: the PhotoSwipe
  // plugin targets `.docusaurus-mermaid-container svg` to open the lightbox.
  return (
    <div
      ref={ref}
      className={`docusaurus-mermaid-container ${styles.container}`}
    />
  );
}

export default function Mermaid(props: Props): ReactNode {
  return (
    <ErrorBoundary fallback={(params) => <ErrorFallback {...params} />}>
      <PeleDiagram {...props} />
    </ErrorBoundary>
  );
}
