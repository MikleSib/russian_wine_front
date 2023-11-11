import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import { CancelToken } from "apisauce";

import { MarketSaleApi } from "services/marketSale/marketSaleApi";
import { DEFAULT_GAS_LIMIT } from "constants/index";
import api from "services/api/api";
import { useWineMarketPlace } from "utils/web3React";
import { routes } from "utils/router";

export const initialMarketWineRawData: MarketWineRaw = {
  winePool: {
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
  },
  bottleOwner: {
    blockchainAddress: "",
    nickname: null,
    image: null,
  },
  orderId: 0,
  tokenId: 0,
  currency: "",
  price: "",
  fee: "",
  seller: "",
  buyer: "",
  isOpen: true,
  isMine: false,
  isInner: false,
  date_at: Date.now(),
};

const source = CancelToken.source();

interface UseMarketSalePoolProps {
  orderId: string;
}

export interface UseMarketSalePoolResult {
  poolLoading: boolean;
  pool: MarketWineRaw;
  cancelMarketSaleOrder: (params: { orderId: number }) => Promise<void>;
  executeMarketSaleOrder: (params: { orderId: number }) => Promise<void>;
  addToFavorite: (params: { poolId: number }) => Promise<void>;
  removeFromFavorite: (params: { poolId: number }) => Promise<void>;
}

export function useMarketSalePool({ orderId }: UseMarketSalePoolProps): UseMarketSalePoolResult {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { account } = useWeb3React();
  const wineMarketPlaceContract = useWineMarketPlace();

  const { data, isLoading, isIdle } = useQuery(
    ["market-pool", { orderId }],
    () => MarketSaleApi.getMarketSaleByOrderId({ orderId }),
    { onError: () => navigate("/") },
  );

  const { mutateAsync: cancelMarketSaleOrder } = useMutation(
    async ({ orderId }: { orderId: number }) => {
      await wineMarketPlaceContract.methods
        .cancelOrder(orderId)
        // .send({ from: account, gas: DEFAULT_GAS_LIMIT })
        .send({ from: account, gas: 170000 })
        .on("transactionHash", (transactionHash: string) => console.info(transactionHash));

      await api.post("/personal_area/callback/do_something_with_order", { orderId });
      navigate(routes.sellerPurchased.path, { state: null });
    },
  );

  const { mutateAsync: executeMarketSaleOrder } = useMutation(
    async ({ orderId }: { orderId: number }) => {
      await wineMarketPlaceContract.methods
        .executeOrder(orderId)
        // .send({ from: account, gas: DEFAULT_GAS_LIMIT })
        .send({ from: account, gas: 500000 })
        .on("transactionHash", (transactionHash: string) => console.info(transactionHash));

      await api.post("/personal_area/callback/do_something_with_order", { orderId });
      navigate(routes.sellerPurchased.path, { state: null });
    },
  );

  function invalidateDependentQuery() {
    queryClient.invalidateQueries(["market-pool", { orderId }]);
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
    pool: data?.response || initialMarketWineRawData,
    cancelMarketSaleOrder,
    executeMarketSaleOrder,
    addToFavorite,
    removeFromFavorite,
  };
}
