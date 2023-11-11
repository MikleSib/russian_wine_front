import React, { useCallback, useEffect, useMemo, useState } from "react";

import { BaseButton } from "components/common";
import { useCheckApproveForDeliveryTask, useModal } from "hooks";
import PayNowModal from "./PayNowModal";
import { useRootStore } from "context/RootStoreProvider";
import { CHAIN_ID } from "utils/web3React";
import { tokens } from "constants/index";
import { useWeb3React } from "@web3-react/core";
import { FeedbackModal, WalletProviderModal } from "components";
import { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import { StripePaymentApi } from "services/goPayPayment/goPayPaymentApi";
import { processForm } from "utils";
import { notificationsStore } from "views";

interface DeliveryModalButtonsProps {
  status: null | string;
  loading: boolean;
  submitFormLoading: boolean;
  sendDeliveryTask: () => Promise<void>;
  cancelDeliveryTask: () => Promise<void>;
  payDeliveryPrice: () => Promise<void>;
  poolId: number;
  tokenId: number;
  currency: string;
  purchasedWithCreditCard?: boolean;
  deliveryTotalPrice?: number;
  account?: string | null;
  showDeliveryPrice?: boolean;
  blockNftConfirmed: boolean;
  formChanged: boolean;
}

export function DeliveryModalButtons({
  status,
  loading,
  submitFormLoading,
  sendDeliveryTask,
  cancelDeliveryTask,
  payDeliveryPrice,
  poolId,
  tokenId,
  currency,
  purchasedWithCreditCard: isPurchasedWithCreditCard,
  deliveryTotalPrice,
  account,
  showDeliveryPrice,
  blockNftConfirmed,
  formChanged,
}: DeliveryModalButtonsProps) {
  const rootStore = useRootStore();
  const { chainId } = useWeb3React();
  const USDT = tokens.usdt.address[chainId ?? CHAIN_ID];
  const [showSuccessModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.SUCCESS} />);
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);
  const [showWalletProviderModal] = useModal(<WalletProviderModal />);
  const { checkApproveForDeliveryTask } = useCheckApproveForDeliveryTask(USDT);
  const [isLoadingPayment, setLoadingPayment] = useState(false);
  const [showPayNowModal] = useModal(
    <PayNowModal
      token={USDT}
      onHandleShowSuccess={showSuccessModal}
      onHandleShowError={showErrorModal}
      onShowWalletModalAction={showWalletProviderModal}
      handlePayDelivery={payDeliveryPrice} // with crypto
      poolId={poolId}
      tokenId={tokenId}
      currency={currency}
      deliveryTotalPrice={deliveryTotalPrice}
      isKycApproved={rootStore.authStore.selfInformation?.isKycApproved}
    />,
  );
  const [payButtonText, setPayButtonText] = useState<string>("Pay");

  const handleGetPayButtonText = async () => {
    if (!isPurchasedWithCreditCard) {
      if (account) {
        const isApproved = await checkApproveForDeliveryTask();
        if (isApproved) {
          setPayButtonText("Pay");
        } else {
          setPayButtonText("USDT Contract is not approved");
        }
      } else {
        setPayButtonText("Connect wallet");
      }
    } else {
      setPayButtonText("Pay");
    }
  };

  useEffect(() => {
    handleGetPayButtonText();
  }, [account]);

  const handlePayDeliveryWithCard = async () => {
    try {
      setLoadingPayment(true);
      const { response } = await StripePaymentApi.payDelivery(
        [poolId],
        [tokenId],
        currency === "USD" ? "EUR" : currency,
      );
      setLoadingPayment(false);
      if (response?.payDeliveryUrl) {
        processForm(response);
        notificationsStore.addNotification({
          id: Date.now(),
          TxTime: Date.now(),
          type: "success",
          message: "Your NFT exchange order has been successfully created",
        });
      }
    } catch (error) {
      setLoadingPayment(false);
      console.error(error);
      showErrorModal();
    }
  };

  if (status === null && showDeliveryPrice) {
    return (
      <div className="d-flex justify-content-center flex-wrap flex-md-nowrap">
        <BaseButton
          size="large"
          click={isPurchasedWithCreditCard ? handlePayDeliveryWithCard : showPayNowModal}
          disabled={
            submitFormLoading ||
            isLoadingPayment ||
            formChanged ||
            (!blockNftConfirmed && !isPurchasedWithCreditCard)
          }
          loading={loading}
        >
          {/* {account ? "Pay delivery" : "You need connect wallet"} */}
          {payButtonText}
        </BaseButton>
      </div>
    );
  } else {
    return null;
  }

  // switch (status) {
  //   case "New":
  //     return (
  //       <BaseButton
  //         size="large"
  //         theme="outlined-red"
  //         color="red"
  //         click={cancelDeliveryTask}
  //         disabled={!account}
  //         loading={loading}
  //       >
  //         {account ? "Cancel" : "You need connect wallet"}
  //       </BaseButton>
  //     );
  //   case "WaitingForPayment":
  //     return (
  //       <div className="d-flex justify-content-center flex-wrap flex-md-nowrap">
  //         {account && (
  //           <BaseButton
  //             size="large"
  //             loading={loading}
  //             click={payDeliveryPrice}
  //             className="mb-3 mb-md-0 mr-md-3"
  //           >
  //             Pay delivery price
  //           </BaseButton>
  //         )}
  //         <BaseButton
  //           size="large"
  //           theme="outlined-red"
  //           color="red"
  //           click={cancelDeliveryTask}
  //           loading={loading}
  //           disabled={!account}
  //         >
  //           {account ? "Cancel" : "You need connect wallet"}
  //         </BaseButton>
  //         );
  //       </div>
  //     );
  //   default:
  //     return (
  //       <BaseButton type="submit" size="large" loading={submitFormLoading} className="mx-auto">
  //         Calculate
  //       </BaseButton>
  //     );
  // }
}
