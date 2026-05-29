"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      prevent: (node) => {
        return (
          node.nodeName === "ASIDE" ||
          node.hasAttribute("data-lenis-prevent") ||
          (node.closest &&
            (node.closest("aside") !== null ||
              node.closest(".overflow-y-auto") !== null))
        );
      },
    });

    // @ts-ignore
    window.lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      // @ts-ignore
      window.lenis = null;
      lenis.destroy();
    };
  }, []);

  return null;
}
