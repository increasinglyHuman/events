"use client";

import { useState, useEffect } from "react";

export function useIframeDetect(): boolean {
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch {
      setIsIframe(true);
    }
  }, []);

  return isIframe;
}
