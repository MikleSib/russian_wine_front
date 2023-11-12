import { routes } from "utils/router";
// import logoSrc from "assets/images/logo-black.svg";

export const DEFAULT_META: TPageMeta = {
  title: "Вино-России - Торговая площадка",
  description:
    "Вино-России цель - объединить поклонников вина, коллекционеров марочных вин со всего мира, предложив разумный способ инвестирования в вино. Присоединяйтесь к нам, чтобы насладиться вином."
  //image: logoSrc,
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
          title: "Авторизация | Вино-России - Торговая площадка",
        };
      case routes.register.path:
        return {
          title: "Создать аккаунт | Вино-России - Торговая площадка",
        };
      case routes.forgotPassword.path:
        return {
          title: "Восстановление пароля | Вино-России - Торговая площадка",
        };
      case routes.resetPassword.path:
        return {
          title: "Сбросить пароль | Вино-России - Торговая площадка",
        };
      case routes.verifyAccount.path:
        return {
          title: "Верификация аккаунта | Вино-России - Торговая площадка",
        };
      case routes.sellerMarketPlace.path:
      case "user/marketplace":
        return {
          title: "Продажи - Торговая площадка | Вино-России - Торговая площадка",
        };
      case routes.sellerPurchased.path:
      case "user/purchased":
        return {
          title: "Продажи - Ваши товары | Вино-России - Торговая площадка",
        };
      case routes.sellerActivity.path:
        return {
          title: "Продажи - Ваши действия | Вино-России - Торговая площадка",
        };
      case "user/favorites":
        return {
          title: "Продажи - Подписки | Вино-России - Торговая площадка",
        };
      case "user/followers":
        return {
          title: "Продажи - Подписчики | Вино-России - Торговая площадка",
        };
      case "user/following":
        return {
          title: "Продажи - Подписчики | Вино-России - Торговая площадка",
        };
      case routes.profile.path:
        return {
          title: "Профиль | Вино-России - Торговая площадка",
        };
      case `${routes.profile.path}/payment`:
        return {
          title: "Профиль - Способ оплаты | Вино-России - Торговая площадка",
        };
      case `${routes.profile.path}/favorites`:
        return {
          title: "Профиль - Подписки | Вино-России - Торговая площадка",
        };
      case `${routes.profile.path}/followers`:
        return {
          title: "Профиль - Подписчики | Вино-России - Торговая площадка",
        };
      case `${routes.profile.path}/following`:
        return {
          title: "Профиль - Подписки | Вино-России - Торговая площадка",
        };
      case routes.marketplace.path:
        return {
          title: "Главная страница | Вино-России - Торговая площадка",
        };
      case routes.topInvested.path:
        return {
          title: "Топ инвестиций | Вино-России - Торговая площадка",
        };
      case routes.newItems.path:
        return {
          title: "Новые товары | Вино-России - Торговая площадка",
        };
      case routes.allWin.path:
        return {
          title: "Все Вина | Вино-России - Торговая площадка",
        };
      case routes.userSales.path:
        return {
          title: "Продажи пользоватей | Вино-России - Винный рынок NFT",
        };
      default:
        return DEFAULT_META;
    }
  } catch {
    return DEFAULT_META;
  }
};
