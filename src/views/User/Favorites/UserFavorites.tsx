import React, { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";

import { BaseSearch, Pagination } from "components/common";
import { MultiFilters, PageMeta, SkeletonLoading, WineCard } from "components";
import { usePagination, useMediaQuery } from "hooks";
import { useUserFavoritePools } from "hooks/resources/useUserFavoritePools";
import { INITIAL_CARDS_PER_PAGE, INITIAL_PAGE, TYPE_OPTIONS } from "constants/index";
import { useRootStore } from "context/RootStoreProvider";
import { SellerTypeFilters } from "views/Seller/SellerTypeFilters";
import SellerHeader, { SellerFixedHeader } from "views/Seller/SellerHeader";
import "views/Seller/Marketplace/Marketplace.styles.scss";
import currencyStore from "stores/CurrencyStore";

function UserFavorites() {
  const { nickname = "" } = useParams<{ nickname: string }>();
  const [typeFilter, setTypeFilter] = useState<TYPE_OPTIONS>(TYPE_OPTIONS.ALL);
  const [multiFilters, setMultiFilters] = useState({});
  const [page, setPage] = useState(INITIAL_PAGE);

  const rootStore = useRootStore();
  const {
    authStore: { userInfo, fullNameUser },
  } = rootStore;

  const isMobile = useMediaQuery("(max-width: 767px)");
  const defaultFilterForPage = useMemo(() => {
    if (typeFilter === "new") {
      return { IsNew: ["1"] };
    } else {
      return {};
    }
  }, [typeFilter]);

  const { pools, poolsLoading, filters, totalPages, addToFavorite, removeFromFavorite } =
    useUserFavoritePools({
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

  const onSubscribeAction = useCallback(async () => {
    await rootStore.authStore.toggleSubscribing(userInfo.nickname);
  }, [rootStore.authStore.toggleSubscribing]);

  const renderCards = (): JSX.Element[] => {
    return pools.map((item, idx) => (
      <WineCard
        key={idx}
        {...item}
        flag={rootStore.getCountryFlag(item.wineParams.WineProductionCountry)}
        onFavoriteClick={
          window.LOGGED ? (item.isFavorite ? removeFromFavorite : addToFavorite) : undefined
        }
        currency={currencyStore.currency}
      />
    ));
  };

  return (
    <>
      <PageMeta />
      <div className="seller-market">
        <aside
          className={clsx("purchase__aside", { "purchase__aside--open": rootStore.showFilters })}
        >
          <MultiFilters
            filters={filters}
            onApplyFilter={setMultiFilters}
            {...(isMobile && { onClose: () => rootStore.toggleShowFilters(false) })}
          />
        </aside>
        <SellerFixedHeader
          fullName={fullNameUser}
          image={userInfo.image}
          userNickname={userInfo.nickname}
        />
        <div className="seller-market__main">
          <SellerHeader
            userInfo={userInfo}
            hasSubscribe
            isSubscribed={userInfo.isSubscribed}
            onSubscribeAction={onSubscribeAction}
          />
          <div className="seller-market__content">
            <div className="seller-market__filters">
              <BaseSearch isRounded placeholder="Поиск товаров..." onChange={() => null} />
              <SellerTypeFilters type={typeFilter} onSetType={setTypeFilter} />
            </div>
            <div className="seller-market__cards-wrapper">
              {poolsLoading ? (
                <SkeletonLoading count={4} width={265} height={455} />
              ) : (
                renderCards()
              )}
            </div>
            {!!pools.length && totalPages > 1 && <Pagination items={items} className="mb-0" />}
          </div>
        </div>
      </div>
    </>
  );
}

export default observer(UserFavorites);
