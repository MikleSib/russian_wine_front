import { useContext } from "react";

import { RefreshContext } from "../context/RefreshContext";

const useRefresh = () => {
  const { fast, slow, veryFast } = useContext(RefreshContext);
  return { fastRefresh: fast, slowRefresh: slow, veryFastRefresh: veryFast };
};

export default useRefresh;
