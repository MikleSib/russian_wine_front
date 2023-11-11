import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";

import { FirstSaleApi } from "services/firstSale/firstSaleApi";
import api from "../../services/api/api";
import { CancelToken } from "apisauce";

export const initialWineRawData: WineRaw = {
  poolId: 0,
  contractAddress: "",
  tokensCount: 0,
  maxTotalSupply: 0,
  image: null,
  isFavorite: false,
  priceChangePercent: "0",
  uniqOwnersCount: 0,
  viewersCount: 0,
  favoritesCount: 0,
  possibleDeliveryDate: null,
  futuresImage: null,
  wineParams: {
    WineName: "wine_name",
    WineProductionCountry: "wine_country",
    WineProductionRegion: "wine_region",
    WineProducerName: "wine_producer",
    LinkToDocuments: "",
    FirstSalePrice: "0",
    WineBottleVolume: "0",
    WineProductionYear: "0",
    WineColor: "red",
    Description: "",
    RatingRP: "0",
    IsNew: "0",
  },
};

const source = CancelToken.source();

interface UseFirstSalePoolProps {
  poolId: string;
}

export interface UseFirstSalePoolResult {
  poolLoading: boolean;
  pool: WineRaw;
  addToFavorite: (params: { poolId: number }) => Promise<void>;
  removeFromFavorite: (params: { poolId: number }) => Promise<void>;
}

export function useFirstSalePool({ poolId }: UseFirstSalePoolProps): UseFirstSalePoolResult {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isIdle } = useQuery(
    ["pool", { poolId }],
    () =>
      FirstSaleApi.getFirstSaleById({
        poolId,
      }),
    { onError: () => navigate("/") },
  );

  function invalidateDependentQuery() {
    queryClient.invalidateQueries(["pool", { poolId }]);
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
    poolLoading: isIdle || isLoading,
    pool: data?.response || initialWineRawData,
    addToFavorite,
    removeFromFavorite,
  };
}
