import { FeedbackModal, WalletProviderModal, WineCard } from "components";
import { Pagination } from "components/common";
import { useRootStore } from "context/RootStoreProvider";
import { useMediaQuery, useModal, usePagination } from "hooks";
import { BasketItem, useBasket } from "hooks/useBasket";
import { useEffect, useState } from "react";
import BuyNowModal from "views/Product/BuyNowModal/BuyNowModal";
import { tokens } from "constants/index";
import { CHAIN_ID } from "utils/web3React";
import { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import { useWeb3React } from "@web3-react/core";

const INITIAL_PAGE = 1;
const PAGE_SIZE = 8;

interface Props {
  currency: string;
}

function Cards({ currency }: Props) {
  const rootStore = useRootStore();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { basket, removeItemFromBasket, changeBasketItemCount } = useBasket();
  const { chainId } = useWeb3React();
  const USDT = tokens.usdt.address[chainId ?? CHAIN_ID];
  const [selectedItem, setSelectedItem] = useState<number[]>([]);
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);
  const [showWalletProviderModal] = useModal(<WalletProviderModal />);
  const [bottlePrice, setBottlePrice] = useState<number>(0);
  const [showBuyNowModal] = useModal(
    <BuyNowModal
      poolId={""}
      count={1}
      bottlePrice={bottlePrice}
      poolIds={selectedItem}
      token={USDT}
      onHandleShowError={showErrorModal}
      onShowWalletModalAction={showWalletProviderModal}
      isKycApproved={rootStore.authStore.selfInformation?.isKycApproved}
      currency={currency}
    />,
  );
  const [page, setPage] = useState(INITIAL_PAGE);
  const { items } = usePagination({
    totalPages: basket.length / PAGE_SIZE,
    initialPageSize: PAGE_SIZE,
    initialPage: INITIAL_PAGE,
    siblingCount: isMobile ? 0 : 1,
    onSetPage: setPage,
  });

  const handleBuy = (poolId: number, count: number, totalPrice: number) => {
    setBottlePrice(totalPrice ?? 0);
    const poolIds = [];

    for (let i = 0; i < count; i++) {
      poolIds.push(poolId);
    }

    setSelectedItem(poolIds);
  };

  useEffect(() => {
    if (selectedItem.length > 0) {
      showBuyNowModal();
    }
  }, [selectedItem]);

  const handleChangeCount = (winePool: WineRaw, value: number) => {
    const maxCount = winePool.maxTotalSupply - winePool.tokensCount;

    if (value <= maxCount) {
      changeBasketItemCount(winePool.poolId, value);
    }
  };
  return (
    <div>
      <div className="basket_cards_wrapper">
        {basket
          .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
          .map((item: BasketItem, idx: number) => (
            <WineCard
              key={idx}
              {...item.data}
              flag={rootStore.getCountryFlag(item.data.wineParams.WineProductionCountry)}
              onBuy={(totalPrice) => handleBuy(item.data.poolId, item.count, totalPrice)}
              basket
              count={item.count}
              onRemove={() => removeItemFromBasket(item.data.poolId)}
              onChangeCount={(value: number) => handleChangeCount(item.data, value)}
              currency={currency}
            />
          ))}
      </div>
      {basket.length > PAGE_SIZE && <Pagination items={items} />}
    </div>
  );
}

export default Cards;
