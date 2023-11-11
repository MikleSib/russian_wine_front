import React, { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";

import { FeedbackModal } from "components";
import { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import api from "services/api/api";
import { parseReceiptEvents, useWineFirstSaleMarket } from "utils/web3React";
import { useModal } from "./index";
import { notificationsStore } from "views";
import { useQueryClient } from "react-query";
import { BasketItem } from "./useBasket";

const useBuyToken = (poolIds: number[]): { loading: boolean; handleBuyToken: () => void } => {
  const { account } = useWeb3React();
  const queryClient = useQueryClient();
  const [requestedApproval, setRequestedApproval] = useState(false);
  const firstSaleMarketContract = useWineFirstSaleMarket();
  const [showSuccessModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.SUCCESS} />);
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);
  let TxHash = "";

  const handleRemoveItemsFromBasket = () => {
    const basketData: BasketItem[] | undefined = queryClient.getQueryData("basket");
    let updatedBasketData = basketData;
    poolIds.forEach((poolId: number) => {
      updatedBasketData = updatedBasketData?.filter(
        (item: BasketItem) => item.data.poolId !== poolId,
      );
    });

    localStorage.setItem("basketData", JSON.stringify(updatedBasketData));
    queryClient.setQueriesData("basket", updatedBasketData);
  };

  const handleBuyToken = () => {
    firstSaleMarketContract.methods
      .buyToken(poolIds, account)
      .send({ from: account })
      .on("sending", () => {
        setRequestedApproval(true);
      })
      .on("transactionHash", (transactionHash: string) => (TxHash = transactionHash))
      .on("receipt", async (receipt: any) => {
        const parsed = parseReceiptEvents(receipt, "Transfer");
        const tokenId = new BigNumber(parsed?.tokenId?._hex ?? "0").toNumber();

        await api.post("/personal_area/callback/first_sale", {
          address: account,
          poolIds,
          tokenIds: [tokenId],
        });

        notificationsStore.addNotification({
          id: Date.now(),
          TxTime: Date.now(),
          type: "success",
          message: "NFT was successfully minted",
          TxLink: TxHash,
        });

        handleRemoveItemsFromBasket();
        setRequestedApproval(false);
        showSuccessModal();
      })
      .on("error", (error: any) => {
        console.error(error);
        setRequestedApproval(false);
        showErrorModal();
      });
  };

  return { handleBuyToken, loading: requestedApproval };
};

export default useBuyToken;
