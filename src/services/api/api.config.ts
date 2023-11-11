const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL
    : process.env.REACT_APP_API_URL_DEV;

export const DEFAULT_API_CONFIG: IApiConfig = {
  apiHost: API_URL || window.location.origin,
  baseUrl: "api",
  version: 1,
  timeout: 10000,
};
