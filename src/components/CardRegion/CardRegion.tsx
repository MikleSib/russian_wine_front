import { observer } from "mobx-react-lite";
import React, { memo, useEffect, useState } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import currencyStore from "stores/CurrencyStore";

import { routes } from "utils/router";
import "./CardRegion.styles.scss";
import { currencies } from "constants/currencies";

function CardRegion({ productionRegion, nameValue, priceValue }: TopRegion) {
  const navigate = useNavigate();
  const [productPrice, setProductPrice] = useState<string | number>("0");

  useEffect(() => {
    handleCurrencySelect(priceValue);
  }, [currencyStore.currency]);

  const handleCurrencySelect = async (price: string | number) => {
    if (currencyStore.currency === "RUB") {
      setProductPrice(price);
    } else {
      // convert price from usd to another currency
      const result = (Math.ceil(Number(price) * currencyStore.currencyRate * 100) / 100).toString();

      setProductPrice(result.substring(0, result.toString().indexOf(".") + 3));
    }
  };

  return (
    <div
      className="region-card"
      onClick={() =>
        navigate({
          pathname: routes.allWin.path,
          search: createSearchParams({ WineProductionRegion: [productionRegion] }).toString(),
        })
      }
    >
      <div className="region-card__title">
        <span className="region-card__name">{productionRegion}</span>
        <span className="region-card__value">
          {/* $ {priceValue}+ */}
          {currencies[currencyStore.currency as keyof typeof currencies] + " "}
          {productPrice}+
        </span>
      </div>
      <div className="region-card__type">{nameValue}</div>
    </div>
  );
}

export default memo(observer(CardRegion));
