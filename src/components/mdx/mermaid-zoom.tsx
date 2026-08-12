'use client';

import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, X, Maximize2, RotateCcw } from 'lucide-react';

interface MermaidZoomProps {
  src: string;
  alt?: string;
}

export function MermaidZoom({ src, alt = 'Diagram Flow iPaymu' }: MermaidZoomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleOpen = () => {
    setScale(1);
    setIsOpen(true);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  return (
    <div className="relative group my-6">
      {/* Thumbnail Container */}
      <div
        onClick={handleOpen}
        className="relative cursor-pointer overflow-hidden border-2 border-black dark:border-white shadow-brutal dark:shadow-[4px_4px_0px_0px_#ffffff] bg-white dark:bg-zinc-900 transition-all hover:scale-[1.005]"
        title="Klik untuk memperbesar diagram"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full max-h-[400px] object-contain mx-auto p-4 dark:invert"
        />

        {/* Hover Overlay Hint */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-sm">
          <Maximize2 className="w-5 h-5" />
          <span>Klik untuk memperbesar diagram</span>
        </div>

        {/* Badge in corner */}
        <div className="absolute bottom-2 right-2 bg-black/80 dark:bg-white/80 text-white dark:text-black text-xs px-2 py-1 flex items-center gap-1.5 shadow-sm rounded-none border border-black dark:border-white pointer-events-none">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Perbesar</span>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-between p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Header Controls */}
          <div
            className="w-full max-w-4xl flex items-center justify-between bg-zinc-900 text-white px-4 py-3 border-2 border-white shadow-brutal dark:shadow-[4px_4px_0px_0px_#ffffff] z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm md:text-base truncate">{alt}</span>
              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                ({Math.round(scale * 100)}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-zinc-800 border border-zinc-700 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetZoom}
                className="p-1.5 hover:bg-zinc-800 border border-zinc-700 transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-zinc-800 border border-zinc-700 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-zinc-700 mx-1" />

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
                title="Tutup (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Zoomable Image Viewport */}
          <div
            className="w-full h-full flex-1 overflow-auto flex items-center justify-center p-4 my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="transition-transform duration-150 ease-out origin-center"
              style={{ transform: `scale(${scale})` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="max-w-none bg-white p-6 rounded border-2 border-white shadow-2xl dark:invert"
              />
            </div>
          </div>

          {/* Modal Footer Hint */}
          <div className="text-xs text-zinc-400 pointer-events-none">
            Tekan <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded text-[10px]">ESC</kbd> atau klik di luar untuk menutup
          </div>
        </div>
      )}
    </div>
  );
}
