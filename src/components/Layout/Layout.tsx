import React, { FC, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import { useWeb3React } from "@web3-react/core";

import { Header, Footer, PageLoader, AgeVerifiedModal } from "components";
import { useRootStore } from "context/RootStoreProvider";
import { AGE_VERIFIED_KEY } from "constants/index";
import { useModal } from "hooks";
import api from "services/api/api";
import { StripePaymentApi } from "services/goPayPayment/goPayPaymentApi";
import { routes } from "utils/router";
import "./Layout.styles.scss";

const Layout: FC = observer(({ children }) => {
  const { account } = useWeb3React();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isRoutesWithoutMaxWidth =
    [
      routes.login.path,
      routes.register.path,
      routes.forgotPassword.path,
      routes.resetPassword.path,
      routes.verifyAccount.path,
      routes.allWin.path,
      routes.topInvested.path,
      routes.newItems.path,
      routes.userSales.path,
      routes.profile.path,
      routes.profile.path + "/payment",
      routes.profile.path + "/favorites",
    ].includes(pathname) ||
    pathname.includes(routes.seller.path) ||
    pathname.includes("/user/");

  const { authStore } = useRootStore();
  const [shoAgeVerifiedModal] = useModal(<AgeVerifiedModal />, false);

  useEffect(() => {
    if (!localStorage.getItem(AGE_VERIFIED_KEY)) {
      shoAgeVerifiedModal();
    }

    if (pathname.includes("/adv_cash/return") && searchParams.has("id")) {
      (async function () {
        if (searchParams.get("id")) {
          try {
            const response = await StripePaymentApi.updateStatus(searchParams.get("id") as string);

            navigate(routes.sellerPurchased.path, {
              state: { fiatPaidStatus: response.response?.status },
            });
          } catch (error) {
            navigate(routes.marketplace.path);
            console.error(error);
          }
        }
      })();
    }

    authStore.fetchSelfInformation();
  }, []);

  useEffect(() => {
    if (authStore.isLogined && account) {
      api.post("/personal_area/callback/init_address", { address: account });
    }
  }, [authStore.isLogined, account]);

  if (authStore.isLoading) return <PageLoader />;

  return (
    <div className={clsx("layout", { "layout--notFullWidth": !isRoutesWithoutMaxWidth })}>
      <Header />
      <main className="layout__main">
        <div className="layout__container">{children}</div>
      </main>
      <Footer />
    </div>
  );
});

export default Layout;
