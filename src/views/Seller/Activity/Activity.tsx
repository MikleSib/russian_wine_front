import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { observer } from "mobx-react-lite";

import { MultiFilters, PageMeta, SkeletonLoading } from "components";
import { BaseSearch, Pagination } from "components/common";
import { INITIAL_CARDS_PER_PAGE, INITIAL_PAGE, TYPE_OPTIONS } from "constants/index";
import { useMediaQuery, usePagination } from "hooks";
import { useActivity } from "hooks/resources/useActivity";
import { useRootStore } from "context/RootStoreProvider";
import { capitalize } from "utils";
import noImageSrc from "assets/images/no-image.png";
import SellerHeader, { SellerFixedHeader } from "../SellerHeader";
import { SellerTypeFilters } from "../SellerTypeFilters";
import "./Activity.styles.scss";
import { DeliveryServiceApi } from "services/deliveryService/deliveryServiceApi";
import { usePurchase } from "hooks/resources/usePurchase";

function Activity() {
  const [typeFilter, setTypeFilter] = useState<TYPE_OPTIONS>(TYPE_OPTIONS.ALL);
  const [multiFilters, setMultiFilters] = useState({});
  const [page, setPage] = useState(INITIAL_PAGE);
  const [rowCollapse, setRowCollapse] = useState<Hash<boolean>>({});

  const isMobile = useMediaQuery("(max-width: 767px)");
  const rootStore = useRootStore();
  const { selfInformation, fullName } = rootStore.authStore;

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

  const defaultFilterForPage = useMemo(() => {
    if (typeFilter === "new") {
      return { IsNew: ["1"] };
    } else {
      return {};
    }
  }, [typeFilter]);

  const CARDS_PER_PAGE = 100;

  const { purchaseLoading, purchasePools, createMarketSaleOrder, cancelMarketSaleOrder } =
    usePurchase({
      pagination: { onPage: CARDS_PER_PAGE, pageNumber: page },
      filter: {
        ...defaultFilterForPage,
        ...multiFilters,
      },
    });

  const { isLoading, activities, totalPages, filters } = useActivity({
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

  const handleRowCollapse = (key: string): void => {
    setRowCollapse((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
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
      <div className="activity">
        <aside
          className={clsx("activity__aside", { "activity__aside--open": rootStore.showFilters })}
        >
          <MultiFilters
            filters={filters}
            onApplyFilter={setMultiFilters}
            isMarketSale
            {...(isMobile && { onClose: () => rootStore.toggleShowFilters(false) })}
          />
        </aside>
        <SellerFixedHeader
          fullName={fullName}
          image={selfInformation.image}
          showExchange={notDeliveredPurchasePools.length > 0}
        />
        <div className="activity__main">
          <SellerHeader
            userInfo={selfInformation}
            showExchange={notDeliveredPurchasePools.length > 0}
          />
          <div className="activity__content">
            <div className="activity__filters">
              <BaseSearch isRounded placeholder="Поиск товаров..." onChange={() => null} />
              <SellerTypeFilters type={typeFilter} onSetType={setTypeFilter} />
            </div>
            <div className="activity__rows-wrapper">
              {isLoading ? (
                <SkeletonLoading count={5} width="100%" height={105} />
              ) : (
                activities.map(renderRow)
              )}
            </div>
            {!!activities.length && totalPages > 1 && <Pagination items={items} className="mb-0" />}
          </div>
        </div>
      </div>
    </>
  );

  function renderRow(item: ActivityRaw, key: number) {
    return (
      <div
        className={clsx("activity__row", { "activity__row--collapse": rowCollapse[`row_${key}`] })}
        key={`row_${key}`}
      >
        <div className="activity__cell">
          <img src={item.concreteBottle.winePool.image ?? noImageSrc} alt="wine" />
          <div className="activity__cell--name-wrap activity__cell--bold">
            <div className="activity__cell--name">
              {item.concreteBottle.winePool.wineParams.WineName}
            </div>
            <div className="activity__cell--info">
              <span>{item.concreteBottle.winePool.wineParams.WineProductionYear}</span>
              <span>{item.concreteBottle.winePool.wineParams.WineBottleVolume}</span>
              <span>{item.concreteBottle.winePool.wineParams.WineProductionCountry}</span>
            </div>
          </div>
          <div className="activity__cell-arrow" onClick={() => handleRowCollapse(`row_${key}`)} />
        </div>
        <div className="activity__cell--mobile">
          <div className="activity__cell activity__cell--minted">
            <div>{capitalize(item.activityType)}</div>
          </div>
          <div className="activity__cell activity__cell--bold">$ {+item.concreteBottle.price}</div>
          <div className="activity__cell">x1</div>
          <div className="activity__cell activity__cell--gray">
            {new Date(item.createdAt * 1000).toLocaleDateString()}
          </div>
        </div>
        <div className="activity__cell--mobile">
          <div className="activity__cell activity__cell--gray">
            От: <span>{item.addressFrom?.nickname ?? ""}</span>
          </div>
          <div className="activity__cell activity__cell--gray">
            Куда: <span>{item.addressTo?.nickname ?? ""}</span>
          </div>
        </div>
        <div className="activity__cell activity__cell--minted d-none d-md-flex">
          <div>{capitalize(item.activityType)}</div>
        </div>
        <div className="activity__cell activity__cell--bold d-none d-md-flex">
          ₽ {+item.concreteBottle.price}
        </div>
        <div className="activity__cell d-none d-md-flex">x1</div>
        <div className="activity__cell activity__cell--gray d-none d-md-flex">
          От: <span>{item.addressFrom?.nickname ?? ""}</span>
        </div>
        <div className="activity__cell activity__cell--gray d-none d-md-flex">
          Куда: <span>{item.addressTo?.nickname ?? ""}</span>
        </div>
        <div className="activity__cell activity__cell--gray d-none d-md-flex">
          {new Date(item.createdAt * 1000).toLocaleDateString()}
        </div>
      </div>
    );
  }
}

export default observer(Activity);
