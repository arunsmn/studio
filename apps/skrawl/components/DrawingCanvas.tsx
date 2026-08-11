"use client";

import { useCanvas } from "../hooks/useCanvas";

export function DrawingCanvas() {
  const { canvasRef, clear } = useCanvas();

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <canvas
        ref={canvasRef}
        className="w-full max-w-[480px] rounded-2xl"
        style={{
          aspectRatio: "1",
          background: "var(--canvas-bg)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
        }}
      />
      <button
        onClick={clear}
        className="px-6 py-2 rounded-full text-sm font-medium text-white"
        style={{ background: "var(--accent)" }}
      >
        Clear
      </button>
    </div>
  );
}
