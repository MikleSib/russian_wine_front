import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import { useWeb3React } from "@web3-react/core";
import { useNavigate } from "react-router-dom";

import { FeedbackModal, WalletProviderModal } from "components";
import { FEEDBACK_MODAL_STATE } from "components/FeedbackModal/FeedbackModal";
import { BaseButton } from "components/common";
import { useApprove, useCheckApprovalStatus, useModal } from "hooks";
import type { UseMarketSalePoolResult } from "hooks/resources/useMarketSalePool";
import type { UseFirstSalePoolResult } from "hooks/resources/useFirstSalePool";
import { useRootStore } from "context/RootStoreProvider";
import { AGE_VERIFIED_KEY, tokens } from "constants/index";
import { CHAIN_ID } from "utils/web3React";
import { ReactComponent as ArrowIcon } from "assets/icons/down-arrow.svg";
import { ReactComponent as EyeIcon } from "assets/icons/eye.svg";
import { ReactComponent as HeartFilled } from "assets/icons/heart-filled.svg";
import { ReactComponent as Heart } from "assets/icons/heart.svg";
import { ReactComponent as TokenIcon } from "assets/icons/token.svg";
import { ReactComponent as UserIcon } from "assets/icons/user.svg";
import { ReactComponent as ClockIcon } from "assets/icons/clock.svg";
import noImageIconSrc from "assets/images/no-image.png";
import BuyNowModal from "../BuyNowModal/BuyNowModal";
import styles from "./ProductInfo.module.scss";
import { PriceChart } from "../PriceChart/PriceChart";
import currencyStore from "stores/CurrencyStore";
import { StripePaymentApi } from "services/goPayPayment/goPayPaymentApi";
import { processForm } from "utils";
import { notificationsStore } from "views";
import { Steps } from "intro.js-react";
import ReactGA from "react-ga4";
import moment from "moment";
import { BasketItem, useBasket } from "hooks/useBasket";
import Counter from "components/Counter/Counter";
import { currencies } from "constants/currencies";

interface ProductInfoProps {
  isUserSale?: boolean;
  poolData: UseMarketSalePoolResult | UseFirstSalePoolResult;
  onDismissModal?: () => void;
}

function ProductInfo({ isUserSale, poolData, onDismissModal }: ProductInfoProps) {
  const [pendingTx, setPendingTx] = useState(false);
  const [detailsFull, toggleDetails] = useState(true);
  const [description, toggleDescription] = useState(true);
  const [priceHistory, togglePriceHistory] = useState(true);
  const [productPrice, setProductPrice] = useState<string | number>("0");

  const navigate = useNavigate();
  const rootStore = useRootStore();
  const { chainId } = useWeb3React();
  const { basket, isInBasket, addToBasket, changeBasketItemCount } = useBasket();

  const winePool = isUserSale
    ? (poolData.pool as MarketWineRaw).winePool
    : (poolData.pool as WineRaw);

  const currentDate = new Date();

  const deliveryDate = new Date(winePool.possibleDeliveryDate as string);

  const isAuthorizedUser = window.LOGGED;
  const USDT = tokens.usdt.address[chainId ?? CHAIN_ID];
  const { isApproved, setLastUpdated } = useCheckApprovalStatus(
    USDT,
    Number(
      isUserSale ? +(poolData.pool as MarketWineRaw).price : winePool.wineParams.FirstSalePrice,
    ),
    isUserSale,
  );
  const { handleApprove, requestedApproval } = useApprove(USDT, setLastUpdated, isUserSale);
  const [bottleCount, setBottleCount] = useState(1);

  const [showSuccessModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.SUCCESS} />);
  const [showErrorModal] = useModal(<FeedbackModal state={FEEDBACK_MODAL_STATE.ERROR} />);
  const [showWalletProviderModal] = useModal(<WalletProviderModal />);
  const [showBuyNowModal] = useModal(
    <BuyNowModal
      poolId={winePool.poolId.toString()}
      count={bottleCount}
      token={USDT}
      currency={currencyStore.currency}
      onHandleShowError={showErrorModal}
      onShowWalletModalAction={showWalletProviderModal}
      isKycApproved={rootStore.authStore.selfInformation?.isKycApproved}
      bottlePrice={Number(
        isUserSale ? +(poolData.pool as MarketWineRaw).price : winePool.wineParams.FirstSalePrice,
      )}
    />,
  );

  const DETAILS = [
    { label: "Name", value: winePool.wineParams.WineName },
    { label: "Region", value: winePool.wineParams.WineProductionRegion },
    { label: "Year", value: winePool.wineParams.WineProductionYear },
    { label: "Producer", value: winePool.wineParams.WineProducerName },
    { label: "Country", value: winePool.wineParams.WineProductionCountry },
    { label: "Volume", value: winePool.wineParams.WineBottleVolume },
  ];

  // prettier-ignore
  const changeClass = useMemo(() => {
    return parseFloat(winePool.priceChangePercent) < 0
      ? styles.changeDown
      : parseFloat(winePool.priceChangePercent) > 0
        ? styles.changeUp
        : "";
      }, [winePool.priceChangePercent]);

  useEffect(() => {
    handleCurrencySelect(
      isUserSale ? +(poolData.pool as MarketWineRaw).price : winePool.wineParams.FirstSalePrice,
    );
  }, [currencyStore.currency]);

  useEffect(() => {
    // ReactGA.event("select_item");
    ReactGA.event({
      category: "select_item",
      action: "select_item",
      label: "select_item",
      value: winePool.poolId,
    });

    // ReactGA.event("view_item");
    ReactGA.event({
      category: "view_item",
      action: "view_item",
      label: "view_item",
      value: winePool.poolId,
    });
  }, []);

  const handleCurrencySelect = async (price: string | number) => {
    if (currencyStore.currency === "USD") {
      setProductPrice(price);
    } else {
      // convert price from usd to another currency
      const result = (Math.ceil(Number(price) * currencyStore.currencyRate * 100) / 100).toString();

      setProductPrice(result.substring(0, result.toString().indexOf(".") + 3));
    }
  };

  const handleCancelOrder = useCallback(
    async (orderId: number) => {
      setPendingTx(true);

      try {
        await (poolData as UseMarketSalePoolResult).cancelMarketSaleOrder({ orderId });

        setPendingTx(false);
        showSuccessModal();
      } catch (error) {
        console.error(error);
        setPendingTx(false);
        showErrorModal();
      }

      if (onDismissModal) {
        onDismissModal();
      }
    },
    [(poolData as UseMarketSalePoolResult).cancelMarketSaleOrder, onDismissModal],
  );

  const handleExecuteOrder = useCallback(
    async (orderId: number) => {
      setPendingTx(true);

      try {
        await (poolData as UseMarketSalePoolResult).executeMarketSaleOrder({ orderId });

        setPendingTx(false);
        showSuccessModal();
      } catch (error) {
        console.error(error);
        setPendingTx(false);
        showErrorModal();
      }

      if (onDismissModal) {
        onDismissModal();
      }
    },
    [(poolData as UseMarketSalePoolResult).executeMarketSaleOrder],
  );

  const handleClickGoToUser = useCallback(() => {
    if ((poolData.pool as MarketWineRaw).bottleOwner) {
      navigate(`/user/${(poolData.pool as MarketWineRaw).bottleOwner.nickname}/marketplace`);
    }
  }, [(poolData.pool as MarketWineRaw).bottleOwner]);

  const handleOnClickFavorite = useCallback(async () => {
    if (isAuthorizedUser) {
      if (winePool.isFavorite) {
        await poolData.removeFromFavorite({ poolId: winePool.poolId });
      } else {
        await poolData.addToFavorite({ poolId: winePool.poolId });
      }
    }
  }, [isAuthorizedUser, winePool.isFavorite, winePool.poolId, isUserSale]);

  function getEnableHint() {
    if (!localStorage.getItem(AGE_VERIFIED_KEY)) {
      return false;
    }
    const value: boolean = (localStorage.getItem("enableProductInfoHints") ?? "true") === "true";
    console.log("enableHint", value);
    return value;
  }

  const steps = [
    {
      // element: "",
      intro: (
        <>
          <h4>Больше, чем рынок</h4>
          <ul>
            <li>
              Русское вино - это платформа, на которой вы можете инвестировать в изысканное вино, перепродавать свое вино другому
              человеку по всему миру
            </li>
            <li>
              В нем также есть свои новые элементы, которые могут помочь вам в этом - аналитика, инвестиции
              портфолио и взаимодействие с другими пользователями
            </li>
          </ul>
        </>
      ),
      tooltipClass: "custom-tooltip",
    },
    {
      element: `.${styles.detailsPrice}`,
      intro: (
        <>
          <h4>История цен</h4>
          <ul>
            <li>Наиболее важную информацию вы можете найти в карточке товара</li>
            <li>
              Мы также собираем статистику цен в соответствии со статистикой внутреннего веб-сайта по каждому товару,
              чтобы вы могли проверить тенденцию на том же веб-сайте
            </li>
          </ul>
        </>
      ),
      tooltipClass: "custom-tooltip",
      position: "right",
    },
    {
      element: `.${styles.details}`,
      intro: (
        <>
          <h4>Удобные характеристики продукта</h4>
          <ul>
            <li>
              Этот раздел содержит всю основную информацию, включая количество бутылок,
              выпущенных в рамках блокчейна, и количество, которое уже было продано
            </li>
          </ul>
        </>
      ),
      tooltipClass: "custom-tooltip",
      position: "right",
    },
    {
      element: "#for-user-login-hint",
      intro: (
        <>
          <h4>Начинай</h4>
          <ul>
            <li>
             Чтобы начать пользоваться сайтом - вам просто нужно зарегистрироваться и пройти простую верификацию
            </li>
          </ul>
        </>
      ),
      tooltipClass: "custom-tooltip",
      position: "right",
    },
    {
      element: "#for-e-wallet-hint",
      intro: (
        <>
          <h4>Заключительный шаг</h4>
          <ul>
            <li>
              Подключиться вашего электронного кошелька на ваш счет, если вы хотите использовать оплате
              криптовалюта
            </li>
          </ul>
        </>
      ),
      tooltipClass: "custom-tooltip",
      position: "right",
    },
  ];

  return (
    <div className={styles.wrap}>
      <Steps
        enabled={getEnableHint()}
        steps={steps}
        initialStep={0}
        onExit={() => localStorage.setItem("enableProductInfoHints", "false")}
        options={{
          doneLabel: "Finish",
        }}
      />
      <div className={clsx(styles.header, "d-lg-none")}>{renderHeaderInfo()}</div>
      <div className={clsx(styles.slider, "d-lg-none")}>{renderImage()}</div>
      <div className={styles.left}>
        <div className={clsx(styles.slider, "d-none d-lg-block")}>{renderImage()}</div>
        <div className={clsx(styles.buttons, "d-md-none")}>
          {renderCounter()}
          {renderBuyButton()}
        </div>
        <div className={clsx(styles.details, { [styles.IsHide]: !detailsFull })}>
          <h2 className={styles.detailsTitle} onClick={() => toggleDetails(!detailsFull)}>
            Детали
            <ArrowIcon />
          </h2>
          <div className={styles.detailsContent}>
            {renderDetailsRows()}
            <hr className={styles.separator} />
            <div className={styles.detailsRow}>
              <span>Количество NFT</span>
              <span>{winePool.maxTotalSupply}</span>
            </div>
            <div className={styles.detailsRow}>
              <span>Продано</span>
              <span>{winePool.tokensCount}</span>
            </div>
            {winePool.possibleDeliveryDate &&
              winePool.possibleDeliveryDate.length > 0 &&
              currentDate < deliveryDate && (
                <>
                  <hr className={styles.separator} />
                  <div className={styles.detailsRow}>
                    <span>Категория Вин</span>
                    <span>вино en-primeur</span>
                  </div>
                  <div className={styles.detailsRow}>
                    <span>Возможная дата поставки</span>
                    <span>{moment(winePool.possibleDeliveryDate).format("MMMM YYYY")}</span>
                  </div>
                </>
              )}
          </div>
        </div>
        <div
          className={clsx(styles.details, styles.detailsDesc, "d-lg-none", {
            [styles.IsHide]: !description,
          })}
        >
          {renderDescription()}
        </div>
      </div>
      <div className={styles.right}>
        <div className={clsx(styles.header, "d-none d-lg-block")}>{renderHeaderInfo()}</div>
        <div className={styles.stat}>
          <div className={styles.statBlock}>
            <EyeIcon />
            <span>{winePool.viewersCount} views</span>
          </div>
          <div className={styles.statBlock}>
            <div
              className={isAuthorizedUser ? "cursor-pointer" : ""}
              onClick={handleOnClickFavorite}
            >
              {winePool.isFavorite ? <HeartFilled /> : <Heart />}
            </div>
            <span>{winePool.favoritesCount} избранное</span>
          </div>
          <div className={styles.statBlock}>
            <TokenIcon />
            <span>
              <span className={styles.statIsBlack}>{winePool.tokensCount}</span> /{" "}
              {winePool.maxTotalSupply}
            </span>
          </div>
          <div className={styles.statBlock}>
            <UserIcon />
            <span className={styles.statIsBlack}>{winePool.uniqOwnersCount}</span>
          </div>
          {isUserSale && (
            <div className={styles.statBlock} onClick={handleClickGoToUser}>
              <img
                className={styles.statImage}
                src={(poolData.pool as MarketWineRaw).bottleOwner.image || noImageIconSrc}
                alt="user"
              />
              <span className={styles.statIsRed}>
                {(poolData.pool as MarketWineRaw).bottleOwner.nickname}
              </span>
            </div>
          )}
        </div>
        <div className={styles.actions}>
          <div className={styles.price}>
            <span className={styles.priceIsBold}>
              {currencies[currencyStore.currency as keyof typeof currencies] + " "}
              {productPrice}
            </span>
            <div className={styles.changeWrap}>
              <ClockIcon />
              <span className={clsx(styles.change, changeClass)}>
                {+winePool.priceChangePercent}%
              </span>
            </div>
          </div>
          <div className={clsx(styles.buttons, "d-none d-md-flex")}>
            {renderCounter()}
            {renderBuyButton()}
          </div>
        </div>
        {winePool.possibleDeliveryDate &&
          winePool.possibleDeliveryDate.length > 0 &&
          winePool.futuresImage &&
          winePool.futuresImage !== "empty" &&
          currentDate < deliveryDate && (
            <div className={styles.futures}>
              <img src={winePool.futuresImage} alt="futures" />
            </div>
          )}

        <div
          className={clsx(styles.details, styles.detailsPrice, {
            [styles.IsHide]: !priceHistory,
          })}
        >
          <h2 className={styles.detailsTitle} onClick={() => togglePriceHistory(!priceHistory)}>
            История цен
            <ArrowIcon />
          </h2>
          <div className={styles.detailsContent}>
            <PriceChart poolId={winePool.poolId} />
          </div>
        </div>
        <div
          className={clsx(styles.details, styles.detailsDesc, "d-none d-lg-block", {
            [styles.IsHide]: !description,
          })}
        >
          {renderDescription()}
        </div>
      </div>
    </div>
  );

  function renderHeaderInfo() {
    return (
      <>
        <div className={styles.infoHeader}>
          <h1 className={styles.title}>{winePool.wineParams.WineName}</h1>{" "}
          <span>SKU:{winePool.sku}</span>
        </div>
        <div className={styles.info}>
          <span>{winePool.wineParams.WineProductionYear}</span>
          <span className={styles.volume}>{winePool.wineParams.WineBottleVolume}</span>
          <span>{winePool.wineParams.WineProductionCountry}</span>
        </div>
      </>
    );
  }

  function renderImage() {
    return (
      <div className={styles.slide}>
        <img
          className={styles.flag}
          src={rootStore.getCountryFlag(winePool.wineParams.WineProductionCountry)}
          alt="flag country"
        />
        <img className={styles.image} src={winePool.image ?? ""} alt="wine" />
      </div>
    );
  }

  function renderCounter() {
    const isDisabled = !isAuthorizedUser || pendingTx;
    const isPoductInBasket: BasketItem | undefined = isInBasket(winePool.poolId);
    const maxCount = winePool.maxTotalSupply - winePool.tokensCount;
    const countAdded = isPoductInBasket?.count ?? 0;

    if (isUserSale) {
      return null;
    }

    const handleChangeCount = (value: number) => {
      if (!isDisabled) {
        const totalCount = value + countAdded;
        if (value > 0 && totalCount <= maxCount) {
          setBottleCount(value);
        }
      }
    };

    return <Counter value={bottleCount} onChange={handleChangeCount} />;
  }

  // function poolIdArray(poolId: string, count: number) {
  //   const arr = [];
  //   for (let index = 0; index < count; index++) {
  //     arr.push(poolId);
  //   }
  //   console.log(arr);
  //   return arr;
  // }

  // async function buyWithBankCard() {
  //   try {
  //     setPendingTx(true);
  //     const { response } = await StripePaymentApi.buyToken(
  //       poolIdArray(winePool.poolId.toString(), bottleCount),
  //       currencyStore.currency === "USD" ? "EUR" : currencyStore.currency,
  //     );
  //     setPendingTx(false);

  //     if (response?.payDeliveryUrl) {
  //       processForm(response);
  //       notificationsStore.addNotification({
  //         id: Date.now(),
  //         TxTime: Date.now(),
  //         type: "success",
  //         message: "NFT was successfully minted",
  //       });
  //     }
  //     if (onDismissModal) onDismissModal();
  //   } catch (error) {
  //     setPendingTx(false);
  //     console.error(error);
  //     showErrorModal();
  //   }
  // }

  function renderBuyButton() {
    const isPoductInBasket: BasketItem | undefined = isInBasket(winePool.poolId);
    const maxCount = winePool.maxTotalSupply - winePool.tokensCount;
    const isMoreThenMaxCount = isPoductInBasket && isPoductInBasket?.count >= maxCount;
    // prettier-ignore

    const handleBuyNow = !isApproved
    ? handleApprove
    : (poolData.pool as MarketWineRaw).isMine
      ? () => handleCancelOrder((poolData.pool as MarketWineRaw).orderId)
      : () => handleExecuteOrder((poolData.pool as MarketWineRaw).orderId)

    const handleAddToBasket = () => {
      addToBasket(winePool, bottleCount);
      setBottleCount(1);
    };
    
    return (
      <BaseButton
        size="large"
        disabled={!isAuthorizedUser || pendingTx || isMoreThenMaxCount}
        click={() => (isUserSale ? handleBuyNow() : handleAddToBasket())}
      >
        {
        isUserSale
          ? ((poolData.pool as MarketWineRaw).isMine ? "Отменить заказ" : "Купить")
          : "Добавить в корзину"
        }   
      </BaseButton>
    );
  }

  function renderDetailsRows() {
    return DETAILS.map(({ label, value }, index) => (
      <div className={styles.detailsRow} key={`details-row__${index}`}>
        <span>{label}</span>
        <span>{value}</span>
      </div>
    ));
  }

  function renderDescription() {
    return (
      <>
        <h2 className={styles.detailsTitle} onClick={() => toggleDescription(!description)}>
          Описание
          <ArrowIcon />
        </h2>
        <div
          className={styles.detailsContent}
          dangerouslySetInnerHTML={{ __html: winePool.wineParams.Description }}
        />
      </>
    );
  }
}

export default observer(ProductInfo);
