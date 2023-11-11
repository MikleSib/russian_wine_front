import { useMutation, useQuery, useQueryClient } from "react-query";
import { useWeb3React } from "@web3-react/core";

import { DEFAULT_GAS_LIMIT } from "constants/index";
import { DeliveryServiceApi } from "services/deliveryService/deliveryServiceApi";
import { sleep } from "utils";
import { useWineDeliveryServiceContract } from "utils/web3React";
import { useState } from "react";

interface UseDeliveryProps {
  poolIds: number[];
  tokenIds: number[];
}

interface UseDeliveryResult {
  isLoading: boolean;
  data: DeliveryResponse;
  errorInfo: boolean;
  setErrorInfo: React.Dispatch<React.SetStateAction<boolean>>;
  createNewDelivery: (deliveryData: DeliveryFormCreate) => Promise<void>;
  sendDeliveryTask: (deliveryData: {
    poolId: number;
    tokenId: number;
    blockchain_delivery_data: string;
  }) => Promise<void>;
}

export function useDelivery({ poolIds, tokenIds }: UseDeliveryProps): UseDeliveryResult {
  const queryClient = useQueryClient();
  const { account } = useWeb3React();
  const wineDeliveryServiceContract = useWineDeliveryServiceContract();
  const [errorInfo, setErrorInfo] = useState(false);

  const { data, isLoading, isIdle } = useQuery(
    ["delivery-info", { poolId: poolIds[0], tokenId: tokenIds[0] }],
    () =>
      DeliveryServiceApi.getDeliveryInformation({
        body: { poolIds, tokenIds },
      }),
  );

  function invalidateDependentQuery() {
    queryClient.invalidateQueries(["delivery-info", { poolId: poolIds[0], tokenId: tokenIds[0] }]);
  }

  const { mutateAsync: createNewDelivery } = useMutation(
    async (deliveryData: DeliveryFormCreate) => {
      try {
        await DeliveryServiceApi.createDelivery({
          body: { ...deliveryData, poolIds, tokenIds },
        });
        setErrorInfo(false);
      } catch (error) {
        console.log(`Error: invalid data of delivery ${error}`);
        setErrorInfo(true);
        console.log("error: ", errorInfo);
      }
    },
    {
      onSuccess: invalidateDependentQuery,
    },
  );

  const { mutateAsync: sendDeliveryTask } = useMutation(
    async ({
      poolId,
      tokenId,
      blockchain_delivery_data,
    }: {
      poolId: number;
      tokenId: number;
      blockchain_delivery_data: string;
    }) => {
      await wineDeliveryServiceContract.methods
        .requestDelivery(poolId, tokenId, blockchain_delivery_data)
        // .send({ from: account, gas: DEFAULT_GAS_LIMIT })
        .send({ from: account, gas: 1000000 })
        .on("receipt", async () => {
          await sleep(2000);
          invalidateDependentQuery();
        });
    },
  );

  return {
    isLoading: isIdle || isLoading,
    data:
      data?.response && !Array.isArray(data.response) ? data.response : ({} as DeliveryResponse),
    errorInfo,
    setErrorInfo,
    createNewDelivery,
    sendDeliveryTask,
  };
}
