import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { BaseButton } from "components/common";
import { PageMeta, Slider, WineCard, PageLoader } from "components";
import { useMediaQuery } from "hooks";
import { useFirstSalePool } from "hooks/resources/useFirstSalePool";
import { useFirstSale } from "hooks/resources/useFirstSale";
import { useMarketSalePool } from "hooks/resources/useMarketSalePool";
import { useRootStore } from "context/RootStoreProvider";
import { routes } from "utils/router";
import ProductInfo from "./ProductInfo/ProductInfo";
import "./Product.styles.scss";
import { Product as ProductSchemaInterface, WithContext } from "schema-dts";
import currencyStore from "stores/CurrencyStore";

function Product() {
  const { id, userName } = useParams<{ id: string; userName: string | undefined }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isMobile = useMediaQuery("(max-width: 767px)");
  const rootStore = useRootStore();

  /* eslint-disable react-hooks/rules-of-hooks */
  const poolResult = userName
    ? useMarketSalePool({ orderId: id ?? "0" })
    : useFirstSalePool({ poolId: id ?? "0" });

  const { pools, addToFavorite, removeFromFavorite } = useFirstSale({
    filter: { IsNew: ["1"] },
    pagination: { onPage: 4, pageNumber: 1 },
  });

  const winePool = userName
    ? (poolResult.pool as MarketWineRaw).winePool
    : (poolResult.pool as WineRaw);

  if (poolResult.poolLoading) {
    return <PageLoader />;
  }

  const pageTitle = `Buy wine ${winePool?.wineParams?.WineName ?? ""} ${
    winePool?.wineParams?.WineProductionYear ?? ""
  } | Winessy - Wine NFT Marketplace №1`;

  const schema: WithContext<ProductSchemaInterface> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: winePool?.wineParams?.WineName,
    image: winePool.image ?? "",
    description: `${winePool?.wineParams?.WineName ?? ""} ${
      winePool?.wineParams?.WineProductionYear ?? ""
    } ${winePool?.wineParams?.WineProductionCountry ?? ""}`,
    brand: {
      "@type": "Brand",
      name: winePool?.wineParams?.WineProducerName ?? "",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: winePool?.wineParams?.FirstSalePrice ?? "0",
      availability: "https://schema.org/OnlineOnly",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <PageMeta pageTitle={pageTitle} schema={schema} />
      <div className="product container">
        <ProductInfo isUserSale={!!userName} poolData={poolResult} />
        <div className="product__new">
          <h3 className="product__title">New items</h3>
          <BaseButton
            size="small"
            theme="contained rounded"
            click={() => navigate(routes.newItems.path)}
          >
            All
          </BaseButton>
        </div>
        {isMobile ? (
          <Slider slides={renderNewItems()} withPagination className="product__new-slider" />
        ) : (
          <div className="product__new-wrapper">{renderNewItems()}</div>
        )}
      </div>
    </>
  );

  function renderNewItems() {
    return pools
      .filter(({ wineParams: { IsNew } }) => +IsNew)
      .map((item, idx) => (
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
  }
}

export default observer(Product);
