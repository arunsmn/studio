import { useRef, useEffect, useCallback } from "react";

interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  clear: () => void;
}

export function useCanvas(): UseCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Setup canvas resolution on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function setup() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;

      ctx!.scale(dpr, dpr);
      canvas!.style.width = rect.width + "px";
      canvas!.style.height = rect.height + "px";

      // Restore pen styles after setup
      ctx!.strokeStyle = "#1C1A17";
      ctx!.lineWidth = 3;
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";
    }

    setup();

    window.addEventListener("resize", setup);
    return () => window.removeEventListener("resize", setup);
  }, []);

  // Drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isDrawing = false;

    function getPos(e: MouseEvent | TouchEvent) {
      const rect = canvas!.getBoundingClientRect();
      if ("touches" in e) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      }
      return { x: e.offsetX, y: e.offsetY };
    }

    function startDrawing(e: MouseEvent | TouchEvent) {
      e.preventDefault();
      isDrawing = true;
      const pos = getPos(e);
      ctx!.beginPath();
      ctx!.moveTo(pos.x, pos.y);
    }

    function draw(e: MouseEvent | TouchEvent) {
      e.preventDefault();
      if (!isDrawing) return;
      const pos = getPos(e);
      ctx!.lineTo(pos.x, pos.y);
      ctx!.stroke();
    }

    function stopDrawing() {
      isDrawing = false;
    }

    // Mouse
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    // Touch
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);

    // Cleanup — remove all listeners when component unmounts
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
    };
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  return { canvasRef, clear };
}
