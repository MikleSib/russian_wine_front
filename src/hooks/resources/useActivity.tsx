import { useQuery } from "react-query";

import { SelfInfoApi } from "services/selfInfo/selfInfoApi";

interface UseActivityProps {
  pagination?: Pagination;
  filter?: Partial<{ [key in FilterName]: Array<string> }>;
}

interface UseActivityResult {
  isLoading: boolean;
  activities: Array<ActivityRaw>;
  totalPages: number;
  filters: Record<FilterName, BaseFilter>;
}

export function useActivity({ pagination, filter }: UseActivityProps): UseActivityResult {
  const { data, isLoading, isIdle } = useQuery(["activities", { pagination, filter }], () =>
    SelfInfoApi.getActivities({ body: { ...pagination, filters: filter } }),
  );

  const filters = (data?.response?.filterResponse?.filters || []).reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
  }, {} as Record<FilterName, BaseFilter>);

  return {
    isLoading: isIdle || isLoading,
    activities: data?.response?.records || [],
    totalPages: data?.response?.filterResponse?.totalPages || 0,
    filters,
  };
}
