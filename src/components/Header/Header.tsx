import React, { FC, useCallback, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import clsx from "clsx";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

import { ReactComponent as User } from "assets/icons/user.svg";
import { ReactComponent as Notification } from "assets/icons/notification.svg";
import { ReactComponent as Menu } from "assets/icons/bars.svg";
import { ReactComponent as Close } from "assets/icons/close.svg";
import { ReactComponent as CheckIcon } from "assets/icons/check.svg";
import { ReactComponent as UserOutlined } from "assets/icons/user-outlined.svg";
import { ReactComponent as PlusCircle } from "assets/icons/plus-circle.svg";
import { ReactComponent as Key } from "assets/icons/key.svg";
import { ReactComponent as Linkedin } from "assets/icons/linkedin-filled.svg";
import { ReactComponent as Facebook } from "assets/icons/facebook-filled.svg";
import { ReactComponent as Twitter } from "assets/icons/twitter-filled.svg";
import { ReactComponent as Marketplace } from "assets/icons/shopping-bag.svg";
import { ReactComponent as Payment } from "assets/icons/credit-card.svg";
import { ReactComponent as Favorites } from "assets/icons/heart.svg";
import { ReactComponent as Logout } from "assets/icons/sign-out.svg";
import { ReactComponent as Filter } from "assets/icons/filter.svg";
import logoMobileSrc from "assets/images/logo-fruit.svg";
import logoSrc from "assets/images/logo-black.svg";
import noImageIconSrc from "assets/images/no-image.png";
import { BaseLink, BaseSearch } from "components/common";
import { Web3Status } from "components";
import { useRootStore } from "context/RootStoreProvider";
import { useMediaQuery, useOnClickOutside } from "hooks";
import { routes } from "utils/router";
import { isTouchDevice } from "utils";
import "./Header.styles.scss";
import NotificationsMenu from "views/Notifications/NotificationsMenu";
import NotificationsStore from "views/Notifications/NotificationsStore";
import Select from "components/common/Select/Select";
import currencyStore from "stores/CurrencyStore";
import ReactGA from "react-ga4";
import BasketLink from "components/BasketLink/BasketLink";

const Header: FC = observer(() => {
  const [showMenu, setShowMenu] = useState<Record<string, boolean>>({
    mobile: false,
    user: false,
    notifications: false,
  });
  const [searchParams, setSearchParams] = useSearchParams({});

  const rootStore = useRootStore();
  const userMenuRef = useRef<null | HTMLDivElement>(null);
  const NotificationsMenuRef = useRef<null | HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(max-width: 1023px)");
  useOnClickOutside(userMenuRef, () => handleCloseMenuByType("user"));
  useOnClickOutside(NotificationsMenuRef, () => handleCloseMenuByType("notifications"));

  const isShowFilterMobileButton =
    [
      routes.topInvested.path,
      routes.newItems.path,
      routes.allWin.path,
      routes.userSales.path,
      routes.sellerPurchased.path,
      routes.sellerActivity.path,
      routes.sellerMarketPlace.path,
    ].includes(pathname) ||
    (pathname.startsWith("/user") && pathname.endsWith("marketplace")) ||
    (pathname.startsWith("/user") && pathname.endsWith("favorites")) ||
    (pathname.startsWith("/user") && pathname.endsWith("purchased"));

  const options = [
    {
      label: "RUB",
      value: "RUB",
    // },
    // {
    //   label: "EUR",
    //   value: "EUR",
    // },
    // {
    //   label: "CZK",
    //   value: "CZK",
    // },
    // {
    //   label: "GBP",
    //   value: "GBP",
    // },
    // {
    //   label: "HKD",
    //   value: "HKD",
    // },
    // {
    //   label: "CNY",
    //   value: "CNY",
    // },
    }
  ];

  const getDefaultOptionIndex = () => {
    const currency = options.findIndex(({ value }) => value === currencyStore.currency);
    if (currency !== -1) {
      return currency;
    }
    return 0;
  };

  // TODO separate component
  const renderUserMenu = (): JSX.Element => {
    return (
      <div
        className={clsx("header__dropdown", "header__dropdown-user", {
          "header__dropdown--show": showMenu.user,
        })}
      >
        {rootStore.authStore.isLogined ? (
          <>
            <BaseLink
              className="header__link--user"
              path={`${routes.seller.path}/marketplace`}
              nativeClick={() => handleCloseMenuByType("mobile")}
            >
              <Marketplace />
              Моя торговая площадка
            </BaseLink>
            <hr className="header__separator" />
            <BaseLink
              className="header__link--user"
              path={routes.profile.path}
              nativeClick={() => handleCloseMenuByType("mobile")}
            >
              <UserOutlined />
              Профиль
            </BaseLink>
            <BaseLink
              className="header__link--user"
              path={`${routes.profile.path}/payment`}
              nativeClick={() => handleCloseMenuByType("mobile")}
            >
              <Payment />
              Способ оплаты
            </BaseLink>
            <BaseLink
              className="header__link--user"
              path={`${routes.profile.path}/favorites`}
              nativeClick={() => handleCloseMenuByType("mobile")}
            >
              <Favorites />
              Избранное
            </BaseLink>
            <hr className="header__separator" />
            <BaseLink className="header__link--user" path="#" nativeClick={handleClickLogout}>
              <Logout />
              Выйти
            </BaseLink>
          </>
        ) : (
          <>
            <BaseLink
              className="header__link--user"
              path={routes.login.path}
              nativeClick={() => handleCloseMenuByType("mobile")}
            >
              <UserOutlined />
              Войти
            </BaseLink>
            <BaseLink
              className="header__link--user"
              path={routes.register.path}
              nativeClick={() => handleCloseMenuByType("mobile")}
            >
              <PlusCircle />
              Регистрация
            </BaseLink>
            <hr className="header__separator" />
            <BaseLink
              className="header__link--user"
              path={routes.forgotPassword.path}
              nativeClick={() => handleCloseMenuByType("mobile")}
            >
              <Key />
              Забыл пароль
            </BaseLink>
          </>
        )}
      </div>
    );
  };

  // TODO separate component
  const renderMobileMenu = (): JSX.Element => {
    return (
      <div
        className={clsx("header__mobile-menu", { "header__mobile-menu--show": showMenu.mobile })}
      >
        <BaseSearch
          className="header__search-field"
          placeholder="Поиск товаров..."
          onChange={() => null}
        />
        <nav className="header__nav">
          <BaseLink
            className="header__link"
            path={routes.marketplace.path}
            nativeClick={handleCloseAllMenus}
          >
            Торговая площадка
          </BaseLink>
          {/* <BaseLink
            className="header__link"
            path="https://winessy.com/about"
            nativeClick={handleCloseAllMenus}
            external
            openNewTab={false}
          >
            About
          </BaseLink>
          <BaseLink
            className="header__link"
            path="https://winessy.com/blog"
            nativeClick={handleCloseAllMenus}
            external
            openNewTab={false}
          >
            Blog
          </BaseLink>
          <BaseLink
            className="header__link"
            path="https://docs.winessy.com/"
            nativeClick={handleCloseAllMenus}
            external
          >
            FAQ
          </BaseLink> */}
        </nav>
        <div>
          {isMobile && <Web3Status onCloseMenu={handleCloseAllMenus} />}
          <hr className="header__separator" />
          <div className="text-center">
            <BaseLink
              className="header__link-social"
              path="https://www.linkedin.com/company/winessy/"
              external
            >
              <Linkedin />
            </BaseLink>
            <BaseLink
              className="header__link-social"
              path="https://www.facebook.com/WinessyNFT/"
              external
            >
              <Facebook />
            </BaseLink>
            <BaseLink
              className="header__link-social"
              path="https://twitter.com/Winessy_invest"
              external
            >
              <Twitter />
            </BaseLink>
          </div>
        </div>
      </div>
    );
  };

  const handleClickMenu = (type: string): void => {
    setShowMenu((prevState) => ({
      ...{
        mobile: false,
        user: false,
        notifications: false,
      },
      [type]: !prevState[type],
    }));
    NotificationsStore.setNotificationsRead(true);
  };

  const handleMouseEnter = () => {
    NotificationsStore.setNotificationsRead(true);
  };

  const handleCloseAllMenus = useCallback(
    () => setShowMenu({ user: false, mobile: false, notification: false }),
    [],
  );
  const handleCloseMenuByType = useCallback((type: string): void => {
    setShowMenu((prevState) => ({
      ...prevState,
      [type]: false,
    }));
  }, []);

  const handleClickLogout = useCallback(async () => {
    handleCloseMenuByType("mobile");
    await rootStore.authStore.submitLogout();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.value !== "" &&
      pathname !== routes.topInvested.path &&
      pathname !== routes.newItems.path &&
      pathname !== routes.allWin.path
    ) {
      navigate({
        pathname: routes.allWin.path,
        search: `?WineName=${e.target.value}`,
      });
    } else if (e.target.value === "") {
      searchParams.delete("WineName");
      setSearchParams(searchParams, { replace: true });
    } else {
      searchParams.set("WineName", e.target.value);
      setSearchParams(searchParams, { replace: true });
    }

    ReactGA.event("search");
  };

  const handleSelectCurrency = ({ value }: { value: string }) => {
    const newCurrency = value;
    currencyStore.changeCurrency(newCurrency);
  };

  return (
    <header className="header">
      {isTablet && (
        <div
          className={clsx("header__menu-item", { "header__menu-item--open": showMenu.mobile })}
          onClick={() => handleClickMenu("mobile")}
        >
          {showMenu.mobile ? <Close /> : <Menu />}
        </div>
      )}
      {renderMobileMenu()}
      <img
        className="cursor-pointer"
        src={isMobile ? logoMobileSrc : logoSrc}
        alt="Russian-Wine"
        onClick={() => navigate(routes.marketplace.path)}
      />
      <nav className="header__nav header__nav--desktop-view">
        <BaseSearch
          className="header__search-field"
          placeholder={isTablet ? "Поиск товаров..." : "Поиск товаров, коллекции..."}
          onChange={handleSearchChange}
        />
        <BaseLink className="header__link" path={routes.marketplace.path}>
          Торговая площадка
        </BaseLink>
        {/* <BaseLink
          className="header__link"
          path="https://winessy.com/about"
          external
          openNewTab={false}
        >
          About
        </BaseLink>
        <BaseLink
          className="header__link"
          path="https://winessy.com/blog"
          external
          openNewTab={false}
        >
          Blog
        </BaseLink>
        <BaseLink className="header__link" path="https://docs.winessy.com/" external>
          FAQ
        </BaseLink> */}
      </nav>
      <div className="header__right-menu">
        {isShowFilterMobileButton && (
          <div
            className={clsx("header__menu-item header__menu-item--filter", {
              "header__menu-item--open": rootStore.showFilters,
            })}
            onClick={() => rootStore.toggleShowFilters(!rootStore.showFilters)}
          >
            <Filter />
          </div>
        )}
        <div className="header__currency">
          <Select
            className="header__currency--select"
            options={options}
            defaultOptionIndex={getDefaultOptionIndex()}
            onOptionChange={handleSelectCurrency}
          />
        </div>
        <div
          id="for-user-login-hint"
          className={clsx("header__menu-item", {
            "header__menu-item--open": showMenu.user,
            "header__menu-item--ava": rootStore.authStore.isLogined,
            "header__menu-item--hoverable": !isTouchDevice(),
          })}
          onClick={() => (isTouchDevice() ? handleClickMenu("user") : null)}
          ref={userMenuRef}
        >
          {rootStore.authStore.isLogined ? (
            <>
              <img src={rootStore.authStore.selfInformation.image || noImageIconSrc} alt="user" />
              {rootStore.authStore.selfInformation.isKycApproved && renderApprovedKycIcon()}
              {showMenu.user && <Close className="close-icon" />}
            </>
          ) : showMenu.user ? (
            <Close />
          ) : (
            <User />
          )}
          {renderUserMenu()}
        </div>
        {!isMobile && (
          <span id="for-e-wallet-hint">
            <Web3Status />
          </span>
        )}
        <BasketLink />
        {!isMobile && (
          <div
            className={clsx("header__menu-item", {
              "header__menu-item--notify": !NotificationsStore.notificationsRead,
            })}
          >
            <div
              className={clsx("header__menu-item", {
                // "header__menu-item--open": showMenu.notifications,
                // "header__menu-item--ava": rootStore.authStore.isLogined,
                "header__menu-item--hoverable": !isTouchDevice(),
              })}
              onClick={() => (isTouchDevice() ? handleClickMenu("notifications") : null)}
              onMouseEnter={handleMouseEnter}
              ref={NotificationsMenuRef}
            >
              <Notification />
              <div
                className={clsx("header__dropdown", "header__dropdown-notifications", {
                  "header__dropdown-notifications--show": showMenu.notifications,
                })}
              >
                <NotificationsMenu />
              </div>
            </div>
            {/* <Notification />
          <NotificationsMenu /> */}
          </div>
        )}
      </div>
    </header>
  );

  function renderApprovedKycIcon() {
    return (
      <div className="header__approvedKyc">
        <CheckIcon />
      </div>
    );
  }
});

export default Header;
