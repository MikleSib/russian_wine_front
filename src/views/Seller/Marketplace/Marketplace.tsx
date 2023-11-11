import React, { FC, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { observer } from "mobx-react-lite";

import { BaseSearch, Pagination } from "components/common";
import { MultiFilters, PageMeta, SkeletonLoading, WineCard } from "components";
import { usePagination, useMediaQuery } from "hooks";
import { useSelfMarketSale } from "hooks/resources/useSelfMarketSale";
import { INITIAL_CARDS_PER_PAGE, INITIAL_PAGE, TYPE_OPTIONS } from "constants/index";
import { useRootStore } from "context/RootStoreProvider";
import { SellerTypeFilters } from "../SellerTypeFilters";
import SellerHeader, { SellerFixedHeader } from "../SellerHeader";
import "./Marketplace.styles.scss";
import { usePurchase } from "hooks/resources/usePurchase";
import { DeliveryServiceApi } from "services/deliveryService/deliveryServiceApi";
import currencyStore from "stores/CurrencyStore";

const Marketplace: FC = observer(() => {
  const [typeFilter, setTypeFilter] = useState<TYPE_OPTIONS>(TYPE_OPTIONS.ALL);
  const [multiFilters, setMultiFilters] = useState({});
  const [page, setPage] = useState(INITIAL_PAGE);

  const rootStore = useRootStore();
  const { selfInformation, fullName } = rootStore.authStore;

  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(max-width: 1280)");
  const defaultFilterForPage = useMemo(() => {
    if (typeFilter === "new") {
      return { IsNew: ["1"] };
    } else {
      return {};
    }
  }, [typeFilter]);

  const [mintedPurchasePools, setMintedPurchasePools] = useState<
    (MarketWineRaw & {
      status: Purchase_Status;
    })[]
  >([]);
  const [notDeliveredPurchasePools, setNotDeliveredPurchasePools] = useState<
    (MarketWineRaw & {
      status: Purchase_Status;
    })[]
  >([]);

  const CARDS_PER_PAGE = 100;

  const { purchaseLoading, purchasePools, createMarketSaleOrder, cancelMarketSaleOrder } =
    usePurchase({
      pagination: { onPage: CARDS_PER_PAGE, pageNumber: page },
      filter: {
        ...defaultFilterForPage,
        ...multiFilters,
      },
    });

  const {
    marketPools,
    marketPoolsLoading,
    filters,
    totalPages,
    addToFavorite,
    removeFromFavorite,
  } = useSelfMarketSale({
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

  useEffect(() => {
    async function fetchData() {
      const poolIds = purchasePools.map((item) => item.winePool.poolId);
      const tokenIds = purchasePools.map((item) => item.tokenId);
      const deliveryInfo = await DeliveryServiceApi.getDeliveryInformation({
        body: { poolIds, tokenIds },
      });

      const results: any[] = purchasePools.map((item, i) => {
        const itemUniqueCode = `${item.winePool.poolId}-${item.tokenId}`;
        const itemResonse = deliveryInfo.response
          ? deliveryInfo.response.find((e) => `${e.pool_id}-${e.token_id}` === itemUniqueCode)
          : null;
        const response = itemResonse ? [itemResonse] : [];

        return {
          item,
          deliveryInfo: {
            ...deliveryInfo,
            response,
          },
        };
      });

      const filtered = results.filter(({ item, deliveryInfo }) => {
        if (deliveryInfo.response?.length) {
          const data = deliveryInfo.response[0] as DeliveryResponse;
          return (
            data.blockchain_status === null ||
            data.blockchain_status === undefined ||
            data.blockchain_status === "Canceled"
          );
        } else {
          return true;
        }
      });
      setMintedPurchasePools(filtered.map(({ item }) => item));

      const filteredNotDeliveredPurchasePools = results.filter(({ item, deliveryInfo }) => {
        if (deliveryInfo.response?.length) {
          const data = deliveryInfo.response[0] as DeliveryResponse;
          if (
            data.blockchain_status === "WaitingForPayment" ||
            data.blockchain_status === "DeliveryInProcess"
          ) {
            return item;
          }
          return null;
        } else {
          return null;
        }
      });
      setNotDeliveredPurchasePools(filteredNotDeliveredPurchasePools.map(({ item }) => item));
    }

    if (!purchaseLoading) {
      fetchData();
    }
  }, [purchasePools]);

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
            isMarketSale
            {...(isTablet && { onClose: () => rootStore.toggleShowFilters(false) })}
          />
        </aside>
        <SellerFixedHeader
          fullName={fullName}
          image={selfInformation.image}
          showExchange={notDeliveredPurchasePools.length > 0}
        />
        <div className="seller-market__main">
          <SellerHeader
            userInfo={selfInformation}
            showExchange={notDeliveredPurchasePools.length > 0}
          />
          <div className="seller-market__content">
            <div className="seller-market__filters">
              <BaseSearch isRounded placeholder="Search items..." onChange={() => null} />
              <SellerTypeFilters type={typeFilter} onSetType={setTypeFilter} />
            </div>
            <div className="seller-market__cards-wrapper">
              {marketPoolsLoading ? (
                <SkeletonLoading count={4} width={265} height={455} />
              ) : (
                renderCards()
              )}
            </div>
            {!!marketPools.length && totalPages > 1 && (
              <Pagination items={items} className="mb-0" />
            )}
          </div>
        </div>
      </div>
    </>
  );
});

export default Marketplace;
