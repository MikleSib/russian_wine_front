import { useEffect, useState } from "react";

const isClient = typeof window === "object";
const isMediaSupported = (api: string): boolean =>
  typeof window !== "undefined" ? api in window : false;

const useMediaQuery = (mediaQuery: string): boolean => {
  const [isVerified, setIsVerified] = useState(() => {
    if (!isClient || !isMediaSupported("matchMedia")) {
      console.warn("matchMedia is not supported");
      return false;
    }

    return window.matchMedia(mediaQuery).matches;
  });

  useEffect(() => {
    let active = true;

    const mediaQueryList = window.matchMedia(mediaQuery);
    const documentChangeHandler = () => {
      if (active) {
        setIsVerified(!!mediaQueryList.matches);
      }
    };

    try {
      mediaQueryList.addEventListener("change", documentChangeHandler);
    } catch (e) {
      // Safari isn't supporting mediaQueryList.addEventListener
      mediaQueryList.addListener(documentChangeHandler);
    }

    documentChangeHandler();

    return () => {
      active = false;

      try {
        mediaQueryList.removeEventListener("change", documentChangeHandler);
      } catch (e) {
        // Safari isn't supporting mediaQueryList.removeEventListener
        mediaQueryList.removeListener(documentChangeHandler);
      }
    };
  }, [mediaQuery]);

  return isVerified;
};

export default useMediaQuery;
