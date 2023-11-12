import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { ReactComponent as HeartFilled } from "assets/icons/heart-filled.svg";
import { ReactComponent as Heart } from "assets/icons/heart.svg";
import { ReactComponent as Token } from "assets/icons/token.svg";
import { ReactComponent as User } from "assets/icons/user.svg";
import { ReactComponent as RemoveFromBasket } from "assets/icons/remove-basket.svg";
import { BaseButton, BaseLink } from "components/common";
import { SellerCard } from "components";
import { routes } from "utils/router";
import "./WineCard.styles.scss";
import Counter from "components/Counter/Counter";
import currencyStore from "stores/CurrencyStore";
import { currencies } from "constants/currencies";

interface WineCardProps extends WineRaw {
  userName?: string;
  userImg?: string;
  flag?: string;
  orderId?: number;
  price?: number;
  basket?: boolean;
  count?: number;
  marketPool?: boolean;
  currency?: string;
  onFavoriteClick?: (params: { poolId: number }) => Promise<void>;
  onBuy?: (totalPrice: number) => void;
  onRemove?: () => void;
  onChangeCount?: (value: number) => void;
}

function WineCard({
  priceChangePercent,
  poolId,
  wineParams,
  userName,
  isFavorite,
  image,
  tokensCount,
  uniqOwnersCount,
  userImg,
  flag,
  orderId,
  price,
  basket,
  count,
  currency,
  onFavoriteClick,
  onBuy,
  onRemove,
  onChangeCount,
  marketPool,
}: WineCardProps) {
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const [productPrice, setProductPrice] = useState<number | string>(0);
  const productSlug = `${wineParams.WineName.split(" ").join("-")}-${
    wineParams.WineProductionYear
  }`;
  const isProductPath = pathname.includes("product");

  const handleCurrencySelect = async (price: number | string) => {
    if (currency === "USD") {
      setProductPrice(price);
    } else {
      // convert price from usd to another currency
      const result = (Math.ceil(Number(price) * currencyStore.currencyRate * 100) / 100).toString();

      setProductPrice(result.substring(0, result.toString().indexOf(".") + 3));
    }
  };

  useEffect(() => {
    handleCurrencySelect(price ? price : wineParams.FirstSalePrice ? wineParams.FirstSalePrice : 0);
  }, [currency, wineParams.FirstSalePrice]);

  // prettier-ignore
  const changeClass = useMemo(() => {
    return parseFloat(priceChangePercent) < 0
      ? "wine-card__change--down"
      : parseFloat(priceChangePercent) > 0
        ? "wine-card__change--up"
        : "";
  }, [priceChangePercent]);

  const handleClickView = useCallback(() => {
    if (isProductPath && state) {
      window.history.replaceState({}, document.title);
      window.location.href = `/${marketPool ? userName : "french-wines"}/${
        marketPool ? poolId : productSlug
      }`;
    }

    navigate(
      `/${marketPool ? userName : "french-wines"}/${marketPool ? orderId : productSlug ?? poolId}`,
      {
        state: userName !== undefined ? { from: "userSale" } : null,
      },
    );
  }, [poolId, orderId, isProductPath]);

  const handleOnClickFavorite = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();

      onFavoriteClick && onFavoriteClick({ poolId });
    },
    [poolId, onFavoriteClick],
  );

  const isNew = Number(wineParams.IsNew ?? "0");
  const isMarketPlacePath = pathname === routes.marketplace.path;
  const basketPrice = Number(productPrice) * (count ?? 0);
  const convertedPriceValue: number = basket
    ? basketPrice
    : Number(productPrice) ?? Number(wineParams.FirstSalePrice);
  const displayPrice = `${currencies[currency as keyof typeof currencies]} ${convertedPriceValue}`;

  return (
    <div
      className={clsx("wine-card", {
        "wine-card--new": isNew && isMarketPlacePath,
        "wine-card--user": userName !== undefined,
      })}
      onClick={() => (basket ? null : handleClickView())}
    >
      <img className="wine-card__flag" src={flag} alt="flag" />
      {basket ? (
        <div className=" wine-card__fav cursor-pointer" onClick={onRemove}>
          <RemoveFromBasket />
        </div>
      ) : (
        <div
          className={clsx("wine-card__fav", window.LOGGED && "cursor-pointer")}
          onClick={handleOnClickFavorite}
        >
          {isFavorite ? <HeartFilled /> : <Heart />}
        </div>
      )}
      <img className="wine-card__img" src={image ?? ""} alt="wine" />
      <div className="wine-card__bottom">
        {!!isNew && <div className="wine-card__new">New</div>}
        <p className="wine-card__title">{wineParams.WineName}</p>
        <div className="wine-card__info">
          <span>{wineParams.WineProductionYear}</span>
          <span className="wine-card__volume">{wineParams.WineBottleVolume}</span>
          <span>{wineParams.WineProductionCountry}</span>
        </div>
        {basket && onChangeCount && (
          <Counter value={count ?? 0} onChange={onChangeCount} className="wine-card__count" />
        )}
        <div className={clsx("wine-card__price-wrap", basket && "wine-card__price-wrap--basket")}>
          <span className="wine-card__price"> {displayPrice}</span>
          <span className={clsx("wine-card__change", changeClass)}>
            {+priceChangePercent < 0 ? priceChangePercent.substring(1) : priceChangePercent}%
          </span>
          <BaseLink
            className="wine-card__link"
            path={`/${marketPool ? userName : "french-wines"}/${marketPool ? poolId : productSlug}`}
          >
            View
          </BaseLink>
        </div>
        {(!isNew || !isMarketPlacePath || userName) && (
          <>
            <div className="wine-card__sells">
              <div>
                <Token />
                <span>{tokensCount}</span>
              </div>
              <div>
                <span>{uniqOwnersCount}</span>
                <User />
              </div>
            </div>
            {userName !== undefined ? (
              <div className="d-flex">
                <SellerCard name={userName} img={userImg ?? ""} isSmall />
                <BaseButton
                  color={basket ? "black" : "red"}
                  theme="outlined-red"
                  fullWidth
                  click={
                    basket ? () => (onBuy ? onBuy(convertedPriceValue) : null) : handleClickView
                  }
                >
                  {basket ? "Оплатить" : "View"}
                </BaseButton>
              </div>
            ) : (
              <BaseButton
                color={basket ? "black" : "red"}
                theme="outlined-red"
                fullWidth
                click={basket ? () => (onBuy ? onBuy(convertedPriceValue) : null) : handleClickView}
              >
                {basket ? "Оплатить" : "View"}
              </BaseButton>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default memo(WineCard);
