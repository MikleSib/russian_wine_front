import { BaseButton } from "components/common";
import { useModal } from "hooks";
import { BasketItem, useBasket } from "hooks/useBasket";
import BuyNowModal from "views/Product/BuyNowModal/BuyNowModal";
import { tokens } from "constants/index";
import { CHAIN_ID } from "utils/web3React";
import FeedbackModal, { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import { useWeb3React } from "@web3-react/core";
import { WalletProviderModal } from "components";
import { useRootStore } from "context/RootStoreProvider";
import { useEffect, useState } from "react";
import currencyStore from "stores/CurrencyStore";

function Header() {
  const rootStore = useRootStore();
  const { basket, cleanBasket } = useBasket();
  const { chainId } = useWeb3React();
  const USDT = tokens.usdt.address[chainId ?? CHAIN_ID];
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);
  const [showWalletProviderModal] = useModal(<WalletProviderModal />);
  const [poolIds, setpoolIds] = useState<number[]>([]);
  const totalPrice: number =
    basket?.length > 0
      ? basket
          .map(
            (item: BasketItem) => Number(item.data.wineParams.FirstSalePrice ?? "0") * item.count,
          )
          .reduce((previousValue: number, currentValue: any) => currentValue + previousValue)
      : 0;

  const [showBuyNowModal] = useModal(
    <BuyNowModal
      poolId={""}
      count={1}
      bottlePrice={totalPrice}
      poolIds={poolIds}
      token={USDT}
      currency={currencyStore.currency}
      onHandleShowError={showErrorModal}
      onShowWalletModalAction={showWalletProviderModal}
      isKycApproved={rootStore.authStore.selfInformation?.isKycApproved}
    />,
  );

  useEffect(() => {
    const poolIdsData: number[] = [];

    basket.forEach((item: BasketItem) => {
      let i = 0;
      while (i < item.count) {
        poolIdsData.push(item.data.poolId);
        i++;
      }
    });
    setpoolIds(poolIdsData);
  }, [basket]);

  return (
    <div className="d-flex align-items-center justify-content-between basket_header">
      <div className="basket_header_title">Cart</div>
      {basket?.length > 0 && (
        <div className="d-flex aling-center">
          <BaseButton
            className="d-none d-md-flex basket_header_cancel_btn"
            size="small"
            color="gray"
            theme="outlined rounded"
            click={cleanBasket}
          >
            Cancel all
          </BaseButton>
          <BaseButton size="small" theme="contained rounded" click={showBuyNowModal}>
            Pay all
          </BaseButton>
        </div>
      )}
    </div>
  );
}

export default Header;
