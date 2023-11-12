import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { ReactComponent as StarFill } from "assets/icons/star-filled.svg";
import { ReactComponent as StarOutline } from "assets/icons/star-outlined.svg";
import { PageMeta, SkeletonLoading, Slider, WineCard } from "components";
import { BaseButton } from "components/common";
import { routes } from "utils/router";
import { useMediaQuery } from "hooks";
import { useFirstSale } from "hooks/resources/useFirstSale";
import { useDashboardBanners } from "hooks/resources/useDashboardBanners";
import { useMarketSale } from "hooks/resources/useMarketSale";
import { useRootStore } from "context/RootStoreProvider";
import { DashboardColorFilter } from "./DashboardColorFilter";
import TopRegions from "./TopRegions";
import TopSales from "./TopSales";
import "./Dashboard.styles.scss";

import { Steps } from "intro.js-react";
import "intro.js/introjs.css";
import { AGE_VERIFIED_KEY } from "constants/index";
import currencyStore from "stores/CurrencyStore";

function Dashboard() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const navigate = useNavigate();

  const rootStore = useRootStore();

  const { banners } = useDashboardBanners();
  const {
    pools: newPools,
    poolsLoading: newPoolsLoading,
    addToFavorite: addToFavoriteNewPool,
    removeFromFavorite: removeFromFavoriteNewPool,
  } = useFirstSale({
    filter: { IsNew: ["1"] },
    pagination: { onPage: 4, pageNumber: 1 },
  });
  const {
    pools: topPools,
    poolsLoading: topPoolsLoading,
    addToFavorite: addToFavoriteTopPool,
    removeFromFavorite: removeFromFavoriteTopPool,
  } = useFirstSale({
    filter: { IsNew: ["0"] },
    pagination: { onPage: 4, pageNumber: 1 },
  });
  const {
    marketPools,
    marketPoolsLoading,
    addToFavorite: addToFavoriteMarketPool,
    removeFromFavorite: removeFromFavoriteMarketPool,
  } = useMarketSale({
    filter: {},
    pagination: { onPage: 4, pageNumber: 1 },
  });

  function getEnableHint() {
    if (!localStorage.getItem(AGE_VERIFIED_KEY)) {
      return false;
    }
    const value: boolean = (localStorage.getItem("enableDashboardHints") ?? "true") === "true";
    console.log("enableHint", value);
    return value;
  }

  const steps = [
    {
      // element: "",
      intro: (
        <>
          <h4>Что за русское вино?</h4>
          <ul>
            <li>Это блокчейн-платформа для торговли марочными винами</li>
            <li>Мы используем Nfs для продажи права собственности на каждую бутылку</li>
            <li>
            Все перепродажи отслеживаются в блокчейне, который является быстрым, безопасным и простым в
            использовании
            </li>
          </ul>
        </>
      ),
      tooltipClass: "custom-tooltip",
    },
    {
      element: "#for-top-invested-hint",
      intro: (
        <>
          <h4>Лучшая торговля вином</h4>
          <ul>
            <li>
              Вы можете приобрести инвестиционное вино Русского шато, используя
              криптовалюту или фиатные деньги
            </li>
            <li>NFT дает возможность легкого взаимодействия с вином</li>
            <li>Как только вы покупаете NFT, вы регистрируетесь как текущий владелец</li>
            <li>
              Блокчейн регистрирует каждое перемещение бутылки, а также контролирует подлинность
              вина
            </li>
          </ul>
        </>
      ),
      tooltipClass: "custom-tooltip",
      position: "right",
    },
    {
      element: "#for-user-sales-hint",
      intro: (
        <>
          <h4>Продайте свою NFT</h4>
          <ul>
            <li>Вы можете перепродать NFT по своей собственной цене</li>
            <li>При продаже NFT право собственности на бутылку переходит к покупателю</li>
            <li>
              NFT устраняет затраты на логистику и оформление документов, поскольку бутылка не покидает хранилища
              до тех пор, пока пользователь не попросит о доставке
            </li>
          </ul>
        </>
      ),
      tooltipClass: "custom-tooltip",
      position: "right",
    },
    {
      element: ".footer__contacts",
      intro: (
        <>
          <h4>Получить больше</h4>
          <ul>
            <li>
              Мы рады приветствовать вас на нашем веб-сайте и приглашаем подписываться на нас в социальных сетях
              чтобы узнавать о новых обновлениях, полезных советах и новостях компании
            </li>
            <li>
              Ознакомьтесь с разделом часто задаваемых вопросов, если что-то непонятно, или не стесняйтесь спрашивать нас
              напрямую через чат
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
      <div className="dashboard">
        <div className="container">
          <Steps
            enabled={getEnableHint()}
            steps={steps}
            initialStep={0}
            onExit={() => localStorage.setItem("enableDashboardHints", "false")}
            options={{
              doneLabel: "Finish",
            }}
          />
          <div className="dashboard__slider">
            <Slider slides={renderSlides()} withPagination />
          </div>
          <TopRegions />
          <span id="for-top-invested-hint">
            <div className="dashboard__top">
              <h2 className="dashboard__title m-0">Лучшие инвестиции</h2>
              <DashboardColorFilter pathname={routes.topInvested.path} />
            </div>
            {isMobile ? (
              <Slider
                slides={renderTopInvested()}
                withPagination
                className="dashboard__top-slider"
                settings={{ autoplay: false }}
              />
            ) : (
              <div className="dashboard__top-wrapper">
                {topPoolsLoading ? (
                  <SkeletonLoading count={4} width={265} height={500} />
                ) : (
                  renderTopInvested()
                )}
              </div>
            )}
          </span>
          <div className="dashboard__new">
            <h2 className="dashboard__title m-0">Новые товары</h2>
            <BaseButton
              size="small"
              theme="contained rounded"
              click={() => navigate(routes.newItems.path)}
            >
              Все
            </BaseButton>
          </div>
          {isMobile ? (
            <Slider
              slides={renderNewPools()}
              withPagination
              className="dashboard__top-slider"
              settings={{ autoplay: false }}
            />
          ) : (
            <div className="dashboard__top-wrapper">
              {newPoolsLoading ? (
                <SkeletonLoading count={4} width={265} height={440} />
              ) : (
                renderNewPools()
              )}
            </div>
          )}
          <TopSales userNickname={rootStore.authStore.selfInformation.nickname} />
          <span id="for-user-sales-hint">
            <div className="dashboard__top">
              <h3 className="dashboard__title m-0">Вторичный рынок</h3>
              <DashboardColorFilter pathname={routes.userSales.path} />
            </div>
            {isMobile ? (
              <Slider
                slides={renderUserSales()}
                withPagination
                className="dashboard__top-slider"
                settings={{ autoplay: false }}
              />
            ) : (
              <div className="dashboard__top-wrapper">
                {marketPoolsLoading ? (
                  <SkeletonLoading count={4} width={265} height={535} />
                ) : (
                  renderUserSales()
                )}
              </div>
            )}
          </span>
        </div>
      </div>
    </>
  );

  function renderRatingStars(rating: number): JSX.Element {
    const filledStars = Math.floor(5 * (rating / 100));
    const outlinedStars = 5 - filledStars;
    return (
      <>
        {Array.from({ length: filledStars }, (_, key) => (
          <StarFill key={`fill_${key}`} />
        ))}
        {Array.from({ length: outlinedStars }, (_, key) => (
          <StarOutline key={`outline_${key}`} />
        ))}
      </>
    );
  }

  function renderSlides(): JSX.Element[] {
    return banners.map((banner, idx) => (
      <div key={idx} className="dashboard__slide">
        <img src={banner.image} alt={banner.name} className="dashboard__slide-img" />
        <div className="dashboard__slide-bottom">
          <div className="d-flex align-items-center justify-content-between">
            <h1 className="dashboard__slide-title">{banner.name}</h1>
            <BaseButton
              size="large"
              className="d-none d-md-flex"
              click={() => window.open(banner.link, "_blank", "noopener, noreferrer")}
            >
              Изучайте!
            </BaseButton>
          </div>
          <div className="dashboard__slide-stars">
            {renderRatingStars(banner.rating)}
            <span className="dashboard__slide-rate">{banner.rating}</span>
          </div>
        </div>
      </div>
    ));
  }

  function renderTopInvested(): JSX.Element[] {
    return topPools.map((item, idx) => (
      <WineCard
        key={idx}
        {...item}
        flag={rootStore.getCountryFlag(item.wineParams.WineProductionCountry)}
        onFavoriteClick={
          window.LOGGED
            ? item.isFavorite
              ? removeFromFavoriteTopPool
              : addToFavoriteTopPool
            : undefined
        }
        currency={currencyStore.currency}
      />
    ));
  }

  function renderNewPools(): JSX.Element[] {
    return newPools.map((item, idx) => (
      <WineCard
        key={idx}
        {...item}
        flag={rootStore.getCountryFlag(item.wineParams.WineProductionCountry)}
        onFavoriteClick={
          window.LOGGED
            ? item.isFavorite
              ? removeFromFavoriteNewPool
              : addToFavoriteNewPool
            : undefined
        }
        currency={currencyStore.currency}
      />
    ));
  }

  function renderUserSales(): JSX.Element[] {
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
              ? removeFromFavoriteMarketPool
              : addToFavoriteMarketPool
            : undefined
        }
        marketPool={true}
        currency={currencyStore.currency}
      />
    ));
  }
}

export default observer(Dashboard);
