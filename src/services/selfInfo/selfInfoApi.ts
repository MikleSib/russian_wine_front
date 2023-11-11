import { CancelToken } from "apisauce";

import api from "services/api/api";

const source = CancelToken.source();

export class SelfInfoApi {
  public static async getMarketSale({
    body,
  }: GeneralRequest<FilterParamsRequest>): TGeneralApiResponse<MarketSaleResponse> {
    return api.post("/personal_area/self_information/market_place", body, {
      cancelToken: source.token,
    });
  }

  public static async getFavorites({
    body,
  }: GeneralRequest<FilterParamsRequest>): TGeneralApiResponse<FirstSaleResponse> {
    return api.post("/personal_area/self_information/favorite_wine_pools", body, {
      cancelToken: source.token,
    });
  }

  public static getFollowersList({
    body,
  }: GeneralRequest<FilterParamsRequest>): TGeneralApiResponse<FollowersResponse> {
    return api.post("/personal_area/self_information/followers_list", body, {
      cancelToken: source.token,
    });
  }

  public static getFollowingList({
    body,
  }: GeneralRequest<FilterParamsRequest>): TGeneralApiResponse<FollowersResponse> {
    return api.post("/personal_area/self_information/following_list", body, {
      cancelToken: source.token,
    });
  }

  public static async getActivities({
    body,
  }: GeneralRequest<FilterParamsRequest>): TGeneralApiResponse<ActivityResponse> {
    return api.post("/personal_area/self_information/activities", body, {
      cancelToken: source.token,
    });
  }

  static checkAllowedTransfer({
    body,
  }: GeneralRequest<{
    poolId: number;
    tokenId: number;
  }>): TGeneralApiResponse<AllowedTransferResponse> {
    return api.post("/personal_area/concrete_bottle/internal/allowed_transfer", body, {
      cancelToken: source.token,
    });
  }

  static transferToOuter({
    body,
  }: GeneralRequest<{
    poolId: number;
    tokenId: number;
    address: string;
  }>): TGeneralApiResponse<AllowedTransferResponse> {
    return api.post("/personal_area/concrete_bottle/internal/transfer_to_outer", body, {
      cancelToken: source.token,
    });
  }
}
