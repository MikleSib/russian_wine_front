import { routes } from "utils/router";
import logoSrc from "assets/images/logo-black.svg";

export const DEFAULT_META: TPageMeta = {
  title: "Winessy - Wine NFT Marketplace",
  description:
    "Winessy aims to unite wine admirers, vintage wine collectors from all over the world by providing a smart way of wine investing. Join us, to benefit from wine.",
  image: logoSrc,
};

export const getCustomMeta = (path: string): TPageMeta => {
  let basePath = "";

  if (path.includes("user") && path.endsWith("marketplace")) {
    basePath = "user/marketplace";
  } else if (path.includes("user") && path.endsWith("purchased")) {
    basePath = "user/purchased";
  } else if (path.includes("user") && path.endsWith("favorites")) {
    basePath = "user/favorites";
  } else if (path.includes("user") && path.endsWith("followers")) {
    basePath = "user/followers";
  } else if (path.includes("user") && path.endsWith("following")) {
    basePath = "user/following";
  } else {
    basePath = path;
  }

  try {
    switch (basePath) {
      case routes.login.path:
        return {
          title: "Authorization | Winessy - Wine NFT Marketplace",
        };
      case routes.register.path:
        return {
          title: "Create account | Winessy - Wine NFT Marketplace",
        };
      case routes.forgotPassword.path:
        return {
          title: "Password recovery | Winessy - Wine NFT Marketplace",
        };
      case routes.resetPassword.path:
        return {
          title: "Reset password | Winessy - Wine NFT Marketplace",
        };
      case routes.verifyAccount.path:
        return {
          title: "Account activation | Winessy - Wine NFT Marketplace",
        };
      case routes.sellerMarketPlace.path:
      case "user/marketplace":
        return {
          title: "Seller - Marketplace | Winessy - Wine NFT Marketplace",
        };
      case routes.sellerPurchased.path:
      case "user/purchased":
        return {
          title: "Seller - Purchased | Winessy - Wine NFT Marketplace",
        };
      case routes.sellerActivity.path:
        return {
          title: "Seller - Activity | Winessy - Wine NFT Marketplace",
        };
      case "user/favorites":
        return {
          title: "Seller - Favorites | Winessy - Wine NFT Marketplace",
        };
      case "user/followers":
        return {
          title: "Seller - Followers | Winessy - Wine NFT Marketplace",
        };
      case "user/following":
        return {
          title: "Seller - Following | Winessy - Wine NFT Marketplace",
        };
      case routes.profile.path:
        return {
          title: "Profile | Winessy - Wine NFT Marketplace",
        };
      case `${routes.profile.path}/payment`:
        return {
          title: "Profile - Payment | Winessy - Wine NFT Marketplace",
        };
      case `${routes.profile.path}/favorites`:
        return {
          title: "Profile - Favorites | Winessy - Wine NFT Marketplace",
        };
      case `${routes.profile.path}/followers`:
        return {
          title: "Profile - Followers | Winessy - Wine NFT Marketplace",
        };
      case `${routes.profile.path}/following`:
        return {
          title: "Profile - Following | Winessy - Wine NFT Marketplace",
        };
      case routes.marketplace.path:
        return {
          title: "Dashboard | Winessy - Wine NFT Marketplace",
        };
      case routes.topInvested.path:
        return {
          title: "Top Invested | Winessy - Wine NFT Marketplace",
        };
      case routes.newItems.path:
        return {
          title: "New Items | Winessy - Wine NFT Marketplace",
        };
      case routes.allWin.path:
        return {
          title: "All Wine | Winessy - Wine NFT Marketplace",
        };
      case routes.userSales.path:
        return {
          title: "User Sales | Winessy - Wine NFT Marketplace",
        };
      default:
        return DEFAULT_META;
    }
  } catch {
    return DEFAULT_META;
  }
};
