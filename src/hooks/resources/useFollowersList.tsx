import { useQuery } from "react-query";

import { SelfInfoApi } from "services/selfInfo/selfInfoApi";

interface UseFollowersListProps {
  pagination?: Pagination;
}

interface UseFollowersListResult {
  isLoading: boolean;
  data: Array<Follower>;
  totalPages: number;
}

export function useFollowersList({ pagination }: UseFollowersListProps): UseFollowersListResult {
  const { data, isLoading, isIdle } = useQuery(["followers", { pagination }], () =>
    SelfInfoApi.getFollowersList({ body: { ...pagination } }),
  );

  return {
    isLoading: isIdle || isLoading,
    data: data?.response?.records || [],
    totalPages: data?.response?.paginatedResponse?.totalPages || 0,
  };
}
