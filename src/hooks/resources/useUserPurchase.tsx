import { useMutation, useQuery, useQueryClient } from "react-query";
import { useWeb3React } from "@web3-react/core";

import api from "services/api/api";
import { UserInfoApi } from "services/userInfo/userInfoApi";
import { parseReceiptEvents, useWineMarketPlace } from "utils/web3React";
import { sleep } from "utils";
import { DEFAULT_GAS_LIMIT } from "constants/index";
import BigNumber from "bignumber.js";

interface UseUserPurchaseProps {
  nickname: string;
  pagination?: Pagination;
  filter?: Partial<{ [key in FilterName]: Array<string> }>;
}

interface UseUserPurchaseResult {
  purchaseLoading: boolean;
  purchasePools: Array<MarketWineRaw & { status: Purchase_Status }>;
  totalPages: number;
  filters: Record<FilterName, BaseFilter>;
  createMarketSaleOrder: (params: {
    poolId: number;
    tokenId: number;
    currency: string;
    price: string;
  }) => Promise<void>;
  cancelMarketSaleOrder: (params: { orderId: number }) => Promise<void>;
}

export function useUserPurchase({
  pagination,
  filter,
  nickname,
}: UseUserPurchaseProps): UseUserPurchaseResult {
  const queryClient = useQueryClient();
  const { account } = useWeb3React();
  const wineMarketPlaceContract = useWineMarketPlace();

  const { data, isLoading, isIdle } = useQuery(
    ["user-purchase", { pagination, filter, nickname }],
    () => UserInfoApi.getPurchased({ body: { ...pagination, filters: filter, nickname } }),
  );

  const filters = (data?.response?.filterResponse?.filters || []).reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
  }, {} as Record<FilterName, BaseFilter>);

  function invalidateDependentQuery() {
    queryClient.invalidateQueries(["user-purchase", { pagination, filter, nickname }]);
  }

  const { mutateAsync: createMarketSaleOrder } = useMutation(
    async ({
      poolId,
      tokenId,
      currency,
      price,
    }: {
      poolId: number;
      tokenId: number;
      currency: string;
      price: string;
    }) => {
      await wineMarketPlaceContract.methods
        .createOrder(poolId, tokenId, currency, price)
        // .send({ from: account, gas: DEFAULT_GAS_LIMIT })
        .send({ from: account, gas: 350000 })
        .on("receipt", async (receipt: any) => {
          const parsed = parseReceiptEvents(receipt, "CreateOrder");
          const orderId = new BigNumber(parsed?.orderId?._hex ?? "0").toNumber();
          await api.post("/personal_area/callback/do_something_with_order", { orderId });

          await sleep(2000);
          invalidateDependentQuery();
        });
    },
  );

  const { mutateAsync: cancelMarketSaleOrder } = useMutation(
    async ({ orderId }: { orderId: number }) => {
      await wineMarketPlaceContract.methods
        .cancelOrder(orderId)
        // .send({ from: account, gas: DEFAULT_GAS_LIMIT })
        .send({ from: account, gas: 170000 })
        .on("transactionHash", (transactionHash: string) => console.info(transactionHash));

      await api.post("/personal_area/callback/do_something_with_order", { orderId });
      await sleep(3000);
      invalidateDependentQuery();
    },
  );

  return {
    purchaseLoading: isIdle || isLoading,
    purchasePools: data?.response?.records || [],
    totalPages: data?.response?.filterResponse?.totalPages || 0,
    filters,
    createMarketSaleOrder,
    cancelMarketSaleOrder,
  };
}
