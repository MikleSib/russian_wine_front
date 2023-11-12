import React, { FC, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import clsx from "clsx";
import { useLocation } from "react-router-dom";

import { MultiFilters, PageMeta, SkeletonLoading, WineCard } from "components";
import { Pagination } from "components/common";
import { useMediaQuery, usePagination } from "hooks";
import { useMarketSale } from "hooks/resources/useMarketSale";
import { useRootStore } from "context/RootStoreProvider";
import { COLOR_OPTIONS, INITIAL_CARDS_PER_PAGE, INITIAL_PAGE } from "constants/index";
import { UserSalesTopFilters } from "./UserSalesTopFilters";
import "./UserSales.styles.scss";
import currencyStore from "stores/CurrencyStore";

const UserSales: FC = observer(() => {
  const { state } = useLocation();

  const [colorFilter, setColorFilter] = useState<COLOR_OPTIONS>(
    (state as any)?.color || COLOR_OPTIONS.ALL,
  );
  const [multiFilters, setMultiFilters] = useState({});
  const [page, setPage] = useState(INITIAL_PAGE);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const rootStore = useRootStore();

  const defaultFilterForPage = useMemo(() => {
    if (colorFilter !== "all") {
      return {
        WineColor: [colorFilter],
      };
    } else {
      return {};
    }
  }, [colorFilter]);

  const {
    marketPools,
    marketPoolsLoading,
    totalPages,
    filters,
    addToFavorite,
    removeFromFavorite,
  } = useMarketSale({
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

  const renderCards = (): JSX.Element[] => {
    return marketPools.map((item, idx) => (
      <WineCard
        key={idx}
        {...item.winePool}
        flag={rootStore.getCountryFlag(item.winePool.wineParams.WineProductionCountry)}
        userName={item.bottleOwner.nickname || ""}
        userImg={item.bottleOwner.image || ""}
        orderId={item.orderId}
        price={+item.price}
        onFavoriteClick={
          window.LOGGED
            ? item.winePool.isFavorite
              ? removeFromFavorite
              : addToFavorite
            : undefined
        }
        marketPool={true}
        currency={currencyStore.currency}
      />
    ));
  };

  return (
    <>
      <PageMeta />
      <div className="userSales">
        <aside
          className={clsx("userSales__aside", {
            "userSales__aside--open": rootStore.showFilters,
          })}
        >
          <MultiFilters
            filters={filters}
            onApplyFilter={setMultiFilters}
            isMarketSale
            {...(isTablet && { onClose: () => rootStore.toggleShowFilters(false) })}
          />
        </aside>
        <div className="userSales__content">
          <div className="userSales__header">
            <h1 className="userSales__title">Вторичный рынок</h1>
            {!!((filters.WineColor?.values as FilterSelectValueType[]) ?? []).length && (
              <UserSalesTopFilters color={colorFilter} onSetColor={setColorFilter} />
            )}
          </div>
          <div className="userSales__cards-wrapper">
            {marketPoolsLoading ? (
              <SkeletonLoading count={4} width={265} height={455} />
            ) : (
              renderCards()
            )}
          </div>
          {!!marketPools.length && totalPages > 1 && <Pagination items={items} className="mb-0" />}
        </div>
      </div>
    </>
  );
});

export default UserSales;
