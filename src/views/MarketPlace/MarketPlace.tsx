import React, { FC, useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import clsx from "clsx";

import { MultiFilters, PageMeta, SkeletonLoading, WineCard } from "components";
import { Pagination } from "components/common";
import { routes } from "utils/router";
import { useMediaQuery, usePagination } from "hooks";
import { useFirstSale } from "hooks/resources/useFirstSale";
import { useRootStore } from "context/RootStoreProvider";
import {
  AGE_VERIFIED_KEY,
  COLOR_OPTIONS,
  INITIAL_CARDS_PER_PAGE,
  INITIAL_PAGE,
  TYPE_OPTIONS,
} from "constants/index";
import { MarketPlaceTopFilters } from "./MarketPlaceTopFilters";
import "./MarketPlace.styles.scss";
import { Steps } from "intro.js-react";
import ReactGA from "react-ga4";
import currencyStore from "stores/CurrencyStore";

const MarketPlace: FC = observer(() => {
  const { pathname, state } = useLocation();

  const [colorFilter, setColorFilter] = useState<COLOR_OPTIONS>(
    (state as any)?.color || COLOR_OPTIONS.ALL,
  );
  const [typeFilter, setTypeFilter] = useState<TYPE_OPTIONS>(TYPE_OPTIONS.ALL);
  const [multiFilters, setMultiFilters] = useState({});
  const [page, setPage] = useState(INITIAL_PAGE);
  const [filteredPools, setFilteredPools] = useState<WineRaw[]>([]);
  const [searchParams] = useSearchParams({});

  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const rootStore = useRootStore();

  const defaultFilterForPage = useMemo(() => {
    if (pathname === routes.newItems.path || typeFilter === "new") {
      return { IsNew: ["1"] };
    } else if (pathname === routes.topInvested.path && colorFilter !== "all") {
      return {
        WineColor: [colorFilter],
      };
    } else {
      return {};
    }
  }, [pathname, typeFilter, colorFilter]);

  const { pools, poolsLoading, totalPages, filters, addToFavorite, removeFromFavorite } =
    useFirstSale({
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

  useEffect(() => {
    if (searchParams.has("WineName")) {
      // console.log(pools);
      const filtered = pools.filter((pool) =>
        pool.wineParams.WineName.toLowerCase().includes(
          searchParams.getAll("WineName")[0].toLowerCase(),
        ),
      );
      setFilteredPools(filtered);
    } else {
      setFilteredPools(pools);
    }

    ReactGA.event("view_item_list");
  }, [searchParams, pools]);

  const getPageTitle = (): string => {
    switch (pathname) {
      case routes.topInvested.path:
        return "Top Invested";
      case routes.newItems.path:
        return "New Items";
      default:
        return "All wine";
    }
  };

  function getEnableHint() {
    if (!localStorage.getItem(AGE_VERIFIED_KEY)) {
      return false;
    }
    const value: boolean = (localStorage.getItem("enableMarketPlaceHints") ?? "true") === "true";
    console.log("enableHint", value);
    if (isTablet && value) {
      rootStore.toggleShowFilters(true);
    }
    return value;
  }

  const steps = [
    {
      element: ".marketplace__aside",
      intro: (
        <>
          <h4>Фильтр</h4>
          <ul>
            <li>
              Простые в использовании фильтры, которыми вы можете управлять в соответствии с вашими инвестиционными предпочтениями
            </li>
            <li>Наблюдайте, сравнивайте и выбирайте то, что вам нравится!</li>
          </ul>
        </>
      ),
      tooltipClass: "custom-tooltip",
      position: "right",
    },
    {
      element: "#for-region-and-year-filter-hint",
      intro: (
        <>
          <h4>Обрати внимание на то, что</h4>
          <ul>
            <li>
              Наблюдать только вина, соответствующие вашему запросу, выбирая производителей и марок вы
              интересуют
            </li>
          </ul>
        </>
      ),
      tooltipClass: "custom-tooltip",
      position: "right",
    },
    {
      element: "#for-rating-rp-filter-hint",
      intro: (
        <>
          <h4>Robert Parker рейтинг</h4>
          <ul>
            <li>Рейтинг RP является самым примечательным для вин</li>
            <li>
              Роберт Паркер - всемирно известный винный критик, эксперт по винам
            </li>
            <li>Знаменитое возрождение винного фьючерса было вызвано его оценками вин</li>
            <li>
              Он также ввел знаменитую тенденцию оценивать вина по 100-балльной шкале, которая сейчас
              используется многими другими критиками и ресурсами
            </li>
          </ul>
        </>
      ),
      tooltipClass: "custom-tooltip",
      position: "right",
    },
  ];

  return (
    <>
      <PageMeta />
      <div className="marketplace">
        <Steps
          enabled={getEnableHint()}
          steps={steps}
          initialStep={0}
          onExit={() => {
            localStorage.setItem("enableMarketPlaceHints", "false");
            if (isTablet) {
              rootStore.toggleShowFilters(false);
            }
          }}
          options={{
            doneLabel: "Finish",
          }}
        />
        <aside
          className={clsx("marketplace__aside", {
            "marketplace__aside--open": rootStore.showFilters,
          })}
        >
          <MultiFilters
            filters={filters}
            onApplyFilter={setMultiFilters}
            {...(isTablet && { onClose: () => rootStore.toggleShowFilters(false) })}
          />
        </aside>
        <div className="marketplace__content">
          <div className="marketplace__header">
            <h2 className="marketplace__title">{getPageTitle()}</h2>
            <MarketPlaceTopFilters
              pathname={pathname}
              color={colorFilter}
              type={typeFilter}
              onSetColor={setColorFilter}
              onSetType={setTypeFilter}
            />
          </div>
          <div className="marketplace__cards-wrapper">
            {poolsLoading ? (
              <SkeletonLoading count={4} width={265} height={455} />
            ) : (
              filteredPools.map((item, idx) => (
                <WineCard
                  //   key={idx}
                  {...item}
                  flag={rootStore.getCountryFlag(item.wineParams.WineProductionCountry)}
                  onFavoriteClick={
                    window.LOGGED
                      ? item.isFavorite
                        ? removeFromFavorite
                        : addToFavorite
                      : undefined
                  }
                  currency={currencyStore.currency}
                />
              ))
            )}
          </div>
          {!!pools.length && totalPages > 1 && <Pagination items={items} className="mb-0" />}
        </div>
      </div>
    </>
  );
});

export default MarketPlace;
