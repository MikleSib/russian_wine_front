import React, { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { useWeb3React } from "@web3-react/core";

import { BaseButton, BaseLink, Modal } from "components/common";
import { PAYMENT_METHOD } from "constants/index";
import { useApprove, useCheckApprovalStatus, useCheckApproveForDeliveryTask } from "hooks";
import { StripePaymentApi } from "services/goPayPayment/goPayPaymentApi";
import { processForm } from "utils";
import { routes } from "utils/router";
import { ReactComponent as BankCreditIcon } from "assets/icons/bank-card.svg";
import { ReactComponent as LockIcon } from "assets/icons/lock.svg";
import { ReactComponent as CryptocurrencyIcon } from "assets/icons/cryptocurrency.svg";
import { ReactComponent as CheckIcon } from "assets/icons/check.svg";
import "./PayNowModal.styles.scss";
import { notificationsStore } from "views";

interface PayNowModalProps {
  onDismiss?: () => void;
  token: string;
  onHandleShowSuccess: () => void;
  onHandleShowError: () => void;
  onShowWalletModalAction: () => void;
  handlePayDelivery: () => void;
  updatePools?: () => void;
  setPayBtnBlocked?: React.Dispatch<React.SetStateAction<boolean>>;
  poolId: number;
  tokenId: number;
  currency: string;
  deliveryTotalPrice?: number;
  isKycApproved?: boolean;
}

function PayNowModal({
  onDismiss,
  token,
  onHandleShowSuccess,
  onHandleShowError,
  onShowWalletModalAction,
  handlePayDelivery,
  updatePools,
  setPayBtnBlocked,
  poolId,
  tokenId,
  currency,
  deliveryTotalPrice,
  isKycApproved,
}: PayNowModalProps) {
  const [isLoadingPayment, setLoadingPayment] = useState(false);
  const [payment, setPayment] = useState<PAYMENT_METHOD>(PAYMENT_METHOD.CRYPTOCURRENCY);

  const { account } = useWeb3React();
  const { checkApproveForDeliveryTask } = useCheckApproveForDeliveryTask(token);

  const buttonText = useMemo(async () => {
    if (payment === PAYMENT_METHOD.CRYPTOCURRENCY) {
      if (account) {
        const isApproved = await checkApproveForDeliveryTask();
        if (isApproved) {
          return "Оплатить";
        } else {
          return "USDT Contract is not approved";
        }
      } else {
        return "Подключить кошелек";
      }
    } else {
      return "Оплатить";
    }
  }, [payment, account]);

  const handleButtonClick = useCallback(async () => {
    if (payment === PAYMENT_METHOD.CRYPTOCURRENCY) {
      if (!account) {
        onShowWalletModalAction();
        return;
      }

      await handlePayDelivery();
    } else if (payment === PAYMENT_METHOD.BANK_CARD) {
      try {
        setLoadingPayment(true);
        const { response } = await StripePaymentApi.payDelivery(
          // deliveryTotalPrice,
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
        // if (updatePools) {
        //   updatePools();
        // }
        if (setPayBtnBlocked) {
          setPayBtnBlocked(true);
        }
        if (onDismiss) onDismiss();
      } catch (error) {
        setLoadingPayment(false);
        console.error(error);
        onHandleShowError();
      }
    }
  }, [
    handlePayDelivery,
    onHandleShowSuccess,
    payment,
    onHandleShowError,
    account,
    onShowWalletModalAction,
  ]);

  return (
    <Modal size="large" extraClassName="mx-3" onDismiss={onDismiss}>
      <div className="buyNowModal">
        <h4 className="buyNowModal__title">Select a Payment Method</h4>
        <div className="buyNowModal__cards">
          <div
            className={clsx(
              "buyNowModal__card",
              payment === PAYMENT_METHOD.BANK_CARD && "isActive",
              !isKycApproved && "isNotApproved",
            )}
            onClick={isKycApproved ? () => setPayment(PAYMENT_METHOD.BANK_CARD) : undefined}
          >
            <div className="buyNowModal__card-check">
              {!isKycApproved && <LockIcon />}
              {payment === PAYMENT_METHOD.BANK_CARD && isKycApproved && <CheckIcon />}
            </div>
            <BankCreditIcon className="buyNowModal__card-icon" />
            <p className="buyNowModal__card-label">Bank card</p>
            {!isKycApproved && (
              <p className="buyNowModal__card-kycWarning">
                To use this method you need to&nbsp;
                <BaseLink path={routes.profile.path} nativeClick={onDismiss}>
                  pass KYC
                </BaseLink>
              </p>
            )}
          </div>
          <div
            className={clsx(
              "buyNowModal__card",
              payment === PAYMENT_METHOD.CRYPTOCURRENCY && "isActive",
            )}
            onClick={() => setPayment(PAYMENT_METHOD.CRYPTOCURRENCY)}
          >
            <div className="buyNowModal__card-check">
              {payment === PAYMENT_METHOD.CRYPTOCURRENCY && <CheckIcon />}
            </div>
            <CryptocurrencyIcon className="buyNowModal__card-icon" />
            <p className="buyNowModal__card-label">Cryptocurrency</p>
          </div>
        </div>
        <BaseButton click={handleButtonClick} size="large" disabled={!payment || isLoadingPayment}>
          {buttonText}
        </BaseButton>
      </div>
    </Modal>
  );
}

export default PayNowModal;
