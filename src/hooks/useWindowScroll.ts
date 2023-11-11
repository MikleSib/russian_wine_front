import { useState, useEffect } from "react";
import throttle from "lodash.throttle";

export default function useWindowScroll(classSelector: string): boolean {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (selector: HTMLElement) => {
    const scrollTop: number =
      (document.body.scrollTop || document.querySelector("html")?.scrollTop) ?? 0;
    const offset: boolean | number = selector && selector.offsetTop - 72;

    setScrolled(!!offset && scrollTop >= offset);
  };

  useEffect(() => {
    let funcEventListener: (() => void) | undefined;

    if (classSelector) {
      const selector: HTMLElement | null = document.querySelector(classSelector);

      if (selector) {
        funcEventListener = throttle(() => handleScroll(selector), 300);
        window.addEventListener("scroll", funcEventListener);
      }
    }

    return () => {
      if (funcEventListener) {
        window.removeEventListener("scroll", funcEventListener);
      }
      setScrolled(false);
    };
  }, []);

  return scrolled;
}
