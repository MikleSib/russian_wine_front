import { useQuery } from "react-query";

import { SimpleListApi } from "services/simpleList/simpleListApi";

interface UseTopRegionsResult {
  isLoading: boolean;
  regions: TopRegion[];
}

export function useTopRegions(): UseTopRegionsResult {
  const { data, isLoading, isIdle } = useQuery("top-regions", () => SimpleListApi.getTopRegions());

  return {
    isLoading: isIdle || isLoading,
    regions: data?.response || [],
  };
}
