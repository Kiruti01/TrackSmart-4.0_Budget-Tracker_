import { useState, useEffect } from "react";

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024); // Tailwind lg breakpoint
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
}
