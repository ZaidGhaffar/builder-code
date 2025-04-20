import { useState, useEffect } from 'react';

const useCanvasSize = (containerRef) => {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
        console.log(`Canvas size updated: ${width}x${height}`);
      }
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) resizeObserver.unobserve(containerRef.current);
    };
  }, [containerRef]);

  return { canvasSize };
};

export default useCanvasSize;