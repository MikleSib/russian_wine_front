import { useEffect, useRef } from "react";

/**
 * Returns the previous value of the given value
 */

const usePreviousValue = (value: any) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};

export default usePreviousValue;
