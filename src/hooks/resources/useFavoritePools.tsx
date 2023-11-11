import { useMutation, useQuery, useQueryClient } from "react-query";
import { CancelToken } from "apisauce";

import api from "services/api/api";
import { SelfInfoApi } from "services/selfInfo/selfInfoApi";

interface UseFavoritePoolsProps {
  pagination?: Pagination;
  filter?: Partial<{ [key in FilterName]: Array<string> }>;
}

interface UseFavoritePoolsResult {
  poolsLoading: boolean;
  pools: Array<WineRaw>;
  totalPages: number;
  filters: Record<FilterName, BaseFilter>;
  addToFavorite: (params: { poolId: number }) => Promise<void>;
  removeFromFavorite: (params: { poolId: number }) => Promise<void>;
}

const source = CancelToken.source();

export function useFavoritePools({
  pagination,
  filter,
}: UseFavoritePoolsProps): UseFavoritePoolsResult {
  const queryClient = useQueryClient();

  const { data, isLoading, isIdle } = useQuery(["favorite-pools", { pagination, filter }], () =>
    SelfInfoApi.getFavorites({ body: { ...pagination, filters: filter } }),
  );

  const filters = (data?.response?.filterResponse?.filters || []).reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
  }, {} as Record<FilterName, BaseFilter>);

  function invalidateDependentQuery() {
    queryClient.invalidateQueries(["favorite-pools", { pagination, filter }]);
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
    poolsLoading: isIdle || isLoading,
    pools: data?.response?.records || [],
    totalPages: data?.response?.filterResponse?.totalPages || 0,
    filters,
    addToFavorite,
    removeFromFavorite,
  };
}
