import React from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import { ShareModal } from "components";
import { BaseButton, BaseLink } from "components/common";
import { ReactComponent as ShareIcon } from "assets/icons/share.svg";
import { ReactComponent as AnonIcon } from "assets/icons/anon.svg";
import noImageIconSrc from "assets/images/no-image.png";
import { useMediaQuery, useModal, useWindowScroll } from "hooks";
import { formatAddress } from "utils";
import "./SellerHeader.styles.scss";

interface SellerHeaderProps {
  userInfo: SelfInformationResponse;
  hasSubscribe?: boolean;
  isSubscribed?: boolean;
  onSubscribeAction?: () => Promise<void>;
  showExchange?: boolean;
}

export default function SellerHeader({
  userInfo,
  hasSubscribe,
  isSubscribed,
  onSubscribeAction,
  showExchange,
}: SellerHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [showSellModal] = useModal(<ShareModal userNickname={userInfo.nickname} />);

  return (
    <div className="sellerHeader">
      <div className="sellerHeader__top">
        {hasSubscribe && window.LOGGED && (
          <>
            <BaseButton
              theme={clsx("rounded", isSubscribed ? "outlined" : "contained")}
              color={isSubscribed ? "gray" : "white"}
              className="d-none d-md-flex border-none"
              click={onSubscribeAction}
            >
              {isSubscribed ? "Unsubscribe" : "Subscribe"}
            </BaseButton>
          </>
        )}
        {window.LOGGED && (
          <div className="sellerHeader__share-icon" onClick={showSellModal}>
            <ShareIcon />
          </div>
        )}
      </div>
      <div className="sellerHeader__bottom">
        <div className="sellerHeader__ava">
          <img className="sellerHeader__img" src={userInfo.image || noImageIconSrc} alt="user" />
        </div>
        <h3 className="sellerHeader__name">
          {userInfo.isKeepPrivate
            ? userInfo.nickname
            : `${userInfo.firstName} ${userInfo.lastName}`}
          {userInfo.isKeepPrivate && <AnonIcon />}
        </h3>
        <span className="sellerHeader__wallet">
          {userInfo.contractAddresses.length
            ? isMobile
              ? formatAddress(userInfo.contractAddresses?.[0]?.address, 10)
              : userInfo.contractAddresses?.[0]?.address
            : ""}
        </span>
        <span className="sellerHeader__nickname">{userInfo.nickname}</span>
        {hasSubscribe && window.LOGGED && (
          <BaseButton
            theme={clsx("rounded", isSubscribed ? "contained-gray" : "contained")}
            color={isSubscribed ? "gray" : "white"}
            className="d-md-none border-none"
            click={onSubscribeAction}
          >
            {isSubscribed ? "Unsubscribe" : "Subscribe"}
          </BaseButton>
        )}
        <div className="sellerHeader__info">
          <div
            className={clsx("sellerHeader__info-block sellerHeader__info-block--clickable")}
            onClick={() =>
              navigate(hasSubscribe ? `/user/${userInfo.nickname}/followers` : "/profile/followers")
            }
          >
            <span className="sellerHeader__info-label">Поклонники</span>
            <span className="sellerHeader__info-value">{userInfo.followersCount}</span>
          </div>
          <div
            className={clsx("sellerHeader__info-block sellerHeader__info-block--clickable")}
            onClick={() =>
              navigate(hasSubscribe ? `/user/${userInfo.nickname}/following` : "/profile/following")
            }
          >
            <span className="sellerHeader__info-label">Подписки</span>
            <span className="sellerHeader__info-value">{userInfo.followingCount}</span>
          </div>
          <div className="sellerHeader__info-block d-none d-md-flex">
            <span className="sellerHeader__info-label">Товары</span>
            <span className="sellerHeader__info-value">{userInfo.concreteBottlesCount}</span>
          </div>
          <div className="sellerHeader__info-block d-none d-md-flex">
            <span className="sellerHeader__info-label">Баланс</span>
            <span className="sellerHeader__info-value">₽ {userInfo.concreteBottlesTotalPrice}</span>
          </div>
        </div>
        <span className="sellerHeader__description">{userInfo.description}</span>
        <div className="sellerHeader__links">
          <BaseLink
            className="sellerHeader__link"
            path={hasSubscribe ? `/user/${userInfo.nickname}/marketplace` : "/seller/marketplace"}
          >
            Торговая площадка
          </BaseLink>
          <BaseLink
            className="sellerHeader__link"
            path={hasSubscribe ? `/user/${userInfo.nickname}/purchased` : "/seller/purchased"}
          >
            Ваши товары
          </BaseLink>
          <BaseLink
            className="sellerHeader__link"
            path={hasSubscribe ? `/user/${userInfo.nickname}/favorites` : "/seller/activity"}
          >
            {hasSubscribe ? "Избранное" : "Активность"}
          </BaseLink>
          {!hasSubscribe && showExchange ? (
            <BaseLink
              className="sellerHeader__link"
              path={hasSubscribe ? `/user/${userInfo.nickname}/exchange` : "/seller/exchange"}
            >
              Получить по почте
            </BaseLink>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface SellerFixedHeaderProps {
  fullName: string;
  image: string | null;
  userNickname?: string;
  showExchange?: boolean;
}

export const SellerFixedHeader = ({
  fullName,
  image,
  userNickname,
  showExchange,
}: SellerFixedHeaderProps) => {
  const scrolled = useWindowScroll(".sellerHeader__links:not(.sellerHeader__links--fixed)");

  return (
    <div className={clsx("sellerHeader--fixed", { "sellerHeader--show": scrolled })}>
      <div className="sellerHeader__top">
        <div className="sellerHeader__ava">
          <img className="sellerHeader__img" src={image || noImageIconSrc} alt="user" />
        </div>
        <h3 className="sellerHeader__name">{fullName}</h3>
      </div>
      <div className="sellerHeader__links sellerHeader__links--fixed">
        <BaseLink
          className="sellerHeader__link"
          path={userNickname ? `/user/${userNickname}/marketplace` : "/seller/marketplace"}
        >
          Торговая площадка
        </BaseLink>
        <BaseLink
          className="sellerHeader__link"
          path={userNickname ? `/user/${userNickname}/purchased` : "/seller/purchased"}
        >
          Ваши товары
        </BaseLink>
        <BaseLink
          className="sellerHeader__link"
          path={userNickname ? `/user/${userNickname}/favorites` : "/seller/activity"}
        >
          {userNickname ? "Избранное" : "Активность"}
        </BaseLink>
        {!userNickname && showExchange ? (
          <BaseLink
            className="sellerHeader__link"
            path={userNickname ? `/user/${userNickname}/exchange` : "/seller/exchange"}
          >
            Отправить по почте
          </BaseLink>
        ) : null}
      </div>
    </div>
  );
};
