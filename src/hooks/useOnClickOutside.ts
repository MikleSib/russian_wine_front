import { MutableRefObject, useEffect } from "react";

export default function useClickOutSide(
  ref: MutableRefObject<HTMLElement | null>,
  handlerFn: (event: any) => unknown,
): void {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handlerFn(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handlerFn]);
}
