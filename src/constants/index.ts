import BigNumber from "bignumber.js";

export const INITIAL_PAGE = 1;
export const INITIAL_CARDS_PER_PAGE = 12;

export const WALLET_CONNECTOR_KEY = "WALLET_CONNECTOR_KEY";
export const DEFAULT_GAS_LIMIT = 500000;
export const DEFAULT_GAS_PRICE = 250;
export const VERY_FAST_INTERVAL = 5000;
export const FAST_INTERVAL = 10000;
export const SLOW_INTERVAL = 60000;

export const BIG_ZERO = new BigNumber(0);
export const BIG_TEN = new BigNumber(10);

export enum COLOR_OPTIONS {
  ALL = "all",
  RED = "red",
  WHITE = "white",
}

export enum TYPE_OPTIONS {
  ALL = "all",
  NEW = "new",
  TOP = "top",
}

export enum PAYMENT_METHOD {
  BANK_CARD = "bank_card",
  CRYPTOCURRENCY = "cryptocurrency",
}

export enum SUMSUB_STATUS {
  INIT = "init",
  PENDING = "pending",
  QUEUED = "queued",
  COMPLETED = "completed",
  ON_HOLD = "onHold",
}

export enum TOP_SALES_PERIOD {
  MONTH = 30,
  WEEK = 7,
  DAY = 1,
}

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  BSC = 56,
  BSCTest = 97,
  LOCALHOST = 1337,
  MUMBAI = 80001,
  POLYGON = 137,
}

type TokenType = {
  address: Record<number, string>;
  decimals: Record<number, number>;
};

export const tokens: Hash<TokenType> = {
  usdt: {
    address: {
      [ChainId.POLYGON]: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      [ChainId.BSCTest]: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
      [ChainId.MUMBAI]: "0x6871bAa67cf304F45e5cC6D8Cf3E35aC9CeBE2d8",
    },
    decimals: {
      [ChainId.POLYGON]: 6,
      [ChainId.BSCTest]: 18,
      [ChainId.MUMBAI]: 6,
    },
  },
};

export const ManagerForTestNet =
  process.env.MANAGER_FOR_TEST_NET || "0x932b189b91948D1e8b2bd19A9CefFef2df27231C";
// export const WineFirstSaleMarket =
//   process.env.WINE_FIRST_SALE_MARKET || "0xb651c3d1d6913c963d38874630a8bea164bc9a06";
export const NewWineFirstSaleMarket =
  process.env.NEW_WINE_FIRST_SALE_MARKET || "0x77d4bc292cde1fb5bd8bb61b35e495d3d24f7bf6";
export const WineMarketPlace =
  process.env.WINE_MARKET_PLACE || "0xe5B8B57833999719eb07f8e25Fbf82d3Cf2e25E1";
export const WineDeliveryService =
  process.env.WINE_DELIVERY_SERVICE || "0xfafcd18d4c295fe9590b9f247c5006ed512bce1f";

export const AGE_VERIFIED_KEY = "AGE_VERIFIED_KEY";
