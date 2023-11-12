import React, { useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import clsx from "clsx";

import { PageMeta } from "components";
import { BaseLink } from "components/common";
import { useWindowScroll } from "hooks";
import { useRootStore } from "context/RootStoreProvider";
import { isImageFile, isMaxFileSize } from "utils";
import { routes } from "utils/router";
import noImageIconSrc from "assets/images/no-image.png";
import { ReactComponent as CheckIcon } from "assets/icons/check.svg";
import "./Profile.styles.scss";

function Profile() {
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const scrolled = useWindowScroll(".profile__info");
  const isFollowPages = ["/profile/followers", "/profile/following"].includes(pathname);
  const isProfilePage = pathname === routes.profile.path;

  const { authStore } = useRootStore();

  return (
    <>
      <PageMeta />
      <div className={clsx("profile", { "profile--follow": isFollowPages })}>
        <div
          className={clsx("profile__header--fixed", {
            "profile__header--show": scrolled || isFollowPages,
          })}
        >
          <div className="profile__header-top">
            <div className="container d-flex align-items-center">
              <div className="profile__header-ava">
                <img
                  className="profile__header-img"
                  src={authStore.selfInformation.image || noImageIconSrc}
                  alt="user"
                />
                {authStore.selfInformation.isKycApproved && renderApprovedKycIcon()}
              </div>
              <h3 className="profile__name">{authStore.fullName}</h3>
            </div>
          </div>
          <div className="profile__nav profile__nav--fixed">
            <BaseLink className="profile__link" path="/profile">
              Профиль
            </BaseLink>
            <BaseLink
              className="profile__link"
              path={`/profile/${isFollowPages ? "followers" : "payment"}`}
            >
              {isFollowPages ? "Followers" : "Payment"}
            </BaseLink>
            <BaseLink
              className="profile__link"
              path={`/profile/${isFollowPages ? "following" : "favorites"}`}
            >
              {isFollowPages ? "Following" : "Favorites"}
            </BaseLink>
          </div>
        </div>
        <div className={clsx("profile__nav", { "d-none": isFollowPages })}>
          <BaseLink className="profile__link" path="/profile">
            Профиль
          </BaseLink>
          <BaseLink className="profile__link" path="/profile/payment">
            Способ оплаты
          </BaseLink>
          <BaseLink className="profile__link" path="/profile/favorites">
            Подписчики
          </BaseLink>
        </div>
        <div className="profile__container container">
          <div className={clsx("profile__header", { "d-none": isFollowPages })}>
            <div
              className={clsx(
                "profile__header-ava",
                isProfilePage && "profile__header-ava--allowedUpdate",
              )}
              onClick={isProfilePage ? handleChangeAvatar : undefined}
            >
              <img
                className="profile__header-img"
                src={authStore.selfInformation.image || noImageIconSrc}
                alt="user"
              />
              {authStore.selfInformation.isKycApproved && renderApprovedKycIcon()}
              <input
                ref={fileInput}
                onChange={handleFileInputChange}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
              />
              {isProfilePage && <div className="profile__header-error">{error}</div>}
            </div>
            <h3 className="profile__name">{authStore.fullName}</h3>
            <span className="profile__wallet">
              {authStore.selfInformation.contractAddresses.length
                ? authStore.selfInformation.contractAddresses?.[0]?.address
                : ""}
            </span>
            <span className="profile__nickname">{authStore.selfInformation.nickname}</span>
            <div className="profile__info">
              <div
                className="profile__info-block cursor-pointer"
                onClick={() => navigate("/profile/followers")}
              >
                <span className="profile__info-label">Поклонники</span>
                <span className="profile__info-value">
                  {authStore.selfInformation.followersCount}
                </span>
              </div>
              <div
                className="profile__info-block cursor-pointer"
                onClick={() => navigate("/profile/following")}
              >
                <span className="profile__info-label">Подписки</span>
                <span className="profile__info-value">
                  {authStore.selfInformation.followingCount}
                </span>
              </div>
              <div className="profile__info-block d-none d-md-flex">
                <span className="profile__info-label">Товары</span>
                <span className="profile__info-value">
                  {authStore.selfInformation.concreteBottlesCount}
                </span>
              </div>
              <div className="profile__info-block d-none d-md-flex">
                <span className="profile__info-label">Баланс</span>
                <span className="profile__info-value">
                  $ {authStore.selfInformation.concreteBottlesTotalPrice}
                </span>
              </div>
            </div>
            <span className="profile__description">{authStore.selfInformation.description}</span>
          </div>
          <Outlet />
        </div>
      </div>
    </>
  );

  function renderApprovedKycIcon() {
    return (
      <div className="profile__approvedKyc">
        <CheckIcon />
      </div>
    );
  }

  function handleChangeAvatar() {
    fileInput.current && (fileInput.current as HTMLInputElement).click();
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = event.target.files?.[0];

    if (file) {
      if (!isImageFile(file.type)) {
        setError("File must be an image");
        return;
      }

      if (isMaxFileSize(file.size, 4)) {
        setError("File size must be no more than 4Mb");
        return;
      }

      authStore.updateUserImage(file);
    }
  }
}

export default observer(Profile);
