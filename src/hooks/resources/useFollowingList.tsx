import { useQuery } from "react-query";

import { SelfInfoApi } from "services/selfInfo/selfInfoApi";

interface UseFollowingListProps {
  pagination?: Pagination;
}

interface UseFollowingListResult {
  isLoading: boolean;
  data: Array<Follower>;
  totalPages: number;
}

export function useFollowingList({ pagination }: UseFollowingListProps): UseFollowingListResult {
  const { data, isLoading, isIdle } = useQuery(["following", { pagination }], () =>
    SelfInfoApi.getFollowingList({ body: { ...pagination } }),
  );

  return {
    isLoading: isIdle || isLoading,
    data: data?.response?.records || [],
    totalPages: data?.response?.paginatedResponse?.totalPages || 0,
  };
}
