import { useState, useRef } from "react";
import useResizeObserver from "@react-hook/resize-observer";

export function useContainerWidth(): [
  React.RefObject<HTMLDivElement | null>,
  number
] {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useResizeObserver(ref, (entry) => {
    setWidth(entry.contentRect.width);
  });

  return [ref, width];
}

