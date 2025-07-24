import { useEffect, useState, useRef } from "react";

export function useContainerQuery(
  breakpoint: number
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setIsNarrow(width < breakpoint);
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [breakpoint]);

  return [containerRef, isNarrow];
}

