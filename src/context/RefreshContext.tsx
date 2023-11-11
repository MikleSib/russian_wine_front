import React, { FC, useState, useEffect, createContext } from "react";

import useTabVisibility from "hooks/useTabVisibility";
import { FAST_INTERVAL, SLOW_INTERVAL, VERY_FAST_INTERVAL } from "../constants";

export const RefreshContext = createContext({ slow: 0, fast: 0, veryFast: 0 });

const RefreshContextProvider: FC = ({ children }) => {
  const [slow, setSlow] = useState(0);
  const [fast, setFast] = useState(0);
  const [veryFast, setVeryFast] = useState(0);
  const { tabVisibleRef } = useTabVisibility();

  useEffect(() => {
    const interval = setInterval(() => {
      if (tabVisibleRef.current) {
        setVeryFast((prevState) => prevState + 1);
      }
    }, VERY_FAST_INTERVAL);

    return () => clearInterval(interval);
  }, [tabVisibleRef]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (tabVisibleRef.current) {
        setFast((prevState) => prevState + 1);
      }
    }, FAST_INTERVAL);

    return () => clearInterval(interval);
  }, [tabVisibleRef]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (tabVisibleRef.current) {
        setSlow((prevState) => prevState + 1);
      }
    }, SLOW_INTERVAL);

    return () => clearInterval(interval);
  }, [tabVisibleRef]);

  return (
    <RefreshContext.Provider value={{ slow, fast, veryFast }}>{children}</RefreshContext.Provider>
  );
};

export default RefreshContextProvider;
