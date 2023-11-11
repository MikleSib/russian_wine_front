import { useMutation, useQuery, useQueryClient } from "react-query";
import { CancelToken } from "apisauce";

import api from "services/api/api";
import { UserInfoApi } from "services/userInfo/userInfoApi";

interface UseSelMarketSaleProps {
  nickname: string;
  pagination?: Pagination;
  filter?: Partial<{ [key in FilterName]: Array<string> }>;
}

interface UseMarketSaleResult {
  marketPoolsLoading: boolean;
  marketPools: Array<MarketWineRaw>;
  totalPages: number;
  filters: Record<FilterName, BaseFilter>;
  addToFavorite: (params: { poolId: number }) => Promise<void>;
  removeFromFavorite: (params: { poolId: number }) => Promise<void>;
}

const source = CancelToken.source();

export function useUserMarketSale({
  nickname,
  pagination,
  filter,
}: UseSelMarketSaleProps): UseMarketSaleResult {
  const queryClient = useQueryClient();

  const { data, isLoading, isIdle } = useQuery(
    ["user-market-pools", { pagination, filter, nickname }],
    () => UserInfoApi.getMarketSale({ body: { ...pagination, filters: filter, nickname } }),
  );

  const filters = (data?.response?.filterResponse?.filters || []).reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
  }, {} as Record<FilterName, BaseFilter>);

  function invalidateDependentQuery() {
    queryClient.invalidateQueries(["user-market-pools", { pagination, filter, nickname }]);
  }

  const { mutateAsync: addToFavorite } = useMutation(
    async ({ poolId }: { poolId: number }) => {
      await api.post(
        `personal_area/favorite_wine_pool/add/${poolId}`,
        {},
        { cancelToken: source.token },
      );
    },
    {
      onSuccess: invalidateDependentQuery,
    },
  );

  const { mutateAsync: removeFromFavorite } = useMutation(
    async ({ poolId }: { poolId: number }) => {
      await api.post(
        `personal_area/favorite_wine_pool/remove/${poolId}`,
        {},
        { cancelToken: source.token },
      );
    },
    {
      onSuccess: invalidateDependentQuery,
    },
  );

  return {
    marketPoolsLoading: isIdle || isLoading,
    marketPools: data?.response?.records || [],
    totalPages: data?.response?.filterResponse?.totalPages || 0,
    filters,
    addToFavorite,
    removeFromFavorite,
  };
}
