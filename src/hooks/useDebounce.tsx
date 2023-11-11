import { useState, useEffect } from "react";

export function useDebounce(value: string | number, delay: number): string | null | number {
  const [debouncedValue, setDebouncedValue] = useState<null | string | number>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
