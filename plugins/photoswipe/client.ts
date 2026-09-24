import PhotoSwipeLightbox from 'photoswipe/lightbox';
import type PhotoSwipe from 'photoswipe';
import type {DataSource, SlideData} from 'photoswipe';
import 'photoswipe/style.css';

const IMAGE_SELECTOR = '.markdown img:not(a img)';
const MERMAID_SVG_SELECTOR = '.docusaurus-mermaid-container svg';
const MERMAID_VIEWER_CLASS = 'pswp-mermaid-viewer';
const WHEEL_ZOOM_DURATION = 150;
const MAX_MERMAID_SCALE = 8;

let lightbox: PhotoSwipeLightbox | null = null;

// Built-in wheel zoom applies instantly (zoomTo without a duration).
// Intercept the wheel event and zoom with a short transition instead.
function enableSmoothWheelZoom(lb: PhotoSwipeLightbox): void {
  lb.on('wheel', (event) => {
    const {pswp} = lb;
    const slide = pswp?.currSlide;
    if (!pswp || !slide || !slide.isZoomable() || pswp.mainScroll.isShifted()) {
      return;
    }
    event.preventDefault();
    const {deltaY, deltaMode, clientX, clientY} = event.originalEvent;
    const zoomFactor = -deltaY * (deltaMode === 1 ? 0.05 : deltaMode ? 1 : 0.002);
    slide.zoomTo(
      slide.currZoomLevel * 2 ** zoomFactor,
      {x: clientX, y: clientY},
      WHEEL_ZOOM_DURATION,
    );
  });
}

interface ViewerPoint {
  x: number;
  y: number;
}

function mermaidSlideData(svg: SVGSVGElement): SlideData | null {
  const viewBox = svg.viewBox.baseVal;
  const rect = svg.getBoundingClientRect();
  const width = viewBox.width || rect.width;
  const height = viewBox.height || rect.height;
  if (!width || !height) {
    return null;
  }
  const clone = svg.cloneNode(true) as SVGSVGElement;
  if (svg.id) {
    const scopedId = `${svg.id}-lightbox`;
    for (const element of [clone, ...Array.from(clone.querySelectorAll('*'))]) {
      for (const attribute of Array.from(element.attributes)) {
        attribute.value = attribute.value.replaceAll(svg.id, scopedId);
      }
    }
    for (const style of Array.from(clone.querySelectorAll('style'))) {
      style.textContent = style.textContent?.replaceAll(svg.id, scopedId) ?? '';
    }
  }
  clone.removeAttribute('style');
  clone.setAttribute('width', '100%');
  clone.setAttribute('height', '100%');
  const html =
    `<div class="${MERMAID_VIEWER_CLASS}" style="touch-action:none;` +
    `width:100%;height:100%">${clone.outerHTML}</div>`;
  return {html, width, height, element: svg.parentElement ?? undefined};
}

// Zoom/pan for the mermaid HTML slide. PhotoSwipe only provides gestures for
// image slides, so the viewer clone is driven directly: its layout box is the
// diagram fitted to the viewport, and translate+scale (origin 0 0) is applied
// on top of that baseline.
function attachMermaidGestures(pswp: PhotoSwipe, viewer: HTMLElement): void {
  let scale = 1;
  let x = 0;
  let y = 0;
  const pointers = new Map<number, ViewerPoint>();
  let pinchDistance = 0;

  const apply = (): void => {
    viewer.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  };

  // At scale 1 the fitted diagram is centered in the viewport, so translate
  // (0, 0) is the rest position; panning is allowed only up to the overflow.
  const clampPan = (): void => {
    const {x: vw, y: vh} = pswp.viewportSize;
    const maxX = Math.max(0, (viewer.clientWidth * scale - vw) / 2);
    const maxY = Math.max(0, (viewer.clientHeight * scale - vh) / 2);
    x = Math.min(maxX, Math.max(-maxX, x));
    y = Math.min(maxY, Math.max(-maxY, y));
  };

  const zoomAt = (clientX: number, clientY: number, target: number): void => {
    const next = Math.min(MAX_MERMAID_SCALE, Math.max(1, target));
    const rect = viewer.getBoundingClientRect();
    // Viewport offset of the anchor (rect.top-left already includes the
    // current translate, since transform-origin is 0 0).
    const dx = clientX - rect.left;
    const dy = clientY - rect.top;
    const lx = dx / scale;
    const ly = dy / scale;
    scale = next;
    // Keep the anchor point fixed: translate compensates the scale change.
    x += dx - lx * scale;
    y += dy - ly * scale;
    clampPan();
    apply();
  };

  const onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const {deltaY, deltaMode} = event;
    const zoomFactor = -deltaY * (deltaMode === 1 ? 0.05 : deltaMode ? 1 : 0.002);
    zoomAt(event.clientX, event.clientY, scale * 2 ** zoomFactor);
  };

  const pointerDistance = (): number => {
    const [p1, p2] = [...pointers.values()];
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  };

  const pinchMidpoint = (): ViewerPoint => {
    const [p1, p2] = [...pointers.values()];
    return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (event.button > 0) {
      return;
    }
    // PhotoSwipe binds its gestures on the scroll wrap (bubble phase);
    // swallowing the event here keeps the drag from becoming swipe/close.
    event.stopPropagation();
    event.preventDefault();
    viewer.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    if (pointers.size === 2) {
      pinchDistance = pointerDistance();
    }
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!pointers.has(event.pointerId)) {
      return;
    }
    if (pointers.size === 1) {
      const prev = pointers.get(event.pointerId)!;
      x += event.clientX - prev.x;
      y += event.clientY - prev.y;
      clampPan();
      apply();
    }
    pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
    if (pointers.size === 2 && pinchDistance > 0) {
      const distance = pointerDistance();
      const mid = pinchMidpoint();
      zoomAt(mid.x, mid.y, scale * (distance / pinchDistance));
      pinchDistance = distance;
    }
  };

  const onPointerUp = (event: PointerEvent): void => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) {
      pinchDistance = 0;
    }
  };

  viewer.addEventListener('wheel', onWheel, {passive: false});
  viewer.addEventListener('pointerdown', onPointerDown);
  viewer.addEventListener('pointermove', onPointerMove);
  viewer.addEventListener('pointerup', onPointerUp);
  viewer.addEventListener('pointercancel', onPointerUp);
}

function enableMermaidSlides(lb: PhotoSwipeLightbox): void {
  lb.on('appendHeavyContent', ({slide}) => {
    const host = slide.content.element;
    const viewer = host?.querySelector(`:scope > .${MERMAID_VIEWER_CLASS}`);
    if (viewer instanceof HTMLElement && lb.pswp) {
      attachMermaidGestures(lb.pswp, viewer);
    }
  });
}

function createLightbox(): PhotoSwipeLightbox {
  const lb = new PhotoSwipeLightbox({
    pswpModule: () => import('photoswipe'),
    wheelToZoom: true,
    closeOnVerticalDrag: false,
    pinchToClose: false,
  });
  enableSmoothWheelZoom(lb);
  enableMermaidSlides(lb);
  lb.init();
  return lb;
}

function openImage(img: HTMLImageElement, event: MouseEvent): void {
  const dataSource: DataSource = [
    {
      src: img.currentSrc || img.src,
      msrc: img.currentSrc || img.src,
      width: img.naturalWidth,
      height: img.naturalHeight,
      element: img,
    },
  ];
  lightbox?.loadAndOpen(0, dataSource, {x: event.clientX, y: event.clientY});
}

function handleDocumentClick(event: MouseEvent): void {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  const target = event.target as HTMLElement | null;
  const img = target?.closest(IMAGE_SELECTOR) as HTMLImageElement | null;
  if (img) {
    if (!img.naturalWidth || !img.naturalHeight) {
      return;
    }
    event.preventDefault();
    openImage(img, event);
    return;
  }
  const svg = target?.closest(MERMAID_SVG_SELECTOR);
  if (svg instanceof SVGSVGElement) {
    const data = mermaidSlideData(svg);
    if (data) {
      event.preventDefault();
      lightbox?.loadAndOpen(0, [data], {x: event.clientX, y: event.clientY});
    }
  }
}

export function onRouteUpdate(): void {
  if (typeof window === 'undefined' || lightbox) {
    return;
  }
  lightbox = createLightbox();
  document.addEventListener('click', handleDocumentClick);
}
