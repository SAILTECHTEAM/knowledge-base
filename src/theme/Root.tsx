import type {ReactNode} from 'react';
import {useEffect} from 'react';

export default function Root({children}: {children: ReactNode}) {
  useEffect(() => {
    let stopDragging: (() => void) | undefined;

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 1 || !(event.target instanceof Element)) {
        return;
      }

      const table = event.target.closest<HTMLElement>('.wide-table');
      if (!table || table.scrollWidth <= table.clientWidth) {
        return;
      }

      stopDragging?.();
      event.preventDefault();

      const startX = event.clientX;
      const startScrollLeft = table.scrollLeft;
      table.classList.add('wide-table--dragging');

      const handleMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault();
        table.scrollLeft = startScrollLeft - (moveEvent.clientX - startX);
      };

      const finishDragging = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', finishDragging);
        window.removeEventListener('blur', finishDragging);
        table.classList.remove('wide-table--dragging');
        stopDragging = undefined;
      };

      stopDragging = finishDragging;
      document.addEventListener('mousemove', handleMouseMove, {passive: false});
      document.addEventListener('mouseup', finishDragging, {once: true});
      window.addEventListener('blur', finishDragging, {once: true});
    };

    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      stopDragging?.();
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return <>{children}</>;
}
