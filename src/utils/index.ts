import BigNumber from "bignumber.js";

import { BIG_TEN } from "../constants";
import { Form } from "../stores/Form";

export function capitalize(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

export const isTouchDevice = (): boolean =>
  !!("ontouchstart" in window || navigator.maxTouchPoints);

export function pascalCaseToCamel(str: string): string {
  return str.replace(/(-[a-z])/g, (group) => group.toUpperCase().replace("-", ""));
}

export function camelCaseToTile(str: string): string {
  return str
    .replace(/([A-Z])/, (match) => ` ${match}`)
    .replace(/^./, (match) => match.toUpperCase());
}

export const disableReactDevTools = (): void => {
  const noop = (): void => undefined;
  // eslint-disable-next-line no-underscore-dangle
  const DEV_TOOLS = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (typeof DEV_TOOLS === "object") {
    for (const [key, value] of Object.entries(DEV_TOOLS)) {
      DEV_TOOLS[key] = typeof value === "function" ? noop : null;
    }
  }
};

export const formatAddress = (address: string, digits = 5): string =>
  `${address.slice(0, digits)}...${address.slice(-4)}`;

export const getBalanceAmount = (amount: BigNumber, decimals = 18): BigNumber => {
  return new BigNumber(amount).dividedBy(BIG_TEN.pow(decimals));
};

export const getFullDisplayBalance = (
  balance: BigNumber,
  decimals = 18,
  decimalsToAppear = 0,
): string => {
  return getBalanceAmount(balance, decimals).toFixed(decimalsToAppear);
};

export const getDecimalAmount = (amount: BigNumber, decimals = 18): BigNumber => {
  return new BigNumber(amount).times(BIG_TEN.pow(decimals));
};

export const getGasPriceInWei = (amountInGwei: number): BigNumber => {
  return getDecimalAmount(new BigNumber(amountInGwei), 9);
};

export function resetCaptcha(form?: Form): void {
  try {
    if (window.GTest) {
      window.GTest.reset();
    }
  } catch (err) {
    console.error(err);
  }

  if (form) {
    form.setFieldValue({ field: "captcha", value: "" });
    form.clearErrors("captcha");
  }
}

export function sleep(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

export function isImageFile(type: string): boolean {
  return /\(gif|jpe?g|png|svg/.test(type);
}

export function isMaxFileSize(size: number, fileMaxSizeMB: number): boolean {
  if (!size) return false;

  return size > fileMaxSizeMB * 1024 * 1024;
}

export const formatDateTime = ({
  value,
  format = ["d", "m", "y"],
  time = false,
}: {
  value: number;
  format?: string[];
  time?: boolean;
}) => {
  const date = new Date(value);
  const formatData: Record<string, string> = {
    y: new Intl.DateTimeFormat("en", { year: "numeric" }).format(date),
    m: new Intl.DateTimeFormat("en", { month: "2-digit" }).format(date),
    d: new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date),
  };
  const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return `${format.map((el) => formatData[el]).join(".")}${time ? ` ${hours}:${minutes}` : ""}`;
};

export const generateUserId = () => {
  const random = Math.floor(Math.random() * 10000);
  return random;
};

export function processForm({ payDeliveryUrl, params }: StripeBuyTokenResponse): void {
  // const form: HTMLFormElement = document.createElement("form");

  // Object.entries(params).forEach(([key, value]) => {
  //   const input: HTMLInputElement = document.createElement("input");
  //   input.name = key;
  //   input.value = value;
  //   form.appendChild(input);
  // });

  // form.method = "GET";
  // form.action = gateWayUrl;
  // form.classList.add("d-none");

  // document.body.appendChild(form);
  // form.submit();

  window.open(payDeliveryUrl);
}

export function formatPrice(
  price: string | number,
  currency: string,
  currencyRate: number,
): string {
  if (currency === "USD") {
    return price.toString();
  } else {
    // convert price from usd to another currency
    const result = (Math.ceil(Number(price) * currencyRate * 100) / 100).toString();

    return result.substring(0, result.toString().indexOf(".") + 3);
  }
}
