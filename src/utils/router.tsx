import React, { FC, useEffect, ReactNode } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";

import {
  Register,
  VerifyAccount,
  Login,
  ForgotPassword,
  ResetPassword,
  Dashboard,
  MarketPlace,
  Product,
  SellerMarketplace,
  Activity,
  Profile,
  Personal,
  Payment,
  Favorites,
  Followers,
  UserSales,
  Purchase,
  Following,
  User,
  UserMarketplace,
  UserPurchase,
  UserFavorites,
  UserFollowers,
  UserFollowing,
  NotFound,
  Exchange,
} from "views";
import { useRootStore } from "context/RootStoreProvider";
import Basket from "views/Вasket/Basket";

type RequireAuthProps = {
  children: any;
  isLogged: boolean;
};

export const ScrollToTop: FC = ({ children }) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return <>{children}</>;
};

export function escapeBasePathFromRoute(name: string): string {
  return (name || "").replace("/app", "");
}

export const routes: Hash<TRoute<ReactNode>> = {
  login: {
    path: "/login",
    component: <Login />,
  },
  register: {
    path: "/register",
    component: <Register />,
  },
  forgotPassword: {
    path: "/forgot-password",
    component: <ForgotPassword />,
  },
  resetPassword: {
    path: "/reset-password",
    component: <ResetPassword />,
  },
  verifyAccount: {
    path: "/verify-account",
    component: <VerifyAccount />,
  },
  marketplace: {
    path: "/",
    component: <Dashboard />,
  },
  basket: {
    path: "/basket",
    component: <Basket />,
  },
  topInvested: {
    path: "/all-wines",
    component: <MarketPlace />,
  },
  newItems: {
    path: "/new-wines",
    component: <MarketPlace />,
  },
  allWin: {
    path: "/all-wine",
    component: <MarketPlace />,
  },
  userSales: {
    path: "/user-sales",
    component: <UserSales />,
  },
  product: {
    path: "/french-wines/:id",
    component: <Product />,
  },
  marketProduct: {
    path: "/:userName/:id",
    component: <Product />,
  },
  seller: {
    path: "/seller",
    component: <Navigate to={"/seller/marketplace"} replace />,
  },
  sellerMarketPlace: {
    path: "/seller/marketplace",
    component: <SellerMarketplace />,
    requireAuth: true,
  },
  sellerPurchased: {
    path: "/seller/purchased",
    component: <Purchase />,
    requireAuth: true,
  },
  sellerActivity: {
    path: "/seller/activity",
    component: <Activity />,
    requireAuth: true,
  },
  sellerExchange: {
    path: "/seller/exchange",
    component: <Exchange />,
    requireAuth: true,
  },
  user: {
    path: "/user/:nickname",
    component: <User />,
    children: [
      {
        path: "/user/:nickname/marketplace",
        component: <UserMarketplace />,
        // requireAuth: true,
      },
      {
        path: "/user/:nickname/purchased",
        component: <UserPurchase />,
        // requireAuth: true,
      },
      {
        path: "/user/:nickname/favorites",
        component: <UserFavorites />,
        // requireAuth: true,
      },
      {
        path: "/user/:nickname/followers",
        component: <UserFollowers />,
        // requireAuth: true,
      },
      {
        path: "/user/:nickname/following",
        component: <UserFollowing />,
        // requireAuth: true,
      },
    ],
  },
  profile: {
    path: "/profile",
    component: <Profile />,
    children: [
      {
        path: "",
        component: <Personal />,
        requireAuth: true,
      },
      {
        path: "payment",
        component: <Payment />,
        requireAuth: true,
      },
      {
        path: "favorites",
        component: <Favorites />,
        requireAuth: true,
      },
      {
        path: "followers",
        component: <Followers />,
        requireAuth: true,
      },
      {
        path: "following",
        component: <Following />,
        requireAuth: true,
      },
    ],
  },
  // about: {
  //   path: "/about",
  //   component: <About />,
  // },
};

const RequireAuth = ({ isLogged, children }: RequireAuthProps) => {
  const location = useLocation();
  return isLogged ? children : <Navigate to="/login" replace state={{ path: location.pathname }} />;
};

export const Router = observer((): JSX.Element => {
  const { authStore } = useRootStore();

  return (
    <Routes>
      {Object.values(routes).map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.requireAuth ? (
              <RequireAuth isLogged={authStore.isLogined}>{route.component}</RequireAuth>
            ) : (
              route.component
            )
          }
        >
          {(route.children ?? []).map((children) => (
            <Route
              key={`${route.path}${children.path}`}
              path={children.path}
              element={
                children.requireAuth ? (
                  <RequireAuth isLogged={authStore.isLogined}>{children.component}</RequireAuth>
                ) : (
                  children.component
                )
              }
            />
          ))}
        </Route>
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
});
