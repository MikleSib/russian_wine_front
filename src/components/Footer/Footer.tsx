import React, { FC, memo } from "react";
import { useLocation } from "react-router-dom";
import clsx from "clsx";

import { ReactComponent as LocationPin } from "assets/icons/location-pin.svg";
import { ReactComponent as Mail } from "assets/icons/mail.svg";
import { ReactComponent as Telegram } from "assets/icons/telegram.svg";
import { ReactComponent as Linkedin } from "assets/icons/linkedin-filled.svg";
import { ReactComponent as Facebook } from "assets/icons/facebook-filled.svg";
import { ReactComponent as Twitter } from "assets/icons/twitter-filled.svg";
import { ReactComponent as AmericanExpressIcon } from "assets/icons/american-express.svg";
import { ReactComponent as VisaIcon } from "assets/icons/visa.svg";
import { ReactComponent as MasterCardIcon } from "assets/icons/mastercard.svg";
import logoGraySrc from "assets/images/logo-grey.svg";
import { BaseLink } from "components/common";
import { routes } from "utils/router";

import "./Footer.styles.scss";

const Footer: FC = memo(() => {
  const { pathname } = useLocation();
  const isShifted =
    [
      routes.topInvested.path,
      routes.newItems.path,
      routes.allWin.path,
      routes.userSales.path,
    ].includes(pathname) ||
    pathname.includes(routes.seller.path) ||
    (pathname.startsWith("/user") && pathname.endsWith("marketplace")) ||
    (pathname.startsWith("/user") && pathname.endsWith("favorites")) ||
    (pathname.startsWith("/user") && pathname.endsWith("purchased"));

  const isAuthRoutes = [
    routes.login.path,
    routes.register.path,
    routes.forgotPassword.path,
    routes.resetPassword.path,
    routes.verifyAccount.path,
  ].includes(pathname);

  return (
    <footer
      className={clsx("footer container", {
        "footer--shifted": isShifted,
        "footer--auth": isAuthRoutes,
      })}
    >
      {!isAuthRoutes && <hr className="footer__separator" />}
      <div className="footer__nav">
        {/* <img src={logoGraySrc} alt="winessy" /> */}
        <div className="d-none d-md-block">
          <BaseLink className="footer__link" path={routes.marketplace.path}>
            Торговая площадка
          </BaseLink>
          {/* <BaseLink
            className="footer__link"
            path="https://winessy.com/about"
            external
            openNewTab={false}
          >
            About
          </BaseLink>
          <BaseLink
            className="footer__link"
            path="https://winessy.com/blog"
            external
            openNewTab={false}
          >
            Blog
          </BaseLink>
          <BaseLink className="footer__link" path="https://docs.winessy.com/" external>
            FAQ
          </BaseLink> */}
        </div>
      </div>
      <div className="footer__contacts">
        <div className="footer__contacts-row">
          <div className="footer__contact">
            <div className="footer__contact-icon">
              <LocationPin />
            </div>
            <div className="footer__contact-text">
              <span>
                Телефон
                <br />
                <a href="tel:+88005553555" className="footer__contact-link">
                  {" "}
                  +88005553555
                </a>
              </span>
            </div>
          </div>
          <div className="footer__contact">
            <div className="footer__contact-icon">
              <Mail />
            </div>
            <div className="footer__contact-text">
              <span>Вопросы и предложения</span>
              <BaseLink className="footer__contact-link" path="mailto:russianwine@mail.ru" external>
                russianwine@mail.ru
              </BaseLink>
            </div>
          </div>
          <div className="footer__contact">
            <div className="footer__contact-icon">
              <Telegram />
            </div>
            <div className="footer__contact-text">
              <span>Поддержка Telegram</span>
              <BaseLink className="footer__contact-link" path="https://t.me/russianwineru" external>
                @Вино России
              </BaseLink>
            </div>
          </div>
        </div>
        <div className="footer__contacts-row footer__contacts-row--right">
          {/* <div className="footer__creditCards">
            <AmericanExpressIcon />
            <MasterCardIcon className="mx-3" />
            <VisaIcon />
          </div> */}
          {/* <div className="d-flex">
            <BaseLink
              className="footer__link footer__link--social"
              path="https://www.linkedin.com/company/winessy/"
              external
            >
              <Linkedin />
            </BaseLink>
            <BaseLink
              className="footer__link footer__link--social"
              path="https://www.facebook.com/WinessyNFT/"
              external
            >
              <Facebook />
            </BaseLink>
            <BaseLink
              className="footer__link footer__link--social"
              path="https://twitter.com/Winessy_invest"
              external
            >
              <Twitter />
            </BaseLink>
          </div> */}
        </div>
      </div>
      <div className="footer__bottom">
        <span className="footer__copyright">
          Авторское право &copy; 2022-{new Date().getFullYear()} Вино России. Все права защищены.
        </span>
        {/* <div>
          <BaseLink
            className="footer__link footer__link--external"
            path="https://drive.google.com/file/d/1InmB8nEUj515TYqNiqRmDZGTCCByrfy-/view"
            external
          >
            Terms & conditions
          </BaseLink>
          <BaseLink
            className="footer__link footer__link--external"
            path="https://drive.google.com/file/d/1NTyvkD2dKAmzZL7MRfby5DwV6wZK4bxo/view"
            external
          >
            Privacy policy
          </BaseLink>
          <BaseLink
            className="footer__link footer__link--external"
            path="https://drive.google.com/file/d/161ZSpwkxiTAfVs97vpUXPWQFPZsh1zVh/view"
            external
          >
            Cookies policy
          </BaseLink>
        </div> */}
      </div>
    </footer>
  );
});

export default Footer;
