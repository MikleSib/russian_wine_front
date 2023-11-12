import React, { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { useWeb3React } from "@web3-react/core";

import { BaseButton, BaseLink, Modal } from "components/common";
import { PAYMENT_METHOD } from "constants/index";
import { useApprove, useBuyToken, useCheckApprovalStatus } from "hooks";
import { StripePaymentApi } from "services/goPayPayment/goPayPaymentApi";
import { processForm } from "utils";
import { routes } from "utils/router";
import { ReactComponent as BankCreditIcon } from "assets/icons/bank-card.svg";
import { ReactComponent as LockIcon } from "assets/icons/lock.svg";
import { ReactComponent as CryptocurrencyIcon } from "assets/icons/cryptocurrency.svg";
import { ReactComponent as CheckIcon } from "assets/icons/check.svg";
import "./BuyNowModal.styles.scss";
import { notificationsStore } from "views";
import ReactGA from "react-ga4";
import { useBasket } from "hooks/useBasket";

interface BuyNowModalProps {
  onDismiss?: () => void;
  poolId: string;
  poolIds?: number[];
  count: number;
  token: string;
  currency: string;
  onHandleShowError: () => void;
  onShowWalletModalAction: () => void;
  isKycApproved?: boolean;
  bottlePrice: number;
}

function BuyNowModal({
  onDismiss,
  poolId,
  poolIds,
  count,
  token,
  currency,
  onHandleShowError,
  onShowWalletModalAction,
  isKycApproved,
  bottlePrice,
}: BuyNowModalProps) {
  const [isLoadingPayment, setLoadingPayment] = useState(false);
  const [payment, setPayment] = useState<PAYMENT_METHOD>(PAYMENT_METHOD.CRYPTOCURRENCY);
  const { removeItemsFromBasket } = useBasket();

  const { account } = useWeb3React();
  const { handleBuyToken, loading } = useBuyToken(
    poolIds && poolIds?.length > 0 ? poolIds : poolIdArray(poolId, count),
  );
  const { isApproved, setLastUpdated } = useCheckApprovalStatus(token, bottlePrice * count);
  const { handleApprove, requestedApproval } = useApprove(token, setLastUpdated);

  function poolIdArray(poolId: string, count: number) {
    const arr = [];
    for (let index = 0; index < count; index++) {
      arr.push(Number(poolId));
    }
    console.log(arr);
    return arr;
  }

  function poolIdStringArray(poolId: string, count: number) {
    const arr = [];
    for (let index = 0; index < count; index++) {
      arr.push(poolId);
    }
    console.log(arr);
    return arr;
  }

  const buttonText = useMemo(() => {
    if (payment === PAYMENT_METHOD.CRYPTOCURRENCY) {
      if (account) {
        if (isApproved) {
          return "Купить сейчас";
        } else {
          return requestedApproval ? "Разрешение..." : "Разрешаю USDT Contract";
        }
      } else {
        return "Подключите кошелек";
      }
    } else {
      return "Купить сейчас";
    }
  }, [payment, account, isApproved, requestedApproval]);

  const handleButtonClick = useCallback(async () => {
    if (payment === PAYMENT_METHOD.CRYPTOCURRENCY) {
      if (!account) {
        onShowWalletModalAction();
        return;
      }

      if (!isApproved) {
        handleApprove();
      } else {
        handleBuyToken();

        // ReactGA.event("purchase");
        ReactGA.event({
          category: "purchase",
          action: "purchase",
          label: "purchase",
          value: Number(poolId),
        });
      }
    } else if (payment === PAYMENT_METHOD.BANK_CARD) {
      try {
        const poolIdsData: string[] =
          poolIds && poolIds?.length > 0
            ? poolIds.map((id: number) => id.toString())
            : poolIdStringArray(poolId, count);
        setLoadingPayment(true);
        const { response } = await StripePaymentApi.buyToken(
          poolIdsData,
          currency === "USD" ? "EUR" : currency ? currency : "EUR",
        );
        setLoadingPayment(false);

        if (response?.payDeliveryUrl) {
          processForm(response);
          poolIds && removeItemsFromBasket(poolIds);
          notificationsStore.addNotification({
            id: Date.now(),
            TxTime: Date.now(),
            type: "success",
            message: "NFT Было успешно заминчено!",
          });

          // ReactGA.event("purchase");
          ReactGA.event({
            category: "purchase",
            action: "purchase",
            label: "purchase",
            value: Number(poolId),
          });
        }
        if (onDismiss) onDismiss();
      } catch (error) {
        setLoadingPayment(false);
        console.error(error);
        onHandleShowError();
      }
    }
  }, [
    handleBuyToken,
    handleApprove,
    payment,
    isApproved,
    poolId,
    count,
    onHandleShowError,
    account,
    onShowWalletModalAction,
  ]);

  return (
    <Modal size="large" extraClassName="mx-3" onDismiss={onDismiss}>
      <div className="buyNowModal">
        <h4 className="buyNowModal__title">Выберите способ оплаты</h4>
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
        <BaseButton
          click={handleButtonClick}
          size="large"
          disabled={!payment || requestedApproval || loading || isLoadingPayment}
        >
          {buttonText}
        </BaseButton>
      </div>
    </Modal>
  );
}

export default BuyNowModal;
