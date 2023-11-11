import { CancelToken } from "apisauce";

import api from "services/api/api";

const source = CancelToken.source();

export class UserInfoApi {
  public static async getMarketSale({
    body,
  }: GeneralRequest<
    FilterParamsRequest & { nickname: string }
  >): TGeneralApiResponse<MarketSaleResponse> {
    return api.post("/public/show_user/market_sale", body, {
      cancelToken: source.token,
    });
  }

  public static async getFavorites({
    body,
  }: GeneralRequest<
    FilterParamsRequest & { nickname: string }
  >): TGeneralApiResponse<FirstSaleResponse> {
    return api.post("/public/show_user/favorite_wine_pools", body, {
      cancelToken: source.token,
    });
  }

  public static async getPurchased({
    body,
  }: GeneralRequest<
    FilterParamsRequest & { nickname: string }
  >): TGeneralApiResponse<PurchaseResponse> {
    return api.post("/public/show_user/purchased", body, {
      cancelToken: source.token,
    });
  }

  public static getFollowersList({
    body,
  }: GeneralRequest<
    FilterParamsRequest & { nickname: string }
  >): TGeneralApiResponse<FollowersResponse> {
    return api.post("/public/show_user/followers_list", body, {
      cancelToken: source.token,
    });
  }

  public static getFollowingList({
    body,
  }: GeneralRequest<
    FilterParamsRequest & { nickname: string }
  >): TGeneralApiResponse<FollowersResponse> {
    return api.post("/public/show_user/following_list", body, {
      cancelToken: source.token,
    });
  }
}
