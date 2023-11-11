import { useQuery } from "react-query";

import { UserInfoApi } from "services/userInfo/userInfoApi";

interface UseUserFollowersListProps {
  nickname: string;
  pagination?: Pagination;
}

interface UseUserFollowersListResult {
  isLoading: boolean;
  data: Array<Follower>;
  totalPages: number;
}

export function useUserFollowersList({
  pagination,
  nickname,
}: UseUserFollowersListProps): UseUserFollowersListResult {
  const { data, isLoading, isIdle } = useQuery(["user-followers", { pagination, nickname }], () =>
    UserInfoApi.getFollowersList({ body: { ...pagination, nickname } }),
  );

  return {
    isLoading: isIdle || isLoading,
    data: data?.response?.records || [],
    totalPages: data?.response?.paginatedResponse?.totalPages || 0,
  };
}
