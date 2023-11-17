import React, { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";

import { BaseButton, BaseSearch, Pagination } from "components/common";
import { MultiFilters, PageMeta, SkeletonLoading } from "components";
import { useMediaQuery, usePagination, useModal } from "hooks";
import { INITIAL_CARDS_PER_PAGE, INITIAL_PAGE, TYPE_OPTIONS } from "constants/index";
import { useRootStore } from "context/RootStoreProvider";
import { capitalize } from "utils";
import { useUserPurchase } from "hooks/resources/useUserPurchase";
import { SellerTypeFilters } from "views/Seller/SellerTypeFilters";
import PurchasedModal from "views/Seller/Purchase/PurchasedModal";
import SellerHeader, { SellerFixedHeader } from "views/Seller/SellerHeader";
import "views/Seller/Purchase/Purchase.styles.scss";

function UserPurchase() {
  const { nickname = "" } = useParams<{ nickname: string }>();
  const [typeFilter, setTypeFilter] = useState<TYPE_OPTIONS>(TYPE_OPTIONS.ALL);
  const [rowCollapse, setRowCollapse] = useState<Hash<boolean>>({});
  const [multiFilters, setMultiFilters] = useState({});
  const [page, setPage] = useState(INITIAL_PAGE);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const rootStore = useRootStore();
  const {
    authStore: { userInfo, fullNameUser },
  } = rootStore;

  const defaultFilterForPage = useMemo(() => {
    if (typeFilter === "new") {
      return { IsNew: ["1"] };
    } else {
      return {};
    }
  }, [typeFilter]);

  const { purchaseLoading, purchasePools, totalPages, filters } = useUserPurchase({
    nickname,
    pagination: { onPage: INITIAL_CARDS_PER_PAGE, pageNumber: page },
    filter: {
      ...defaultFilterForPage,
      ...multiFilters,
    },
  });

  const { items } = usePagination({
    totalPages,
    initialPageSize: INITIAL_CARDS_PER_PAGE,
    initialPage: INITIAL_PAGE,
    siblingCount: isMobile ? 0 : 1,
    onSetPage: setPage,
  });

  const [showPurchasedModal] = useModal(<PurchasedModal />);

  const handleClickViewPurchased = useCallback(
    (isUserSale: boolean, productId: number) => {
      showPurchasedModal({
        isUserSale,
        productId,
      });
    },
    [showPurchasedModal],
  );

  const handleRowCollapse = (key: string): void => {
    setRowCollapse((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const onSubscribeAction = useCallback(async () => {
    await rootStore.authStore.toggleSubscribing(userInfo.nickname);
  }, [rootStore.authStore.toggleSubscribing]);

  return (
    <>
      <PageMeta />
      <div className="purchase">
        <aside
          className={clsx("purchase__aside", { "purchase__aside--open": rootStore.showFilters })}
        >
          <MultiFilters
            filters={filters}
            onApplyFilter={setMultiFilters}
            isMarketSale
            {...(isMobile && { onClose: () => rootStore.toggleShowFilters(false) })}
          />
        </aside>
        <SellerFixedHeader
          fullName={fullNameUser}
          image={userInfo.image}
          userNickname={userInfo.nickname}
        />
        <div className="purchase__main">
          <SellerHeader
            userInfo={userInfo}
            hasSubscribe
            isSubscribed={userInfo.isSubscribed}
            onSubscribeAction={onSubscribeAction}
          />
          <div className="purchase__content">
            <div className="purchase__filters">
              <BaseSearch isRounded placeholder="Поиск товаров..." onChange={() => null} />
              <SellerTypeFilters type={typeFilter} onSetType={setTypeFilter} />
            </div>
            <div className="purchase__rows-wrapper">
              {purchaseLoading ? (
                <SkeletonLoading count={5} width="100%" height={105} />
              ) : (
                purchasePools.map(renderRow)
              )}
            </div>
            {!!purchasePools.length && totalPages > 1 && (
              <Pagination items={items} className="mb-0" />
            )}
          </div>
        </div>
      </div>
    </>
  );

  function renderRow(item: MarketWineRaw & { status: Purchase_Status }, key: number): JSX.Element {
    const renderViewButton = () => (
      <BaseButton
        color="red"
        theme="outlined-red"
        size="small"
        className="purchase__cell--button"
        click={() =>
          handleClickViewPurchased(item.orderId !== null, item.orderId ?? item.winePool.poolId)
        }
      >
        Посмотреть
      </BaseButton>
    );

    return (
      <div
        className={clsx("purchase__row purchase__row--user", {
          "purchase__row--collapse": rowCollapse[`row_${key}`],
        })}
        key={`row_${key}`}
      >
        <div className="purchase__cell">
          <div style={{ width: 30 }}>{item.winePool.poolId}</div>
          <img src={item.winePool.image ?? ""} alt="wine" />
          <div className="purchase__cell--name-wrap purchase__cell--bold">
            <div className="purchase__cell--name">{item.winePool.wineParams.WineName}</div>
            <div className="purchase__cell--info">
              <span>{item.winePool.wineParams.WineProductionYear}</span>
              <span>{item.winePool.wineParams.WineBottleVolume}</span>
              <span>{item.winePool.wineParams.WineProductionCountry}</span>
            </div>
          </div>
          <div className="purchase__cell-arrow" onClick={() => handleRowCollapse(`row_${key}`)} />
        </div>
        <div className="purchase__cell--mobile">
          <div className="purchase__cell purchase__cell--minted">
            <div>{item.status}</div>
          </div>
          <div className="purchase__cell purchase__cell--bold">$ {+item.price}</div>
          <div className="purchase__cell">{new Date(item.date_at * 1000).toLocaleDateString()}</div>
        </div>
        <div className="purchase__cell--mobile">{renderViewButton()}</div>
        <div className="purchase__cell purchase__cell--minted d-none d-md-flex">
          <div>{capitalize(item.status)}</div>
        </div>
        <div className="purchase__cell purchase__cell--bold d-none d-md-flex">$ {+item.price}</div>
        <div className="purchase__cell d-none d-md-flex justify-content-center">
          {renderViewButton()}
        </div>
        <div className="purchase__cell d-none d-md-flex">
          {new Date(item.date_at * 1000).toLocaleDateString()}
        </div>
      </div>
    );
  }
}

export default observer(UserPurchase);
