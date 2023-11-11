import { useQuery } from "react-query";

import { UserInfoApi } from "services/userInfo/userInfoApi";

interface UseUserFollowingListProps {
  nickname: string;
  pagination?: Pagination;
}

interface UseUserFollowingListResult {
  isLoading: boolean;
  data: Array<Follower>;
  totalPages: number;
}

export function useUserFollowingList({
  nickname,
  pagination,
}: UseUserFollowingListProps): UseUserFollowingListResult {
  const { data, isLoading, isIdle } = useQuery(["user-following", { pagination, nickname }], () =>
    UserInfoApi.getFollowingList({ body: { ...pagination, nickname } }),
  );

  return {
    isLoading: isIdle || isLoading,
    data: data?.response?.records || [],
    totalPages: data?.response?.paginatedResponse?.totalPages || 0,
  };
}
