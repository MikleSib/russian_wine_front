import React, { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";

import { BaseSearch, Pagination } from "components/common";
import { SkeletonLoading, WineCard } from "components";
import { useMediaQuery, usePagination } from "hooks";
import { useFavoritePools } from "hooks/resources/useFavoritePools";
import { INITIAL_CARDS_PER_PAGE, INITIAL_PAGE, TYPE_OPTIONS } from "constants/index";
import { useRootStore } from "context/RootStoreProvider";
import { SellerTypeFilters } from "views/Seller/SellerTypeFilters";
import "./Favorites.styles.scss";
import currencyStore from "stores/CurrencyStore";

function Favorites() {
  const [typeFilter, setTypeFilter] = useState<TYPE_OPTIONS>(TYPE_OPTIONS.ALL);
  const [page, setPage] = useState(INITIAL_PAGE);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const rootStore = useRootStore();

  const defaultFilterForPage = useMemo(() => {
    if (typeFilter === "new") {
      return { IsNew: ["1"] };
    } else {
      return {};
    }
  }, [typeFilter]);

  const { pools, poolsLoading, totalPages, addToFavorite, removeFromFavorite } = useFavoritePools({
    pagination: { onPage: INITIAL_CARDS_PER_PAGE, pageNumber: page },
    filter: {
      ...defaultFilterForPage,
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
    <div className="favorites">
      <div className="favorites__filters">
        <BaseSearch isRounded placeholder="Search items" onChange={() => null} />
        <SellerTypeFilters type={typeFilter} onSetType={setTypeFilter} />
      </div>
      <div className="favorites__cards-wrapper">
        {poolsLoading ? <SkeletonLoading count={4} width={265} height={455} /> : renderCards()}
      </div>
      {!!pools.length && totalPages > 1 && <Pagination items={items} className="mb-0" />}
    </div>
  );
}

export default observer(Favorites);
