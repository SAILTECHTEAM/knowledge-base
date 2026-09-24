import PhotoSwipeLightbox from 'photoswipe/lightbox';
import type {DataSource} from 'photoswipe';
import 'photoswipe/style.css';

const IMAGE_SELECTOR = '.markdown img:not(a img)';
const WHEEL_ZOOM_DURATION = 150;

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

function createLightbox(): PhotoSwipeLightbox {
  const lb = new PhotoSwipeLightbox({
    pswpModule: () => import('photoswipe'),
    wheelToZoom: true,
    closeOnVerticalDrag: false,
    pinchToClose: false,
  });
  enableSmoothWheelZoom(lb);
  lb.init();
  return lb;
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
  const img = (event.target as HTMLElement | null)?.closest(
    IMAGE_SELECTOR,
  ) as HTMLImageElement | null;
  if (!img || !img.naturalWidth || !img.naturalHeight) {
    return;
  }
  event.preventDefault();
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

export function onRouteUpdate(): void {
  if (typeof window === 'undefined' || lightbox) {
    return;
  }
  lightbox = createLightbox();
  document.addEventListener('click', handleDocumentClick);
}
